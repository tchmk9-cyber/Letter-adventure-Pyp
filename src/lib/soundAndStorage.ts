import type { PypThemeId, YearLevel } from "../data/pypData";

/* ---------------- SYNTHESIZED SOUND EFFECTS ---------------- */
let audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

function playTone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.18): void {
  try {
    const c = getAudioCtx();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime + start);
    g.gain.setValueAtTime(0.0001, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(c.currentTime + start);
    o.stop(c.currentTime + start + dur + 0.04);
  } catch {
    // ignore audio context restrictions
  }
}

export const sfx = {
  tap: () => playTone(520, 0, 0.1, "triangle", 0.15),
  correct: () => {
    playTone(523, 0, 0.14, "triangle", 0.18);
    playTone(659, 0.09, 0.14, "triangle", 0.18);
    playTone(784, 0.18, 0.24, "triangle", 0.2);
  },
  wrong: () => playTone(190, 0, 0.26, "sawtooth", 0.13),
  coin: () => {
    playTone(880, 0, 0.08, "square", 0.13);
    playTone(1175, 0.08, 0.15, "square", 0.13);
  },
  fanfare: () => {
    [523, 659, 784, 1046].forEach((f, i) => playTone(f, i * 0.11, 0.28, "triangle", 0.2));
  },
};

/* ---------------- SPEECH & TEACHER VOICE STUDIO ENGINE ---------------- */
const VOICE_PREF_KEY = "la-pyp-voice-pref-v1";
const CUSTOM_CLIPS_KEY = "la-pyp-custom-clips-v1";

export const SPEECH_PREF: { voiceURI: string; rate: number } = { voiceURI: "", rate: 0.8 };
try {
  const raw = window.localStorage.getItem(VOICE_PREF_KEY);
  if (raw) {
    const p = JSON.parse(raw) as { voiceURI?: string; rate?: number };
    if (typeof p.voiceURI === "string") SPEECH_PREF.voiceURI = p.voiceURI;
    if (typeof p.rate === "number" && p.rate >= 0.5 && p.rate <= 1.2) SPEECH_PREF.rate = p.rate;
  }
} catch {
  // ignore
}

export function saveSpeechPref(): void {
  try {
    window.localStorage.setItem(VOICE_PREF_KEY, JSON.stringify(SPEECH_PREF));
  } catch {
    // ignore
  }
}

export function loadCustomClips(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(CUSTOM_CLIPS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function saveCustomClip(key: string, dataUrl: string): Record<string, string> {
  const all = loadCustomClips();
  all[key] = dataUrl;
  try {
    window.localStorage.setItem(CUSTOM_CLIPS_KEY, JSON.stringify(all));
  } catch {
    // ignore quota errors
  }
  return all;
}

export function deleteCustomClip(key: string): Record<string, string> {
  const all = loadCustomClips();
  delete all[key];
  try {
    window.localStorage.setItem(CUSTOM_CLIPS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
  return all;
}

const PREFERRED_VOICES = [
  "google us english",
  "google uk english female",
  "microsoft aria",
  "microsoft jenny",
  "natural",
  "neural",
  "samantha",
  "daniel",
  "karen",
  "google uk english male",
  "microsoft libby",
  "microsoft sonia",
  "microsoft guy",
  "serena",
  "moira",
  "tessa",
  "allison",
  "ava",
];

export function hasSpeech(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

function scoreVoice(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase();
  const lang = v.lang.replace("_", "-").toLowerCase();
  let s = 0;
  const idx = PREFERRED_VOICES.findIndex((p) => n.indexOf(p) >= 0);
  if (idx >= 0) s += 200 - idx * 5;
  if (n.indexOf("natural") >= 0 || n.indexOf("neural") >= 0 || n.indexOf("online") >= 0 || n.indexOf("enhanced") >= 0 || n.indexOf("premium") >= 0) {
    s += 40;
  }
  if (lang === "en-us") s += 12;
  else if (lang === "en-gb") s += 10;
  else if (lang.indexOf("en") === 0) s += 4;
  if (n.indexOf("espeak") >= 0 || n.indexOf("compact") >= 0 || n.indexOf("novelty") >= 0) s -= 100;
  return s;
}

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  if (!hasSpeech()) return [];
  try {
    return window.speechSynthesis
      .getVoices()
      .filter((v: SpeechSynthesisVoice) => v.lang.replace("_", "-").toLowerCase().indexOf("en") === 0)
      .sort((a: SpeechSynthesisVoice, b: SpeechSynthesisVoice) => scoreVoice(b) - scoreVoice(a));
  } catch {
    return [];
  }
}

export function getChosenVoice(): SpeechSynthesisVoice | null {
  const vs = getEnglishVoices();
  if (SPEECH_PREF.voiceURI) {
    const match = vs.find((v) => v.voiceURI === SPEECH_PREF.voiceURI);
    if (match) return match;
  }
  return vs.length > 0 ? vs[0] : null;
}

let pendingUtterances: string[] | null = null;
let speakTimer: number | null = null;

function speakUtterancesNow(parts: string[]): void {
  const s = window.speechSynthesis;
  const v = getChosenVoice();
  parts.forEach((text) => {
    const u = new SpeechSynthesisUtterance(text);
    if (v) {
      u.voice = v;
      u.lang = v.lang;
    } else {
      u.lang = "en-US";
    }
    u.rate = SPEECH_PREF.rate;
    u.pitch = 1.0;
    u.volume = 1.0;
    s.speak(u);
  });
}

if (hasSpeech()) {
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", () => {
      if (pendingUtterances) {
        const p = pendingUtterances;
        pendingUtterances = null;
        speakUtterancesNow(p);
      }
    });
  } catch {
    // ignore
  }
}

export function speak(parts: string | string[], clipKey?: string): void {
  if (clipKey) {
    const clips = loadCustomClips();
    if (clips[clipKey]) {
      try {
        const audio = new Audio(clips[clipKey]);
        audio.play();
        return;
      } catch {
        // fall through to browser speech
      }
    }
  }
  if (!hasSpeech()) return;
  const list = Array.isArray(parts) ? parts : [parts];
  try {
    const s = window.speechSynthesis;
    s.cancel();
    if (speakTimer) window.clearTimeout(speakTimer);
    if (s.getVoices().length === 0) {
      pendingUtterances = list;
      speakTimer = window.setTimeout(() => {
        if (pendingUtterances) {
          const p = pendingUtterances;
          pendingUtterances = null;
          speakUtterancesNow(p);
        }
      }, 650);
      return;
    }
    pendingUtterances = null;
    speakTimer = window.setTimeout(() => speakUtterancesNow(list), 55);
  } catch {
    // ignore
  }
}

/* ---------------- PROFILES & PROGRESS STORAGE ---------------- */
export interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
  theme: "princess" | "king";
  year: YearLevel;
  stars: number;
  points: number;
  masteredLetters: string[];
  needsPracticeLetters: string[];
  pypStars: Record<PypThemeId, number>;
  activitiesCount: number;
  minutesPracticed: number;
  lastActive: string;
}

