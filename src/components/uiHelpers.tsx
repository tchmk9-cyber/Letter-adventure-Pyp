import { useState, useEffect, useMemo, useGrokTheme } from "../grok";
import type { CSSProperties, ChangeEvent } from "../grok";
import type { YearLevel } from "../data/pypData";
import {
  SPEECH_PREF,
  saveSpeechPref,
  hasSpeech,
  getEnglishVoices,
  speak,
  sfx,
} from "../lib/soundAndStorage";

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

export function filterByYear<T extends { year: "y1" | "y2" | "y3" | "y4" }>(items: T[], year: YearLevel): T[] {
  if (year === "all") return items;
  const matching = items.filter((it) => it.year === year);
  return matching.length > 0 ? matching : items;
}

export function usePalette(): string[] {
  const t = useGrokTheme();
  return useMemo(() => {
    const out: string[] = [];
    [...t.chart, ...t.dataviz.categorical].forEach((c: string) => {
      if (out.indexOf(c) < 0) out.push(c);
    });
    return out;
  }, [t]);
}

export function useBtn() {
  const t = useGrokTheme();
  return (bg: string, fg: string, extra?: CSSProperties): CSSProperties => ({
    background: bg,
    color: fg,
    border: `2px solid ${t.border.default}`,
    borderRadius: 16,
    padding: "12px 20px",
    fontSize: 20,
    fontWeight: 700,
    minHeight: 48,
    minWidth: 48,
    cursor: "pointer",
    fontFamily: t.font.family,
    touchAction: "manipulation",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxSizing: "border-box",
    ...(extra || {}),
  });
}

export function RewardBanner({
  message,
  points,
  stars,
  onClose,
}: {
  message: string;
  points: number;
  stars: number;
  onClose: () => void;
}) {
  const t = useGrokTheme();
  const btn = useBtn();
  if (!message) return null;
  return (
    <div
      data-testid="reward-banner"
      style={{
        border: `3px solid ${t.text.success}`,
        borderRadius: 20,
        padding: "16px 20px",
        background: t.bg.elevated,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700 }}>
        <span style={{ fontSize: 34 }}>🎉</span>
        <span>{message}</span>
        {points > 0 && <span style={{ color: t.text.warning }}>+{points} 🪙</span>}
        {stars > 0 && <span style={{ color: t.text.success }}>+{stars} ⭐</span>}
      </div>
      <button data-testid="reward-close-btn" onClick={onClose} style={btn(t.text.success, t.text.onColor, { padding: "8px 18px" })}>
        Awesome! ▶
      </button>
    </div>
  );
}

export function VoiceSettingsPanel({
  onClose,
  onOpenStudio,
}: {
  onClose: () => void;
  onOpenStudio: () => void;
}) {
  const t = useGrokTheme();
  const btn = useBtn();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => getEnglishVoices());
  const [uri, setUri] = useState<string>(SPEECH_PREF.voiceURI);
  const [rate, setRate] = useState<number>(SPEECH_PREF.rate);

  useEffect(() => {
    if (!hasSpeech()) return;
    const update = () => setVoices(getEnglishVoices());
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    const timer = window.setTimeout(update, 600);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", update);
      window.clearTimeout(timer);
    };
  }, []);

  const chooseVoice = (v: string) => {
    setUri(v);
    SPEECH_PREF.voiceURI = v;
    saveSpeechPref();
    speak(["A.", "Apple."]);
  };

  const changeRate = (r: number) => {
    setRate(r);
    SPEECH_PREF.rate = r;
    saveSpeechPref();
  };

  const best = voices.length > 0 ? voices[0] : null;

  return (
    <div
      id="voice-settings"
      data-testid="voice-settings-panel"
      style={{
        border: `2px solid ${t.border.default}`,
        borderRadius: 20,
        padding: 18,
        background: t.bg.elevated,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>🔊 Classroom Voice & Audio Settings</div>
        <button
          data-testid="open-voice-studio-btn"
          onClick={() => {
            sfx.tap();
            onOpenStudio();
          }}
          style={btn(t.fill.accent, t.text.onColor)}
        >
          🎤 Record Teacher Voice
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 18, fontWeight: 600, color: t.text.secondary }}>
          English Read-Aloud Voice
          <select
            data-testid="voice-select"
            value={uri}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => chooseVoice(e.target.value)}
            style={{
              fontSize: 18,
              padding: "10px 12px",
              borderRadius: 12,
              border: `1px solid ${t.border.default}`,
              background: t.bg.base,
              color: t.text.primary,
              minHeight: 48,
            }}
          >
            <option value="">Best Clear Voice{best ? ` (${best.name})` : ""}</option>
            {voices.map((v: SpeechSynthesisVoice) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 18, fontWeight: 600, color: t.text.secondary }}>
          Speaking Speed: {rate.toFixed(2)}× {rate <= 0.75 ? "(Slow & Clear)" : "(Normal)"}
          <input
            data-testid="voice-rate-slider"
            type="range"
            min={0.5}
            max={1.1}
            step={0.05}
            value={rate}
            onChange={(e: ChangeEvent<HTMLInputElement>) => changeRate(parseFloat(e.target.value))}
            style={{ width: "100%", minHeight: 48, accentColor: t.fill.accent }}
          />
        </label>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button onClick={() => speak(["Welcome to Letter Adventure!", "A is for Apple."])} style={btn(t.fill.primary, t.text.onPrimary)}>
          🔊 Test Voice
        </button>
        <button
          onClick={() => {
            chooseVoice("");
            changeRate(0.8);
          }}
          style={btn(t.fill.secondary, t.text.primary)}
        >
          Reset Default
        </button>
        <button onClick={onClose} style={btn(t.fill.secondary, t.text.primary)}>
          Close
        </button>
      </div>
    </div>
  );
}
