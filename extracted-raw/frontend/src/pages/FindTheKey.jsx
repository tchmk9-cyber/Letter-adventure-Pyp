import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { KidHeader } from "@/components/KidHeader";
import { Confetti } from "@/components/Celebrate";
import { sfx } from "@/lib/sound";

function newRound() {
  const key = Math.floor(Math.random() * 6);
  return Array.from({ length: 6 }, (_, i) => ({ i, hasKey: i === key, open: false }));
}

export default function FindTheKey() {
  const navigate = useNavigate();
  const [doors, setDoors] = useState(newRound);
  const [keys, setKeys] = useState(0);
  const [tries, setTries] = useState(3);
  const [confetti, setConfetti] = useState(false);
  const [over, setOver] = useState(false);

  const openDoor = (d) => {
    if (d.open || over) return;
    const nd = doors.map((x) => x.i === d.i ? { ...x, open: true } : x);
    setDoors(nd);
    if (d.hasKey) {
      sfx.fanfare();
      setConfetti(true);
      setKeys((k) => k + 1);
      setTimeout(() => { setConfetti(false); setDoors(newRound()); setTries(3); }, 1400);
    } else {
      sfx.wrong();
      const left = tries - 1;
      setTries(left);
      if (left <= 0) {
        setTimeout(() => { setDoors(doors.map((x) => ({ ...x, open: true }))); setOver(true); }, 400);
      }
    }
  };

  const restart = () => { sfx.tap(); setDoors(newRound()); setTries(3); setOver(false); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 to-orange-200 pb-10">
      <KidHeader title="Find the Key 🗝️" />
      <Confetti show={confetti} />
      <div className="max-w-xl mx-auto px-4 pt-5 text-center">
        <div className="kid-card p-4 mb-5 flex justify-around font-black text-slate-700">
          <span data-testid="keys-found">🗝️ Keys: {keys}</span>
          <span>❤️ Tries: {tries}</span>
        </div>
        <p className="font-bold text-slate-600 mb-4">Tap a door to find the hidden golden key!</p>
        <div className="grid grid-cols-3 gap-4" data-testid="doors-grid">
          {doors.map((d) => (
            <motion.button key={d.i} data-testid={`door-${d.i}`} whileTap={{ scale: 0.92 }}
              onClick={() => openDoor(d)}
              className={`aspect-[3/4] rounded-2xl shadow-lg flex items-center justify-center text-5xl tactile ${
                d.open ? (d.hasKey ? "bg-yellow-300 border-amber-500" : "bg-slate-200 border-slate-400") : "bg-amber-700 border-amber-900"
              }`}>
              {d.open ? (d.hasKey ? "🗝️" : "🕳️") : "🚪"}
            </motion.button>
          ))}
        </div>

        {over && (
          <div className="mt-6">
            <p className="font-display text-xl font-bold text-rose-600 mb-3">Out of tries! You found {keys} keys 🎉</p>
            <div className="flex gap-3 justify-center">
              <button data-testid="key-restart" onClick={restart} className="tactile bg-yellow-400 border-amber-600 rounded-2xl px-6 py-3 font-black text-slate-900">Play again</button>
              <button onClick={() => navigate("/arcade")} className="tactile bg-white border-slate-200 rounded-2xl px-6 py-3 font-bold text-slate-600">Back to Arcade</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