const PROFILES_KEY = "la-pyp-profiles-v1";
const ACTIVE_ID_KEY = "la-pyp-active-id-v1";
const PIN_KEY = "la-pyp-parent-pin-v1";

const DEFAULT_PROFILES: ChildProfile[] = [
  {
    id: "mia",
    name: "Mia",
    avatar: "bunny",
    theme: "princess",
    year: "y1",
    stars: 35,
    points: 560,
    masteredLetters: ["A", "B", "C", "M", "S", "T"],
    needsPracticeLetters: ["Q", "X"],
    pypStars: {
      "who-we-are": 6,
      "where-we-are": 5,
      "express-ourselves": 7,
      "world-works": 6,
      "organize-ourselves": 5,
      "sharing-planet": 6,
    },
    activitiesCount: 18,
    minutesPracticed: 42,
    lastActive: new Date().toISOString(),
  },
  {
    id: "omar",
    name: "Omar",
    avatar: "lion",
    theme: "king",
    year: "y2",
    stars: 28,
    points: 420,
    masteredLetters: ["A", "B", "D", "F", "L", "R"],
    needsPracticeLetters: ["V", "Z"],
    pypStars: {
      "who-we-are": 5,
      "where-we-are": 6,
      "express-ourselves": 4,
      "world-works": 5,
      "organize-ourselves": 4,
      "sharing-planet": 4,
    },
    activitiesCount: 14,
    minutesPracticed: 35,
    lastActive: new Date().toISOString(),
  },
  {
    id: "noor",
    name: "Noor",
    avatar: "oryx",
    theme: "princess",
    year: "y3",
    stars: 40,
    points: 610,
    masteredLetters: ["A", "C", "E", "G", "H", "K", "N", "P", "S"],
    needsPracticeLetters: ["Y"],
    pypStars: {
      "who-we-are": 7,
      "where-we-are": 8,
      "express-ourselves": 6,
      "world-works": 7,
      "organize-ourselves": 6,
      "sharing-planet": 6,
    },
    activitiesCount: 22,
    minutesPracticed: 55,
    lastActive: new Date().toISOString(),
  },
  {
    id: "zaid",
    name: "Zaid",
    avatar: "falcon",
    theme: "king",
    year: "y4",
    stars: 45,
    points: 720,
    masteredLetters: ["A", "B", "C", "D", "E", "F", "G", "H", "L", "M", "R", "S", "T"],
    needsPracticeLetters: [],
    pypStars: {
      "who-we-are": 8,
      "where-we-are": 7,
      "express-ourselves": 7,
      "world-works": 8,
      "organize-ourselves": 7,
      "sharing-planet": 8,
    },
    activitiesCount: 26,
    minutesPracticed: 68,
    lastActive: new Date().toISOString(),
  },
];

export function loadProfiles(): ChildProfile[] {
  try {
    const raw = window.localStorage.getItem(PROFILES_KEY);
    if (!raw) return DEFAULT_PROFILES;
    const parsed = JSON.parse(raw) as ChildProfile[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROFILES;
  } catch {
    return DEFAULT_PROFILES;
  }
}

export function saveProfiles(list: ChildProfile[]): void {
  try {
    window.localStorage.setItem(PROFILES_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function loadActiveProfileId(): string {
  try {
    return window.localStorage.getItem(ACTIVE_ID_KEY) || "mia";
  } catch {
    return "mia";
  }
}

export function saveActiveProfileId(id: string): void {
  try {
    window.localStorage.setItem(ACTIVE_ID_KEY, id);
  } catch {
    // ignore
  }
}

export function loadParentPin(): string | null {
  try {
    return window.localStorage.getItem(PIN_KEY);
  } catch {
    return null;
  }
}

export function saveParentPin(pin: string): void {
  try {
    window.localStorage.setItem(PIN_KEY, pin);
  } catch {
    // ignore
  }
}
