import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { KidHeader } from "@/components/KidHeader";
import { Confetti, RewardModal } from "@/components/Celebrate";
import { useAuth } from "@/context/AuthContext";
import { WORDS } from "@/data/content";
import { sfx, speak } from "@/lib/sound";

function round() {
  const correct = WORDS[Math.floor(Math.random() * WORDS.length)];
  const options = [correct];
  while (options.length < 3) {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    if (!options.find((o) => o.word === w.word)) options.push(w);
  }
  return { correct, options: options.sort(() => Math.random() - 0.5) };
}

const STEPS = 4;

export default function SaveRoyal() {
  const { child } = useAuth();
  const navigate = useNavigate();
  const king = child?.theme === "king";
  const [step, setStep] = useState(0);
  const [q, setQ] = useState(round);
  const [confetti, setConfetti] = useState(false);
  const [won, setWon] = useState(false);
  const [wrongId, setWrongId] = useState(null);

  const choose = (opt) => {
    speak(opt.word);
    if (opt.word === q.correct.word) {
      sfx.correct();
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1200);
      const next = step + 1;
      setStep(next);
      if (next >= STEPS) {
        sfx.fanfare();
        setTimeout(() => setWon(true), 500);
      } else {
        setTimeout(() => { setQ(round()); }, 700);
      }
    } else {
      sfx.wrong();
      setWrongId(opt.word);
      setTimeout(() => setWrongId(null), 500);
    }
  };

  const restart = () => { setStep(0); setQ(round()); setWon(false); };
  const progress = (step / STEPS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 pb-10">
      <KidHeader title={king ? "Save the King 🤴" : "Save the Princess 👑"} />
      <Confetti show={confetti} />
      <RewardModal open={won} points={null} title={king ? "You saved the King! 🎉" : "You saved the Princess! 🎉"} onClose={restart} />
      <div className="max-w-xl mx-auto px-4 pt-5">
        <div className="kid-card p-5 mb-5">
          <div className="flex items-center justify-between text-3xl mb-2">
            <span>🦸</span>
            <div className="flex-1 mx-3 h-4 bg-slate-200 rounded-full overflow-hidden">
              <motion.div className="h-full bg-emerald-400" animate={{ width: `${progress}%` }} />
            </div>
            <span>{king ? "🤴" : "👑"}</span>
          </div>
          <p className="text-center font-bold text-slate-500 text-sm">Bridge {step} of {STEPS} crossed</p>
        </div>

        <div className="text-center">
          <div className="text-7xl mb-3 animate-float-slow">{q.correct.emoji}</div>
          <p className="font-display text-xl font-bold text-slate-700 mb-5">Pick the word that matches the picture!</p>
          <div className="grid gap-3" data-testid="royal-options">
            {q.options.map((o) => (
              <motion.button
                key={o.word}
                data-testid={`royal-option-${o.word}`}
                whileTap={{ scale: 0.96 }}
                animate={wrongId === o.word ? { x: [0, -8, 8, -8, 0] } : {}}
                onClick={() => choose(o)}
                className="tactile bg-white border-purple-300 rounded-2xl py-4 font-display text-2xl font-bold text-indigo-600"
              >
                {o.word}
              </motion.button>
            ))}
          </div>
          <button onClick={() => navigate("/arcade")} className="mt-6 text-sm font-bold text-slate-500 underline">Back to Arcade</button>
        </div>
      </div>
    </div>
  );
}
