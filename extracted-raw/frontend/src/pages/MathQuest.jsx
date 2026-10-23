import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KidHeader } from "@/components/KidHeader";
import { Confetti, RewardModal } from "@/components/Celebrate";
import { useAuth } from "@/context/AuthContext";
import { LEVEL3_STARS } from "@/data/content";
import { api } from "@/lib/api";
import { sfx, speak } from "@/lib/sound";

const COUNT_EMOJI = ["🍎", "⭐", "🐱", "🎈", "🍓", "🚗", "🐸", "🦋"];
const rnd = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

function makeOptions(answer, spread) {
  const set = new Set([answer]);
  while (set.size < 4) {
    const v = answer + rnd(-spread, spread);
    if (v >= 0 && v !== answer) set.add(v);
  }
  return [...set].sort(() => Math.random() - 0.5);
}

const RANGES = {
  easy: { count: [3, 6], add: [1, 9], add2: [2, 10], sub: [2, 10], mul: [2, 3, 2, 5], spread: 3 },
  medium: { count: [4, 10], add: [2, 12], add2: [10, 25], sub: [8, 20], mul: [2, 5, 2, 6], spread: 4 },
  hard: { count: [8, 15], add: [10, 40], add2: [20, 60], sub: [20, 50], mul: [2, 9, 2, 9], spread: 6 },
};

function genQuestions(difficulty = "medium") {
  const R = RANGES[difficulty] || RANGES.medium;
  const qs = [];
  const emoji = COUNT_EMOJI[rnd(0, COUNT_EMOJI.length - 1)];
  const c = rnd(R.count[0], R.count[1]);
  qs.push({ kind: "count", emoji, count: c, prompt: `How many ${emoji} do you see?`, answer: c, say: "Count them!" });
  let a = rnd(R.add[0], R.add[1]), b = rnd(R.add[0], R.add[1]);
  qs.push({ kind: "sum", prompt: `${a} + ${b} = ?`, answer: a + b, say: `${a} plus ${b}` });
  a = rnd(R.add2[0], R.add2[1]); b = rnd(R.add[0], R.add2[1]);
  qs.push({ kind: "sum", prompt: `${a} + ${b} = ?`, answer: a + b, say: `${a} plus ${b}` });
  a = rnd(R.sub[0], R.sub[1]); b = rnd(1, a);
  qs.push({ kind: "sub", prompt: `${a} − ${b} = ?`, answer: a - b, say: `${a} take away ${b}` });
  a = rnd(R.mul[0], R.mul[1]); b = rnd(R.mul[2], R.mul[3]);
  qs.push({ kind: "mul", prompt: `${a} × ${b} = ?`, answer: a * b, say: `${a} times ${b}` });
  return qs.map((q) => ({ ...q, options: makeOptions(q.answer, R.spread) }));
}

export default function MathQuest() {
  const { child, selectChild } = useAuth();
  const [quiz, setQuiz] = useState(() => genQuestions(child?.difficulty));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [reward, setReward] = useState(false);

  const locked = (child?.stars || 0) < LEVEL3_STARS;
  if (locked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-teal-100">
        <KidHeader title="Number Quest" />
        <div className="max-w-md mx-auto px-4 pt-16 text-center">
          <div className="text-7xl mb-4">🔒</div>
          <h1 className="font-display text-2xl font-bold text-slate-800 mb-2">Level 3 is coming up!</h1>
          <p className="font-semibold text-slate-500 mb-4">
            Earn <b>{LEVEL3_STARS - (child?.stars || 0)} more stars</b> to unlock the Number Quest.
          </p>
          <div className="kid-card p-4 inline-flex items-center gap-2 font-black text-teal-600">⭐ {child?.stars || 0} / {LEVEL3_STARS}</div>
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
      if (idx + 1 < quiz.length) {
        setTimeout(() => setIdx(idx + 1), 550);
      } else {
        finish(ns);
      }
    } else {
      sfx.wrong();
      setWrong(opt);
      setTimeout(() => setWrong(null), 500);
    }
  };

  const finish = async (ns) => {
    sfx.fanfare();
    setReward(true);
    const pts = ns * 10 + 10;
    try {
      const { data } = await api.post(`/children/${child.id}/activity`, {
        type: "math", detail: "number-quest", points: pts, stars: 2,
        accuracy: Math.round((ns / quiz.length) * 100), duration: 60,
      });
      selectChild(data);
    } catch {}
  };

  const restart = () => { setReward(false); setQuiz(genQuestions(child?.difficulty)); setIdx(0); setScore(0); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-teal-100 pb-10">
      <KidHeader title="Number Quest 🧮" />
      <Confetti show={confetti} />
      <RewardModal open={reward} points={score * 10 + 10} title={`You got ${score}/${quiz.length}! 🌟`} onClose={restart} />

      <div className="max-w-xl lg:max-w-4xl mx-auto px-4 pt-5">
        <p className="text-center text-xl font-black uppercase tracking-wider text-teal-500 mb-2" data-testid="math-difficulty">
          {(child?.difficulty || "medium")} level
        </p>
        <div className="flex gap-1.5 mb-5">
          {quiz.map((_, i) => (
            <div key={i} className={`h-2.5 flex-1 rounded-full ${i < idx ? "bg-emerald-400" : i === idx ? "bg-amber-400" : "bg-white/70"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
            className="kid-card p-6 text-center">
            <p className="text-xl font-black uppercase tracking-wider text-teal-500 mb-3">Question {idx + 1} of {quiz.length}</p>

            {cur.kind === "count" ? (
              <>
                <div className="grid grid-cols-5 gap-2 justify-items-center mb-4" data-testid="count-items">
                  {Array.from({ length: cur.count }).map((_, i) => (
                    <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.06 }} className="text-4xl">
                      {cur.emoji}
                    </motion.span>
                  ))}
                </div>
                <h2 className="font-display text-xl font-bold text-slate-800 mb-5">{cur.prompt}</h2>
              </>
            ) : (
              <h2 className="font-display text-5xl font-bold text-indigo-700 mb-6" data-testid="math-prompt">{cur.prompt}</h2>
            )}

            <button data-testid="math-hear-button" onClick={() => { sfx.tap(); speak(cur.say); }}
              className="tactile bg-teal-50 border-teal-300 rounded-2xl min-h-12 px-5 py-2 text-xl font-bold text-teal-700 mb-5 inline-flex items-center gap-2">
              🔊 Hear the question
            </button>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" data-testid="math-options">
              {cur.options.map((o) => (
                <motion.button key={o} data-testid={`math-option-${o}`} whileTap={{ scale: 0.95 }}
                  animate={wrong === o ? { x: [0, -8, 8, -8, 0] } : {}}
                  onClick={() => answer(o)}
                  className="tactile bg-white border-teal-300 rounded-2xl py-5 font-display text-3xl font-bold text-teal-700">
                  {o}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
