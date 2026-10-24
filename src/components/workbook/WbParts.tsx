/* Small reusable pieces for the Year 1 Workbook: read-aloud, choices, answers, drawing. */
import { useState, useRef, useEffect } from "../../grok";
import type { ChangeEvent, PointerEvent } from "../../grok";
import type { WbUnit } from "../../data/year1Workbook";
import { wbSpeak, wbSfx, useWbTheme } from "./wbEnv";
import { useWbBtn, useWbCard } from "./wbCore";

export interface WbStageProps {
  unit: WbUnit;
  seed: number;
  resp: Record<string, string>;
  setResp: (key: string, value: string) => void;
}

export function WbSpeak({ text, testId }: { text: string | string[]; testId?: string }) {
  const t = useWbTheme();
  const btn = useWbBtn();
  return (
    <button
      className="wb-noprint"
      data-testid={testId || "wb-speak"}
      aria-label="Read aloud"
      onClick={() => wbSpeak(text)}
      style={btn(t.fill.secondary, t.text.primary, { padding: 6, fontSize: 26, flex: "0 0 auto" })}
    >
      🔊
    </button>
  );
}

export function WbPrompt({ text, emoji, big }: { text: string; emoji?: string; big?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <WbSpeak text={text} />
      {emoji && <span style={{ fontSize: big ? 44 : 32 }}>{emoji}</span>}
      <span style={{ fontSize: big ? 28 : 23, fontWeight: 700, flex: "1 1 200px" }}>{text}</span>
    </div>
  );
}

export function WbHeading({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <WbSpeak text={text} />
      <span style={{ fontSize: 30, fontWeight: 800 }}>
        {emoji} {text}
      </span>
    </div>
  );
}

export function WbChoices({
  options,
  selected,
  onPick,
  correct,
  testPrefix,
}: {
  options: string[];
  selected: string[];
  onPick: (o: string) => void;
  correct?: string;
  testPrefix?: string;
}) {
  const t = useWbTheme();
  const btn = useWbBtn();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {options.map((o: string, i: number) => {
        const on = selected.indexOf(o) >= 0;
        const good = correct !== undefined && on && o === correct;
        const bad = correct !== undefined && on && o !== correct;
        const bg = good ? t.text.success : bad ? t.text.warning : on ? t.fill.accent : t.bg.base;
        return (
          <button
            key={o}
            data-testid={testPrefix ? `${testPrefix}-${i}` : undefined}
            onClick={() => {
              wbSfx.tap();
              onPick(o);
            }}
            style={btn(bg, on ? t.text.onColor : t.text.primary, { flex: "1 1 180px" })}
          >
            {good ? "✅ " : bad ? "🔁 " : ""}
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function WbAnswer({
  id,
  resp,
  setResp,
  placeholder,
}: {
  id: string;
  resp: Record<string, string>;
  setResp: (key: string, value: string) => void;
  placeholder?: string;
}) {
  const t = useWbTheme();
  const btn = useWbBtn();
  const [rec, setRec] = useState<boolean>(false);
  const mr = useRef<MediaRecorder | null>(null);
  const canRec = typeof window !== "undefined" && typeof (window as unknown as { MediaRecorder?: unknown }).MediaRecorder !== "undefined";
  const audio = resp[`${id}:audio`];

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const m = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      m.ondataavailable = (e: BlobEvent) => chunks.push(e.data);
      m.onstop = () => {
        stream.getTracks().forEach((tr: MediaStreamTrack) => tr.stop());
        const reader = new FileReader();
        reader.onload = () => setResp(`${id}:audio`, String(reader.result || ""));
        reader.readAsDataURL(new Blob(chunks, { type: m.mimeType || "audio/webm" }));
        setRec(false);
      };
      mr.current = m;
      m.start();
      setRec(true);
      window.setTimeout(() => {
        if (m.state === "recording") m.stop();
      }, 15000);
    } catch {
      setRec(false);
    }
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <input
        data-testid={`wb-answer-${id}`}
        value={resp[id] || ""}
        placeholder={placeholder || "Type or say your idea…"}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setResp(id, e.target.value)}
        style={{
          flex: "1 1 240px",
          minHeight: 56,
          fontSize: 22,
          padding: "10px 14px",
          borderRadius: 14,
          border: `2px dashed ${t.border.default}`,
          background: t.bg.base,
          color: t.text.primary,
          fontFamily: t.font.family,
        }}
      />
      {canRec && !rec && (
        <button className="wb-noprint" onClick={start} style={btn(t.fill.secondary, t.text.primary, { fontSize: 20 })}>
          🎤 Record
        </button>
      )}
      {rec && (
        <button className="wb-noprint" onClick={() => mr.current?.stop()} style={btn(t.text.warning, t.text.onColor, { fontSize: 20 })}>
          ⏹️ Stop
        </button>
      )}
      {audio && (
        <button className="wb-noprint" onClick={() => new Audio(audio).play().catch(() => undefined)} style={btn(t.fill.secondary, t.text.primary, { fontSize: 20 })}>
          ▶️ Play
        </button>
      )}
    </div>
  );
}

const WB_INKS = ["rgb(30, 41, 59)", "rgb(37, 99, 235)", "rgb(220, 38, 38)", "rgb(22, 163, 74)", "rgb(234, 88, 12)", "rgb(124, 58, 237)"];

export function WbDrawPad({ id, resp, setResp, label }: { id: string; resp: Record<string, string>; setResp: (k: string, v: string) => void; label?: string }) {
  const t = useWbTheme();
  const btn = useWbBtn();
  const card = useWbCard();
  const ref = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef<boolean>(false);
  const [ink, setInk] = useState<string>(WB_INKS[0]);

  useEffect(() => {
    const c = ref.current;
    const ctx = c ? c.getContext("2d") : null;
    if (!c || !ctx) return;
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 0, c.width, c.height);
    const saved = resp[id];
    if (saved) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, c.width, c.height);
      img.src = saved;
    }
    // only redraw when the box changes
  }, [id]);

  const pos = (e: PointerEvent<HTMLCanvasElement>) => {
    const c = ref.current as HTMLCanvasElement;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };
  const down = (e: PointerEvent<HTMLCanvasElement>) => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const p = pos(e);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const c = ref.current;
    if (c) setResp(id, c.toDataURL("image/jpeg", 0.6));
  };
  const clear = () => {
    const c = ref.current;
    const ctx = c ? c.getContext("2d") : null;
    if (!c || !ctx) return;
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 0, c.width, c.height);
    setResp(id, "");
  };

  return (
    <div style={card({ padding: 12 })}>
      {label && <WbPrompt text={label} emoji="✏️" />}
      <canvas
        data-testid={`wb-draw-${id}`}
        ref={ref}
        width={640}
        height={360}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        style={{ width: "100%", maxWidth: 640, aspectRatio: "16 / 9", touchAction: "none", borderRadius: 14, border: `2px dashed ${t.border.default}`, background: t.bg.elevated, cursor: "crosshair" }}
      />
      <div className="wb-noprint" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {WB_INKS.map((c: string) => (
          <button key={c} aria-label="ink colour" onClick={() => setInk(c)} style={btn(c, t.text.onColor, { width: 56, border: ink === c ? `4px solid ${t.text.primary}` : `2px solid ${t.border.default}` })}>
            {ink === c ? "✓" : ""}
          </button>
        ))}
        <button onClick={clear} style={btn(t.fill.secondary, t.text.primary)}>🧽 Clear</button>
      </div>
    </div>
  );
}
