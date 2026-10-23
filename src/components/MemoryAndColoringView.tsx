import { useState, useEffect, useRef, useGrokTheme } from "../grok";
import type { PointerEvent } from "../grok";
import {
  LETTERS,
  VOCABULARY,
  COLORING_SHAPES,
  type YearLevel,
  type PypThemeId,
} from "../data/pypData";
import { sfx, speak } from "../lib/soundAndStorage";
import { usePalette, useBtn, shuffle, filterByYear, RewardBanner } from "./uiHelpers";

interface MemoryCard {
  id: string;
  matchKey: string;
  face: string;
  speakText: string;
}

function buildMemoryDeck(deckMode: "letters" | "pyp", year: YearLevel, pairCount: number): MemoryCard[] {
  if (deckMode === "letters") {
    const picks = shuffle(LETTERS).slice(0, pairCount);
    const cards: MemoryCard[] = [];
    picks.forEach((p, i) => {
      cards.push({ id: `up-${i}`, matchKey: p.l, face: p.l, speakText: p.l });
      cards.push({ id: `lo-${i}`, matchKey: p.l, face: `${p.l.toLowerCase()} ${p.emoji}`, speakText: p.word });
    });
    return shuffle(cards);
  }
  const pool = filterByYear(VOCABULARY, year);
  const picks = shuffle(pool).slice(0, pairCount);
  const cards: MemoryCard[] = [];
  picks.forEach((w, i) => {
    cards.push({ id: `w-${i}`, matchKey: w.word, face: w.word, speakText: w.word });
    cards.push({ id: `e-${i}`, matchKey: w.word, face: w.emoji, speakText: w.word });
  });
  return shuffle(cards);
}

