// Synthesized sound effects + voice helpers
import { api } from "@/lib/api";

let ctx;
function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq, start, dur, type = "sine", gain = 0.2) {
  const c = ac();
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
  o.stop(c.currentTime + start + dur + 0.05);
}

export const sfx = {
  tap: () => tone(520, 0, 0.12, "triangle", 0.18),
  correct: () => {
    tone(523, 0, 0.15, "triangle", 0.2);
    tone(659, 0.1, 0.15, "triangle", 0.2);
    tone(784, 0.2, 0.25, "triangle", 0.22);
  },
  wrong: () => tone(180, 0, 0.3, "sawtooth", 0.15),
  coin: () => {
    tone(880, 0, 0.08, "square", 0.15);
    tone(1175, 0.08, 0.15, "square", 0.15);
  },
  fanfare: () => {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.3, "triangle", 0.22));
  },
};

// Voice: parent's own recordings first, then OpenAI TTS, then SpeechSynthesis
const audioCache = {};
let customVoices = {};
export function setCustomVoices(map) { customVoices = map || {}; }

export async function speak(text, key) {
  if (key && customVoices[key]) {
    try {
      const a = new Audio(`${process.env.REACT_APP_BACKEND_URL}${customVoices[key]}`);
      await a.play();
      return;
    } catch (e) { /* fall through to AI */ }
  }
  try {
    const k = text.toLowerCase();
    let url = audioCache[k];
    if (!url) {
      const { data } = await api.post("/tts", { text });
      url = data.audio;
      audioCache[k] = url;
    }
    const audio = new Audio(url);
    await audio.play();
    return;
  } catch (e) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.85;
      u.pitch = 1.1;
      window.speechSynthesis.speak(u);
    } catch (_) {}
  }
}
