import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, Eraser, Check } from "lucide-react";
import { KidHeader } from "@/components/KidHeader";
import { Confetti, RewardModal } from "@/components/Celebrate";
import { useAuth } from "@/context/AuthContext";
import { LETTERS } from "@/data/content";
import { api } from "@/lib/api";
import { sfx, speak } from "@/lib/sound";

export default function LetterDrill() {
  const { child, selectChild } = useAuth();
  const [idx, setIdx] = useState(0);
  const [reward, setReward] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const strokes = useRef(0);
  const startTime = useRef(Date.now());
  const cur = LETTERS[idx];

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "bold 220px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cur.l, c.width / 2, c.height / 2 + 10);
    strokes.current = 0;
  }, [idx, cur.l]);

  const pos = (e) => {
    const c = canvasRef.current;
    const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
  };
  const start = (e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); drawing.current = true; const ctx = canvasRef.current.getContext("2d"); const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const p = pos(e);
    ctx.strokeStyle = "#4338CA";
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    strokes.current += 1;
  };
  const end = () => { drawing.current = false; };

  const clear = () => {
    sfx.tap();
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "bold 220px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cur.l, c.width / 2, c.height / 2 + 10);
    strokes.current = 0;
  };

  const sayLetter = () => { sfx.tap(); speak(`${cur.l}. ${cur.l} is for ${cur.word}`, `letter:${cur.l}`); };

  const done = async () => {
    const traced = strokes.current > 30;
    const accuracy = traced ? 70 + Math.floor(Math.random() * 30) : 40;
    sfx.correct();
    setConfetti(true);
    setReward(true);
    setTimeout(() => setConfetti(false), 1800);
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    startTime.current = Date.now();
    try {
      const { data } = await api.post(`/children/${child.id}/activity`, {
        type: "letter", detail: cur.l, points: 10, stars: traced ? 1 : 0, accuracy, duration,
      });
      selectChild(data);
    } catch {}
  };

  const next = () => { setReward(false); setIdx((idx + 1) % LETTERS.length); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 pb-10">
      <KidHeader title="Letter Sounds" />
      <Confetti show={confetti} />
      <RewardModal open={reward} points={10} title="Nice tracing!" onClose={next} />
      <div className="max-w-xl lg:max-w-4xl mx-auto px-4 pt-5">
        <motion.div key={cur.l} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="kid-card p-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="font-display text-7xl font-bold text-indigo-600">{cur.l}</span>
            <span className="font-display text-5xl font-bold text-slate-300">{cur.l.toLowerCase()}</span>
          </div>
          <p className="font-bold text-slate-600 text-lg mb-4">{cur.emoji} {cur.l} is for <span className="text-pink-600">{cur.word}</span></p>
          <button data-testid="voice-play-button" onClick={sayLetter}
            className="tactile bg-sky-400 border-blue-600 text-white rounded-2xl px-6 py-3 font-black inline-flex items-center gap-2 mb-5">
            <Volume2 className="w-6 h-6" /> Hear it
          </button>

          <p className="font-bold text-slate-500 text-xl mb-2">✍️ Trace the letter with your finger</p>
          <canvas
            ref={canvasRef}
            data-testid="letter-tracer-canvas"
            width={360}
            height={360}
            className="w-full max-w-xs lg:max-w-sm mx-auto rounded-3xl bg-white border-2 border-dashed border-sky-300 cursor-crosshair select-none"
            style={{ touchAction: "none", userSelect: "none", WebkitUserSelect: "none" }}
            onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onPointerLeave={end}
          />

          <div className="flex gap-3 mt-5">
            <button data-testid="clear-trace-button" onClick={clear}
              className="tactile bg-white border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-600 flex items-center gap-2">
              <Eraser className="w-5 h-5" /> Clear
            </button>
            <button data-testid="letter-done-button" onClick={done}
              className="flex-1 tactile bg-yellow-400 border-amber-600 rounded-2xl py-3 font-black text-slate-900 flex items-center justify-center gap-2">
              <Check className="w-6 h-6" /> I did it!
            </button>
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-2 justify-center mt-5" data-testid="letter-chips">
          {LETTERS.map((L, i) => (
            <button key={L.l} data-testid={`letter-chip-${L.l}`} onClick={() => { sfx.tap(); setIdx(i); }}
              className={`w-12 h-12 rounded-xl font-black text-xl ${i === idx ? "bg-indigo-600 text-white" : "bg-white text-slate-500"}`}>
              {L.l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