export function MemoryGameView({
  year,
  onAward,
}: {
  year: YearLevel;
  onAward: (points: number, stars: number, themeId?: PypThemeId) => void;
}) {
  const t = useGrokTheme();
  const pal = usePalette();
  const btn = useBtn();

  const [deckMode, setDeckMode] = useState<"letters" | "pyp">("letters");
  const [pairCount, setPairCount] = useState<number>(6);
  const [deck, setDeck] = useState<MemoryCard[]>(() => buildMemoryDeck("letters", year, 6));
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedKeys, setMatchedKeys] = useState<string[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [busy, setBusy] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>("Flip two cards to find a matching pair! (+15🪙 & +1⭐ only on a real match)");
  const [reward, setReward] = useState<{ msg: string; pts: number; stars: number }>({ msg: "", pts: 0, stars: 0 });

  const startNewGame = (nextMode = deckMode, nextPairs = pairCount) => {
    sfx.tap();
    setDeckMode(nextMode);
    setPairCount(nextPairs);
    setDeck(buildMemoryDeck(nextMode, year, nextPairs));
    setFlippedIds([]);
    setMatchedKeys([]);
    setMoves(0);
    setBusy(false);
    setStatusMsg("Flip two cards to find a matching pair! (+15🪙 & +1⭐ only on a real match)");
  };

  useEffect(() => {
    setDeck(buildMemoryDeck(deckMode, year, pairCount));
    setFlippedIds([]);
    setMatchedKeys([]);
    setMoves(0);
  }, [year]);

  const flipCard = (card: MemoryCard) => {
    if (busy || flippedIds.indexOf(card.id) >= 0 || matchedKeys.indexOf(card.matchKey) >= 0 || flippedIds.length >= 2) {
      return;
    }
    sfx.tap();
    speak(card.speakText);
    const nextFlipped = [...flippedIds, card.id];
    setFlippedIds(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m: number) => m + 1);
      const first = deck.find((c) => c.id === nextFlipped[0]);
      const second = card;
      if (!first) return;

      if (first.matchKey === second.matchKey && first.id !== second.id) {
        // Real match! Award +15 coins and +1 star
        sfx.coin();
        const nextMatched = [...matchedKeys, first.matchKey];
        setMatchedKeys(nextMatched);
        setFlippedIds([]);
        onAward(15, 1);
        setStatusMsg(`✅ Match found: ${first.matchKey.toUpperCase()}! (+15🪙 +1⭐)`);
        if (nextMatched.length >= pairCount) {
          sfx.fanfare();
          onAward(25, 2);
          setReward({ msg: `Board complete in ${moves + 1} moves! Bonus +25🪙 +2⭐!`, pts: 25, stars: 2 });
        }
      } else {
        // Mismatch: 0 coins and 0 stars awarded!
        setBusy(true);
        sfx.wrong();
        setStatusMsg("❌ Not a match — 0 coins awarded. Try to remember where those cards were!");
        window.setTimeout(() => {
          setFlippedIds([]);
          setBusy(false);
        }, 700);
      }
    }
  };

  return (
    <div data-testid="memory-game-view" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <RewardBanner message={reward.msg} points={reward.pts} stars={reward.stars} onClose={() => setReward({ msg: "", pts: 0, stars: 0 })} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            data-testid="memory-mode-letters"
            onClick={() => startNewGame("letters", pairCount)}
            style={btn(deckMode === "letters" ? t.fill.primary : t.fill.secondary, deckMode === "letters" ? t.text.onPrimary : t.text.primary)}
          >
            🔤 Letters (A ↔ a)
          </button>
          <button
            data-testid="memory-mode-pyp"
            onClick={() => startNewGame("pyp", pairCount)}
            style={btn(deckMode === "pyp" ? t.fill.primary : t.fill.secondary, deckMode === "pyp" ? t.text.onPrimary : t.text.primary)}
          >
            🌍 PYP Theme Words
          </button>
          {[6, 8].map((p) => (
            <button
              key={p}
              data-testid={`memory-pairs-${p}`}
              onClick={() => startNewGame(deckMode, p)}
              style={btn(pairCount === p ? t.fill.accent : t.fill.secondary, pairCount === p ? t.text.onColor : t.text.primary)}
            >
              {p} Pairs
            </button>
          ))}
          <button data-testid="memory-restart-button" onClick={() => startNewGame(deckMode, pairCount)} style={btn(t.fill.secondary, t.text.primary)}>
            🔄 New Board
          </button>
        </div>
        <div data-testid="memory-status" style={{ fontSize: 20, fontWeight: 700 }}>
          Moves: {moves} • Matched: {matchedKeys.length}/{pairCount}
        </div>
      </div>

      <div data-testid="memory-feedback" style={{ fontSize: 19, fontWeight: 600, color: t.text.secondary }}>
        {statusMsg}
      </div>

      <div
        data-testid="memory-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 12,
        }}
      >
        {deck.map((card, i) => {
          const isMatched = matchedKeys.indexOf(card.matchKey) >= 0;
          const isFlipped = isMatched || flippedIds.indexOf(card.id) >= 0;
          const col = pal[i % pal.length];
          return (
            <button
              key={card.id}
              data-testid={`memory-card-${i}`}
              data-match-key={card.matchKey}
              onClick={() => flipCard(card)}
              style={{
                minHeight: 112,
                borderRadius: 20,
                border: isFlipped ? `4px solid ${isMatched ? t.text.success : col}` : `2px solid ${t.border.default}`,
                background: isFlipped ? t.bg.elevated : col,
                color: isFlipped ? t.text.primary : t.text.onColor,
                fontSize: 30,
                fontWeight: 800,
                cursor: isMatched ? "default" : "pointer",
                fontFamily: t.font.family,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 8,
                touchAction: "manipulation",
              }}
            >
              {isFlipped ? card.face : "❓"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ColoringStudioView({
  onAward,
}: {
  onAward: (points: number, stars: number, themeId?: PypThemeId) => void;
}) {
  const t = useGrokTheme();
  const pal = usePalette();
  const btn = useBtn();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef<boolean>(false);
  const lastPt = useRef<{ x: number; y: number } | null>(null);
  const painted = useRef<boolean>(false);

  const [shapeIdx, setShapeIdx] = useState<number>(0);
  const [colorIdx, setColorIdx] = useState<number>(0);
  const [brushSize, setBrushSize] = useState<number>(22);
  const [strokeCount, setStrokeCount] = useState<number>(0);
  const [reward, setReward] = useState<{ msg: string; pts: number; stars: number }>({ msg: "", pts: 0, stars: 0 });

  const shape = COLORING_SHAPES[shapeIdx % COLORING_SHAPES.length];
  const activeColor = pal[colorIdx % pal.length];

  const drawTemplate = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.globalAlpha = 0.25;
    ctx.font = "220px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgb(148, 163, 184)";
    ctx.fillText(shape.emoji, c.width / 2, c.height / 2 + 10);
    ctx.globalAlpha = 1.0;
    painted.current = false;
    setStrokeCount(0);
  };

  useEffect(() => {
    drawTemplate();
  }, [shapeIdx]);

  const getPos = (e: PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (c.width / r.width),
      y: (e.clientY - r.top) * (c.height / r.height),
    };
  };

  const paintAt = (pt: { x: number; y: number }) => {
    const c = canvasRef.current;
    const ctx = c ? c.getContext("2d") : null;
    if (!ctx) return;
    ctx.fillStyle = activeColor;
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = brushSize * 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (lastPt.current) {
      ctx.beginPath();
      ctx.moveTo(lastPt.current.x, lastPt.current.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, brushSize, 0, Math.PI * 2);
      ctx.fill();
    }
    lastPt.current = pt;
    painted.current = true;
  };

  const onDown = (e: PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    try {
      (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    drawing.current = true;
    lastPt.current = null;
    paintAt(getPos(e));
    setStrokeCount((n: number) => n + 1);
  };

  const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    paintAt(getPos(e));
  };

  const onUp = () => {
    drawing.current = false;
    lastPt.current = null;
  };

  const finishArt = () => {
    if (!painted.current) {
      sfx.wrong();
      return;
    }
    sfx.fanfare();
    onAward(20, 1, shape.theme as PypThemeId);
    setReward({ msg: `Beautiful ${shape.label} artwork!`, pts: 20, stars: 1 });
  };

  return (
    <div data-testid="coloring-studio-view" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <RewardBanner message={reward.msg} points={reward.pts} stars={reward.stars} onClose={() => setReward({ msg: "", pts: 0, stars: 0 })} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {COLORING_SHAPES.map((s, i) => (
          <button
            key={s.id}
            data-testid={`shape-${s.id}`}
            onClick={() => { sfx.tap(); setShapeIdx(i); speak(s.label); }}
            style={btn(shapeIdx === i ? t.fill.primary : t.fill.secondary, shapeIdx === i ? t.text.onPrimary : t.text.primary)}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 20, alignItems: "start" }}>
        <div style={{ textAlign: "center" }}>
          <canvas
            ref={canvasRef}
            data-testid="coloring-canvas"
            width={400}
            height={340}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onPointerLeave={onUp}
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 24,
              border: `3px solid ${activeColor}`,
              cursor: "crosshair",
              touchAction: "none",
              userSelect: "none",
            }}
          />
          <div data-testid="coloring-stroke-status" style={{ fontSize: 16, color: t.text.secondary, marginTop: 6 }}>
            Drag with mouse or finger to paint ({strokeCount} strokes)
          </div>
        </div>

        <div style={{ border: `2px solid ${t.border.default}`, borderRadius: 24, padding: 20, background: t.bg.elevated, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>🎨 Pick a Brush Color:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {pal.map((c, i) => (
              <button
                key={c}
                data-testid={`color-swatch-${i}`}
                aria-label={`Color ${i + 1}`}
                onClick={() => { sfx.tap(); setColorIdx(i); }}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 999,
                  background: c,
                  border: colorIdx === i ? `4px solid ${t.text.primary}` : `2px solid ${t.border.default}`,
                  cursor: "pointer",
                }}
              />
            ))}
          </div>

          <div style={{ fontSize: 20, fontWeight: 700 }}>🖌️ Brush Size:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[12, 22, 34].map((sz) => (
              <button
                key={sz}
                data-testid={`brush-${sz}`}
                onClick={() => { sfx.tap(); setBrushSize(sz); }}
                style={btn(brushSize === sz ? t.fill.accent : t.fill.secondary, brushSize === sz ? t.text.onColor : t.text.primary)}
              >
                {sz === 12 ? "Fine" : sz === 22 ? "Medium" : "Wide"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
            <button data-testid="coloring-clear-button" onClick={() => { sfx.tap(); drawTemplate(); }} style={btn(t.fill.secondary, t.text.primary)}>
              🧹 Clear Canvas
            </button>
            <button data-testid="coloring-done-button" onClick={finishArt} style={btn(t.text.success, t.text.onColor, { flex: "1 1 180px" })}>
              ✅ Finish & Collect (+20🪙)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
