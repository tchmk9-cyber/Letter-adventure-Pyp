import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KidHeader } from "@/components/KidHeader";
import { Confetti, RewardModal } from "@/components/Celebrate";
import { useAuth } from "@/context/AuthContext";
import { SCIENCE, LEVEL4_STARS } from "@/data/content";
import { api } from "@/lib/api";
import { sfx, speak } from "@/lib/sound";

function pickQuiz() {
  return [...SCIENCE].sort(() => Math.random() - 0.5).slice(0, 5)
    .map((q) => ({ ...q, options: [...q.options].sort(() => Math.random() - 0.5) }));
}

export default function ScienceQuest() {
  const { child, selectChild } = useAuth();
  const [quiz, setQuiz] = useState(pickQuiz);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [reward, setReward] = useState(false);

  const locked = (child?.stars || 0) < LEVEL4_STARS;
  if (locked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-lime-50 to-green-100">
        <KidHeader title="Science Quest" />
        <div className="max-w-md mx-auto px-4 pt-16 text-center">
          <div className="text-7xl mb-4">🔒</div>
          <h1 className="font-display text-2xl font-bold text-slate-800 mb-2">Level 4 is almost here!</h1>
          <p className="font-semibold text-slate-500 mb-4">
            Earn <b>{LEVEL4_STARS - (child?.stars || 0)} more stars</b> to unlock the Science Quest.
          </p>
          <div className="kid-card p-4 inline-flex items-center gap-2 font-black text-green-600">⭐ {child?.stars || 0} / {LEVEL4_STARS}</div>
        </div>
      </div>
    );
  }

  const cur = quiz[idx];

  const answer = (opt) => {
    if (opt === cur.answer) {
      sfx.correct();
      const ns = score + 1;
      setScore(ns);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1000);
      if (idx + 1 < quiz.length) setTimeout(() => setIdx(idx + 1), 600);
      else finish(ns);
    } else {
      sfx.wrong();
      setWrong(opt);
      setTimeout(() => setWrong(null), 500);
    }
  };

  const finish = async (ns) => {
    sfx.fanfare();
    setReward(true);
    try {
      const { data } = await api.post(`/children/${child.id}/activity`, {
        type: "science", detail: "science-quest", points: ns * 10 + 10, stars: 2,
        accuracy: Math.round((ns / quiz.length) * 100), duration: 60,
      });
      selectChild(data);
    } catch {}
  };

  const restart = () => { setReward(false); setQuiz(pickQuiz()); setIdx(0); setScore(0); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lime-50 to-green-100 pb-10">
      <KidHeader title="Science Quest 🔬" />
      <Confetti show={confetti} />
      <RewardModal open={reward} points={score * 10 + 10} title={`You got ${score}/${quiz.length}! 🌟`} onClose={restart} />

      <div className="max-w-xl lg:max-w-5xl mx-auto px-4 pt-5">
        <div className="flex gap-1.5 mb-5">
          {quiz.map((_, i) => (
            <div key={i} className={`h-2.5 flex-1 rounded-full ${i < idx ? "bg-emerald-400" : i === idx ? "bg-amber-400" : "bg-white/70"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
            className="kid-card p-5 text-center lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center lg:text-left">
            <div>
            <p className="text-xl font-black uppercase tracking-wider text-green-600 mb-3">Question {idx + 1} of {quiz.length}</p>
            <img src={cur.image} alt="" data-testid="science-image"
              className="w-full max-w-xs lg:max-w-md mx-auto aspect-square object-cover rounded-3xl mb-4 border-2 border-green-200" />
            </div>
            <div>
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-5">
              <h2 className="font-display text-2xl font-bold text-slate-800" data-testid="science-question">{cur.q}</h2>
              <button data-testid="science-hear-button" aria-label="Hear the question" onClick={() => { sfx.tap(); speak(cur.q); }}
                className="shrink-0 w-12 h-12 rounded-xl bg-green-100 text-green-600 text-2xl flex items-center justify-center">🔊</button>
            </div>
            <div className="grid gap-3" data-testid="science-options">
              {cur.options.map((o) => (
                <motion.button key={o} data-testid={`science-option-${o.replace(/\s/g, "-")}`} whileTap={{ scale: 0.96 }}
                  animate={wrong === o ? { x: [0, -8, 8, -8, 0] } : {}}
                  onClick={() => answer(o)}
                  className="tactile bg-white border-green-300 rounded-2xl py-4 font-display text-xl font-bold text-green-700">
                  {o}
                </motion.button>
              ))}
            </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
