import { useState, useEffect, useRef, useMemo, useGrokTheme } from "../grok";
import type { PointerEvent } from "../grok";
import {
  LETTERS,
  VOCABULARY,
  PYP_THEMES,
  type YearLevel,
  type PypThemeId,
} from "../data/pypData";
import { sfx, speak } from "../lib/soundAndStorage";
import { usePalette, useBtn, shuffle, filterByYear, RewardBanner } from "./uiHelpers";

const RANGES = [
  { id: "ALL", label: "All A–Z", from: "A", to: "Z" },
  { id: "AF", label: "A–F", from: "A", to: "F" },
  { id: "GL", label: "G–L", from: "G", to: "L" },
  { id: "MR", label: "M–R", from: "M", to: "R" },
  { id: "SZ", label: "S–Z", from: "S", to: "Z" },
];

export function LettersDrillView({
  mastered,
  onAward,
}: {
  mastered: string[];
  onAward: (points: number, stars: number, themeId?: PypThemeId, letter?: string) => void;
}) {
  const t = useGrokTheme();
  const pal = usePalette();
  const btn = useBtn();

  const [range, setRange] = useState<string>("ALL");
  const [idx, setIdx] = useState<number>(0);
  const [reward, setReward] = useState<{ msg: string; pts: number; stars: number }>({ msg: "", pts: 0, stars: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef<boolean>(false);
  const strokes = useRef<number>(0);

  const filtered = useMemo(() => {
    const r = RANGES.find((x) => x.id === range) || RANGES[0];
    return LETTERS.filter((item) => item.l >= r.from && item.l <= r.to);
  }, [range]);

  const cur = filtered[idx % filtered.length] || LETTERS[0];
  const color = pal[idx % pal.length];

  const drawGuide = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "rgb(218, 224, 235)";
    ctx.font = "bold 190px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${cur.l}${cur.l.toLowerCase()}`, c.width / 2, c.height / 2 + 8);
    strokes.current = 0;
  };

  useEffect(() => {
    drawGuide();
  }, [cur.l]);

  const getPos = (e: PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (c.width / r.width),
      y: (e.clientY - r.top) * (c.height / r.height),
    };
  };

  const onStart = (e: PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    try {
      (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    drawing.current = true;
    const c = canvasRef.current;
    const ctx = c ? c.getContext("2d") : null;
    if (!ctx) return;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.fillStyle = color;
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    strokes.current += 1;
  };

  const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const c = canvasRef.current;
    const ctx = c ? c.getContext("2d") : null;
    if (!ctx) return;
    const p = getPos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    strokes.current += 1;
  };

  const onEnd = () => {
    drawing.current = false;
  };

  const sayLetter = () => {
    sfx.tap();
    speak([`${cur.l}.`, `${cur.word}.`, cur.cue], `letter:${cur.l}`);
  };

  const finishTrace = () => {
    sfx.correct();
    speak([`Great job tracing ${cur.l}!`, `${cur.l} is for ${cur.word}.`], `letter:${cur.l}`);
    onAward(10, 1, undefined, cur.l);
    setReward({ msg: `Mastered letter ${cur.l} (${cur.word})!`, pts: 10, stars: 1 });
    setIdx((i: number) => (i + 1) % filtered.length);
  };

  return (
    <div data-testid="letters-drill-view" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <RewardBanner message={reward.msg} points={reward.pts} stars={reward.stars} onClose={() => setReward({ msg: "", pts: 0, stars: 0 })} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: t.text.secondary }}>Letter Group:</span>
        {RANGES.map((r) => (
          <button
            key={r.id}
            data-testid={`letter-range-${r.id}`}
            onClick={() => { sfx.tap(); setRange(r.id); setIdx(0); }}
            style={btn(range === r.id ? t.fill.accent : t.fill.secondary, range === r.id ? t.text.onColor : t.text.primary)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div data-testid="letter-chips" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {filtered.map((item, i) => {
          const isSel = item.l === cur.l;
          const isDone = mastered.indexOf(item.l) >= 0;
          return (
            <button
              key={item.l}
              data-testid={`letter-chip-${item.l}`}
              onClick={() => {
                sfx.tap();
                setIdx(i);
                speak([`${item.l}.`, `${item.word}.`], `letter:${item.l}`);
              }}
              style={btn(
                isSel ? color : isDone ? t.text.success : t.bg.elevated,
                isSel || isDone ? t.text.onColor : t.text.primary,
                { minWidth: 52, minHeight: 52, padding: "8px 12px", fontSize: 22 }
              )}
            >
              {item.l}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          gap: 20,
          border: `3px solid ${color}`,
          borderRadius: 24,
          padding: 20,
          background: t.bg.elevated,
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1, color }}>
            {cur.l} <span style={{ opacity: 0.75 }}>{cur.l.toLowerCase()}</span>
          </div>
          <div style={{ fontSize: 84, lineHeight: 1.1 }}>{cur.emoji}</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>
            {cur.l} is for <span style={{ color }}>{cur.word}</span>
          </div>
          <div style={{ fontSize: 20, color: t.text.secondary }}>
            Sound: {cur.sound} • {cur.cue}
          </div>
          <button data-testid="voice-play-button" onClick={sayLetter} style={btn(color, t.text.onColor, { fontSize: 24, padding: "14px 28px" })}>
            🔊 Hear It
          </button>
        </div>

        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: t.text.secondary }}>
            ✍️ Trace {cur.l}{cur.l.toLowerCase()} with your mouse or finger:
          </div>
          <canvas
            ref={canvasRef}
            data-testid="letter-tracer-canvas"
            width={340}
            height={280}
            onPointerDown={onStart}
            onPointerMove={onMove}
            onPointerUp={onEnd}
            onPointerCancel={onEnd}
            onPointerLeave={onEnd}
            style={{
              width: "100%",
              maxWidth: 340,
              borderRadius: 20,
              border: `3px dashed ${color}`,
              cursor: "crosshair",
              touchAction: "none",
              userSelect: "none",
            }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            <button data-testid="clear-trace-button" onClick={() => { sfx.tap(); drawGuide(); }} style={btn(t.fill.secondary, t.text.primary)}>
              🧹 Clear
            </button>
            <button data-testid="letter-done-button" onClick={finishTrace} style={btn(t.text.success, t.text.onColor)}>
              ✅ I Traced It! (+10🪙)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WordsSpellView({
  year,
  onAward,
}: {
  year: YearLevel;
  onAward: (points: number, stars: number, themeId?: PypThemeId) => void;
}) {
  const t = useGrokTheme();
  const pal = usePalette();
  const btn = useBtn();

  const [themeFilter, setThemeFilter] = useState<string>("all");
  const [idx, setIdx] = useState<number>(0);
  const [slots, setSlots] = useState<{ ch: string; id: string }[]>([]);
  const [tray, setTray] = useState<{ ch: string; id: string }[]>([]);
  const [reward, setReward] = useState<{ msg: string; pts: number; stars: number }>({ msg: "", pts: 0, stars: 0 });

  const words = useMemo(() => {
    const byY = filterByYear(VOCABULARY, year);
    if (themeFilter === "all") return byY;
    const byT = byY.filter((w) => w.theme === themeFilter);
    return byT.length > 0 ? byT : byY;
  }, [year, themeFilter]);

  const cur = words[idx % words.length] || VOCABULARY[0];

  const setupWord = (wordStr: string) => {
    setSlots([]);
    const chars = wordStr.split("").map((ch, k) => ({ ch, id: `${ch}-${k}` }));
    setTray(shuffle(chars));
  };

  useEffect(() => {
    setupWord(cur.word);
  }, [cur.word, idx, year, themeFilter]);

  const placeTile = (tile: { ch: string; id: string }) => {
    sfx.tap();
    speak(tile.ch);
    const nextSlots = [...slots, tile];
    const nextTray = tray.filter((x) => x.id !== tile.id);
    setSlots(nextSlots);
    setTray(nextTray);

    if (nextSlots.length === cur.word.length) {
      const built = nextSlots.map((s) => s.ch).join("");
      if (built === cur.word) {
        sfx.correct();
        speak([cur.word, "Awesome spelling!"], `word:${cur.word}`);
        onAward(15, 1, cur.theme);
        setReward({ msg: `Spelled "${cur.word.toUpperCase()}"!`, pts: 15, stars: 1 });
        setIdx((i: number) => (i + 1) % words.length);
      } else {
        sfx.wrong();
        window.setTimeout(() => setupWord(cur.word), 550);
      }
    }
  };

  return (
    <div data-testid="words-spell-view" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <RewardBanner message={reward.msg} points={reward.pts} stars={reward.stars} onClose={() => setReward({ msg: "", pts: 0, stars: 0 })} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: t.text.secondary }}>PYP Theme Filter:</span>
        <button
          onClick={() => { sfx.tap(); setThemeFilter("all"); setIdx(0); }}
          style={btn(themeFilter === "all" ? t.fill.primary : t.fill.secondary, themeFilter === "all" ? t.text.onPrimary : t.text.primary)}
        >
          All 6 Themes ({words.length})
        </button>
        {PYP_THEMES.map((th) => (
          <button
            key={th.id}
            onClick={() => { sfx.tap(); setThemeFilter(th.id); setIdx(0); }}
            style={btn(themeFilter === th.id ? t.fill.accent : t.fill.secondary, themeFilter === th.id ? t.text.onColor : t.text.primary)}
          >
            {th.emoji} {th.title}
          </button>
        ))}
      </div>

      <div
        style={{
          border: `3px solid ${pal[idx % pal.length]}`,
          borderRadius: 24,
          padding: 24,
          background: t.bg.elevated,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: t.text.secondary }}>
          Word {(idx % words.length) + 1} of {words.length} • {cur.year.toUpperCase()}
        </div>
        <div style={{ fontSize: 88, lineHeight: 1.1 }}>{cur.emoji}</div>
        <div style={{ fontSize: 22, color: t.text.secondary }}>{cur.hint}</div>

        <button
          data-testid="word-hear-button"
          onClick={() => { sfx.tap(); speak([cur.word, cur.hint], `word:${cur.word}`); }}
          style={btn(pal[idx % pal.length], t.text.onColor)}
        >
          🔊 Hear the Word
        </button>

        <div data-testid="word-slots" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
          {cur.word.split("").map((_, i) => (
            <div
              key={i}
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                border: `3px dashed ${t.border.default}`,
                background: t.bg.subtle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              {slots[i]?.ch || ""}
            </div>
          ))}
        </div>

        <div data-testid="letter-tray" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
          {tray.map((tile) => (
            <button
              key={tile.id}
              data-testid={`tray-tile-${tile.ch}`}
              onClick={() => placeTile(tile)}
              style={btn(t.fill.accent, t.text.onColor, { minWidth: 60, minHeight: 60, fontSize: 30, textTransform: "uppercase" })}
            >
              {tile.ch}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 6 }}>
          <button data-testid="word-shuffle-button" onClick={() => { sfx.tap(); setupWord(cur.word); }} style={btn(t.fill.secondary, t.text.primary)}>
            🔀 Shuffle again
          </button>
          <button onClick={() => { sfx.tap(); setIdx((i: number) => (i + 1) % words.length); }} style={btn(t.fill.secondary, t.text.primary)}>
            Skip Word ▶
          </button>
        </div>
      </div>
    </div>
  );
}
