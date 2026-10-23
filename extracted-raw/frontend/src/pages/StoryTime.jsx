import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ArrowLeft, Lock } from "lucide-react";
import { KidHeader } from "@/components/KidHeader";
import { Confetti, RewardModal } from "@/components/Celebrate";
import { useAuth } from "@/context/AuthContext";
import { STORIES, LEVEL2_STARS } from "@/data/content";
import { api } from "@/lib/api";
import { sfx, speak } from "@/lib/sound";

export default function StoryTime() {
  const { child, selectChild } = useAuth();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [stage, setStage] = useState("read"); // read | drill
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [reward, setReward] = useState(false);

  const locked = (child?.stars || 0) < LEVEL2_STARS;

  if (locked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-100">
        <KidHeader title="Story Time" />
        <div className="max-w-md mx-auto px-4 pt-16 text-center">
          <div className="text-7xl mb-4">🔒</div>
          <h1 className="font-display text-2xl font-bold text-slate-800 mb-2">Level 2 is almost here!</h1>
          <p className="font-semibold text-slate-500 mb-4">
            Earn <b>{LEVEL2_STARS - (child?.stars || 0)} more stars</b> in Level 1 to unlock Story Time.
          </p>
          <div className="kid-card p-4 inline-flex items-center gap-2 font-black text-amber-600">⭐ {child?.stars || 0} / {LEVEL2_STARS}</div>
        </div>
      </div>
    );
  }

  const openStory = (s) => { sfx.tap(); setStory(s); setStage("read"); setQIdx(0); setScore(0); };

  const readLine = (line) => { sfx.tap(); speak(line, `word:${line}`); };

  const answer = (opt) => {
    const d = story.drills[qIdx];
    if (opt === d.answer) {
      sfx.correct();
      const ns = score + 1;
      setScore(ns);
      if (qIdx + 1 < story.drills.length) {
        setTimeout(() => setQIdx(qIdx + 1), 500);
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
    setConfetti(true);
    setReward(true);
    setTimeout(() => setConfetti(false), 1800);
    const pts = 20 + ns * 10;
    try {
      const { data } = await api.post(`/children/${child.id}/activity`, {
        type: "story", detail: story.id, points: pts, stars: 2,
        accuracy: Math.round((ns / story.drills.length) * 100), duration: 60,
      });
      selectChild(data);
    } catch {}
  };

  const closeReward = () => { setReward(false); setStory(null); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-100 pb-10">
      <KidHeader title="Story Time 📖" />
      <Confetti show={confetti} />
      <RewardModal open={reward} points={20 + score * 10} title="Story complete! 🌟" onClose={closeReward} />

      <div className="max-w-2xl lg:max-w-6xl mx-auto px-4 pt-5">
        {!story && (
          <>
            <p className="font-bold text-slate-600 text-xl mb-4 text-center">Pick a story to read aloud, then answer the questions!</p>
            <div className="grid sm:grid-cols-3 gap-4" data-testid="story-list">
              {STORIES.map((s, i) => (
                <motion.button key={s.id} data-testid={`story-${s.id}`}
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => openStory(s)} className="kid-card p-0 overflow-hidden text-left">
                  <img src={s.image} alt={s.title} className="w-full aspect-[3/2] object-cover" />
                  <div className="p-3 font-display font-bold text-xl text-slate-800">{s.title}</div>
                </motion.button>
              ))}
            </div>
          </>
        )}

        <AnimatePresence mode="wait">
          {story && stage === "read" && (
            <motion.div key="read" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} className="kid-card p-4 lg:p-6">
              <button data-testid="back-to-stories-button" onClick={() => setStory(null)}
                className="tactile bg-white border-amber-300 rounded-2xl min-h-12 px-5 py-2 inline-flex items-center gap-2 text-amber-700 font-black text-xl mb-3">
                <ArrowLeft className="w-6 h-6" /> Stories
              </button>
              <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">
              <img src={story.image} alt={story.title} className="w-full aspect-[3/2] object-cover rounded-2xl mb-4" />
              <div>
              <h2 className="font-display text-2xl font-bold text-indigo-700 mb-3">{story.title}</h2>
              <div className="space-y-2.5 mb-5">
                {story.lines.map((line, i) => (
                  <button key={i} data-testid={`story-line-${i}`} onClick={() => readLine(line)}
                    className="w-full text-left flex items-center gap-3 bg-amber-50 rounded-2xl px-3 py-2 font-display text-xl font-bold text-slate-700 hover:bg-amber-100 transition">
                    <span className="w-12 h-12 shrink-0 rounded-xl bg-pink-100 flex items-center justify-center" data-testid={`story-line-speaker-${i}`}>
                      <Volume2 className="w-6 h-6 text-pink-500" />
                    </span>
                    {line}
                  </button>
                ))}
              </div>
              </div>
              </div>
              <button data-testid="start-drill-button" onClick={() => { sfx.tap(); setStage("drill"); }}
                className="w-full tactile bg-yellow-400 border-amber-600 rounded-2xl py-3.5 font-black text-slate-900 text-lg">
                Answer Questions →
              </button>
            </motion.div>
          )}

          {story && stage === "drill" && (
            <motion.div key="drill" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="kid-card p-6 text-center">
              <p className="text-xl font-black uppercase tracking-wider text-amber-500 mb-2">Question {qIdx + 1} of {story.drills.length}</p>
              <h2 className="font-display text-2xl font-bold text-slate-800 mb-6">{story.drills[qIdx].q}</h2>
              <div className="grid gap-3" data-testid="drill-options">
                {story.drills[qIdx].options.map((o) => (
                  <motion.button key={o} data-testid={`drill-option-${o.replace(/\s/g, "-")}`}
                    whileTap={{ scale: 0.96 }} animate={wrong === o ? { x: [0, -8, 8, -8, 0] } : {}}
                    onClick={() => answer(o)}
                    className="tactile bg-white border-indigo-300 rounded-2xl py-4 font-display text-xl font-bold text-indigo-600">
                    {o}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
