import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { KidHeader } from "@/components/KidHeader";
import { Confetti, RewardModal } from "@/components/Celebrate";
import { useAuth } from "@/context/AuthContext";
import { WORDS } from "@/data/content";
import { api } from "@/lib/api";
import { sfx, speak } from "@/lib/sound";

function shuffle(a) { return [...a].sort(() => Math.random() - 0.5); }

export default function WordLearn() {
  const { child, selectChild } = useAuth();
  const [idx, setIdx] = useState(0);
  const [slots, setSlots] = useState([]);
  const [tray, setTray] = useState([]);
  const [confetti, setConfetti] = useState(false);
  const [reward, setReward] = useState(false);
  const cur = WORDS[idx];

  const setup = (i) => {
    const w = WORDS[i].word;
    setSlots(Array(w.length).fill(null));
    setTray(shuffle(w.split("")).map((ch, k) => ({ ch, id: `${ch}-${k}` })));
  };
  useEffect(() => { setup(idx); }, [idx]);

  const place = (tile) => {
    sfx.tap();
    const firstEmpty = slots.findIndex((s) => s === null);
    if (firstEmpty === -1) return;
    const ns = [...slots]; ns[firstEmpty] = tile;
    setSlots(ns);
    setTray(tray.filter((t) => t.id !== tile.id));
    speak(tile.ch);
    if (!ns.includes(null)) check(ns);
  };

  const reset = () => { sfx.tap(); setup(idx); };

  const check = async (ns) => {
    const built = ns.map((s) => s.ch).join("");
    if (built === cur.word) {
      sfx.correct();
      speak(cur.word);
      setConfetti(true);
      setReward(true);
      setTimeout(() => setConfetti(false), 1800);
      try {
        const { data } = await api.post(`/children/${child.id}/activity`, {
          type: "word", detail: cur.word, points: 15, stars: 1, accuracy: 100, duration: 20,
        });
        selectChild(data);
      } catch {}
    } else {
      sfx.wrong();
      setTimeout(() => setup(idx), 600);
    }
  };

  const next = () => { setReward(false); setIdx((idx + 1) % WORDS.length); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 pb-10">
      <KidHeader title="Read Words" />
      <Confetti show={confetti} />
      <RewardModal open={reward} points={15} title="You read it! 🎉" onClose={next} />
      <div className="max-w-xl lg:max-w-4xl mx-auto px-4 pt-5">
        <motion.div key={cur.word} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="kid-card p-6 text-center">
          <div className="text-7xl mb-2">{cur.emoji}</div>
          <button data-testid="word-hear-button" onClick={() => { sfx.tap(); speak(cur.word, `word:${cur.word}`); }}
            className="tactile bg-emerald-400 border-emerald-600 text-white rounded-2xl px-6 py-3 font-black inline-flex items-center gap-2 mb-5">
            <Volume2 className="w-6 h-6" /> Hear the word
          </button>

          <div className="flex justify-center gap-2 mb-6" data-testid="word-slots">
            {slots.map((s, i) => (
              <div key={i} className="w-16 h-16 rounded-2xl border-4 border-dashed border-emerald-300 bg-emerald-50 flex items-center justify-center font-display text-4xl font-bold text-indigo-600">
                {s?.ch}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 mb-4" data-testid="letter-tray">
            {tray.map((t) => (
              <motion.button key={t.id} whileTap={{ scale: 0.9 }} data-testid={`tray-tile-${t.ch}`}
                onClick={() => place(t)}
                className="tactile bg-yellow-400 border-amber-600 w-16 h-16 rounded-2xl font-display text-4xl font-bold text-slate-900">
                {t.ch}
              </motion.button>
            ))}
          </div>
          <button data-testid="word-shuffle-button" onClick={reset}
            className="tactile bg-white border-emerald-300 rounded-2xl min-h-12 px-6 py-3 font-black text-xl text-emerald-700 inline-flex items-center gap-2">
            🔀 Shuffle again
          </button>
        </motion.div>

        <div className="flex flex-wrap gap-2 justify-center mt-5">
          {WORDS.map((w, i) => (
            <button key={w.word} data-testid={`word-chip-${w.word}`} onClick={() => { sfx.tap(); setIdx(i); }}
              className={`min-w-12 h-12 px-3 rounded-xl font-black text-2xl ${i === idx ? "bg-emerald-600 text-white" : "bg-white text-slate-500"}`}>
              {w.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
