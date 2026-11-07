import { useRef, useState, useEffect } from "react";
import { Check } from "lucide-react";
import { KidHeader } from "@/components/KidHeader";
import { Confetti, RewardModal } from "@/components/Celebrate";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { sfx } from "@/lib/sound";

const COLORS = ["#F43F5E", "#FB923C", "#FBBF24", "#34D399", "#38BDF8", "#818CF8", "#C084FC", "#F472B6", "#1E293B", "#FFFFFF"];
const SHAPES = [
  { id: "star", emoji: "⭐", label: "Star" },
  { id: "heart", emoji: "❤️", label: "Heart" },
  { id: "flower", emoji: "🌸", label: "Flower" },
  { id: "fish", emoji: "🐠", label: "Fish" },
];

export default function Coloring() {
  const { child, selectChild } = useAuth();
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const painted = useRef(false);
  const [color, setColor] = useState("#FBBF24");
  const [size, setSize] = useState(22);
  const [shape, setShape] = useState(SHAPES[0]);
  const [confetti, setConfetti] = useState(false);
  const [reward, setReward] = useState(false);

  const draw = (shp) => {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#CBD5E1";
    ctx.font = "260px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = 0.25;
    ctx.fillText(shp.emoji, c.width / 2, c.height / 2 + 10);
    ctx.globalAlpha = 1;
    painted.current = false;
  };
  useEffect(() => { draw(shape); }, [shape]);

  const pos = (e) => {
    const c = canvasRef.current;
    const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
  };
  const start = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drawing.current = true;
    dot(e);
  };
  const dot = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const p = pos(e);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
    painted.current = true;
  };
  const end = () => { drawing.current = false; };

  const finish = async () => {
    if (!painted.current) { sfx.wrong(); return; }
    sfx.fanfare();
    setConfetti(true);
    setReward(true);
    setTimeout(() => setConfetti(false), 1800);
    try {
      const { data } = await api.post(`/children/${child.id}/activity`, {
        type: "coloring", detail: shape.id, points: 20, stars: 1, accuracy: 100, duration: 60,
      });
      selectChild(data);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-100 pb-10">
      <KidHeader title="Coloring Studio" />
      <Confetti show={confetti} />
      <RewardModal open={reward} points={20} title="Beautiful art! 🎨" onClose={() => { setReward(false); draw(shape); }} />
      <div className="max-w-xl lg:max-w-5xl mx-auto px-4 pt-5 select-none">
        <div className="flex flex-wrap gap-2 justify-center mb-3">
          {SHAPES.map((s) => (
            <button key={s.id} data-testid={`shape-${s.id}`} onClick={() => { sfx.tap(); setShape(s); }}
              className={`min-h-12 px-4 py-2 rounded-2xl font-bold text-xl ${shape.id === s.id ? "bg-pink-500 text-white" : "bg-white text-slate-600"}`}>
              {s.emoji} {s.label}
            </button>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-6 lg:items-start">
        <canvas
          ref={canvasRef}
          data-testid="coloring-canvas"
          width={400}
          height={400}
          className="w-full rounded-3xl bg-white border-2 border-pink-200 shadow-xl cursor-crosshair"
          style={{ touchAction: "none", userSelect: "none", WebkitUserSelect: "none" }}
          onPointerDown={start} onPointerMove={dot} onPointerUp={end} onPointerCancel={end} onPointerLeave={end}
        />

        <div>
        <div className="kid-card p-4 mt-4 lg:mt-0">
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            {COLORS.map((c) => (
              <button key={c} data-testid={`color-${c}`} onClick={() => { sfx.tap(); setColor(c); }}
                className={`w-12 h-12 rounded-full border-2 ${color === c ? "ring-4 ring-amber-300 border-white" : "border-slate-200"}`}
                style={{ background: c }} />
            ))}
          </div>
          <div className="flex items-center gap-3 justify-center">
            <span className="text-xl font-bold text-slate-500">Brush</span>
            {[12, 22, 36].map((s) => (
              <button key={s} data-testid={`brush-${s}`} onClick={() => setSize(s)}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${size === s ? "ring-4 ring-amber-300 bg-amber-50" : "bg-white"}`}>
                <span className="rounded-full bg-slate-700" style={{ width: s, height: s }} />
              </button>
            ))}
          </div>
        </div>

        <button data-testid="coloring-done-button" onClick={finish}
          className="w-full tactile bg-yellow-400 border-amber-600 rounded-2xl py-4 font-black text-slate-900 text-lg mt-4 flex items-center justify-center gap-2">
          <Check className="w-6 h-6" /> Finish & Collect Points
        </button>
        </div>
        </div>
      </div>
    </div>
  );
}
