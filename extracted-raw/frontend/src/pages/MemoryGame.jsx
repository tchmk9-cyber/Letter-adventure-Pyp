import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { KidHeader } from "@/components/KidHeader";
import { Confetti, RewardModal } from "@/components/Celebrate";
import { useAuth } from "@/context/AuthContext";
import { LETTERS } from "@/data/content";
import { api } from "@/lib/api";
import { sfx, speak } from "@/lib/sound";

const MATCH_POINTS = 5;
const BOARD_BONUS = 20;

function buildDeck() {
  const picks = [...LETTERS].sort(() => Math.random() - 0.5).slice(0, 6);
  const cards = [];
  picks.forEach((p, i) => {
    cards.push({ id: `${i}-up`, key: p.l, face: p.l, kind: "upper" });
    cards.push({ id: `${i}-lo`, key: p.l, face: p.l.toLowerCase(), kind: "lower" });
  });
  return cards.sort(() => Math.random() - 0.5);
}

export default function MemoryGame() {
  const { child, selectChild } = useAuth();
  const [deck, setDeck] = useState(buildDeck);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [reward, setReward] = useState(false);
  const [busy, setBusy] = useState(false);

  const restart = () => { sfx.tap(); setDeck(buildDeck()); setFlipped([]); setMatched([]); setMoves(0); };

  const award = async (body) => {
    try {
      const { data } = await api.post(`/children/${child.id}/activity`, { type: "memory", duration: 0, ...body });
      selectChild(data);
    } catch {}
  };

  const flip = (card) => {
    if (busy || flipped.length === 2 || flipped.find((f) => f.id === card.id) || matched.includes(card.key)) return;
    sfx.tap();
    speak(card.face);
    const nf = [...flipped, card];
    setFlipped(nf);
    if (nf.length === 2) {
      setMoves((m) => m + 1);
      setBusy(true);
      if (nf[0].key === nf[1].key) {
        setTimeout(() => {
          sfx.coin();
          setMatched((m) => [...m, nf[0].key]);
          setFlipped([]);
          setBusy(false);
          award({ detail: "match", points: MATCH_POINTS, stars: 0 });
        }, 500);
      } else {
        setTimeout(() => { sfx.wrong(); setFlipped([]); setBusy(false); }, 850);
      }
    }
  };

  useEffect(() => {
    if (matched.length === 6 && deck.length) {
      sfx.fanfare();
      setConfetti(true);
      setReward(true);
      setTimeout(() => setConfetti(false), 1800);
      award({ detail: "board-complete", points: BOARD_BONUS, stars: 2,
        accuracy: Math.max(40, 100 - (moves - 6) * 8), duration: 40 });
    }
  }, [matched.length]); // eslint-disable-line

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-violet-100 pb-10">
      <KidHeader title="Memory Match" />
      <Confetti show={confetti} />
      <RewardModal open={reward} points={BOARD_BONUS} title="Board complete bonus! 🧠" onClose={() => { setReward(false); restart(); }} />
      <div className="max-w-md lg:max-w-3xl mx-auto px-4 pt-5">
        <p className="text-center font-bold text-slate-500 text-xl mb-1">Match BIG letters to small letters</p>
        <p className="text-center font-bold text-purple-600 text-xl mb-4" data-testid="memory-status">
          Moves: {moves} · Pairs: {matched.length}/6 · +{MATCH_POINTS} coins per match
        </p>
        <div className="grid grid-cols-4 lg:grid-cols-6 gap-3" data-testid="memory-grid">
          {deck.map((card) => {
            const isOpen = flipped.find((f) => f.id === card.id) || matched.includes(card.key);
            return (
              <motion.button
                key={card.id}
                data-testid={`memory-card-${card.id}`}
                whileTap={{ scale: 0.92 }}
                onClick={() => flip(card)}
                className="aspect-square rounded-2xl relative"
                style={{ perspective: 600 }}
              >
                <div className={`w-full h-full rounded-2xl flex items-center justify-center font-display text-3xl font-bold shadow-lg transition-all duration-300 ${
                  isOpen ? "bg-white text-indigo-600 border-2 border-purple-200" : "bg-purple-500 text-purple-500"
                } ${matched.includes(card.key) ? "ring-4 ring-emerald-300" : ""}`}>
                  {isOpen ? card.face : "?"}
                </div>
              </motion.button>
            );
          })}
        </div>
        <button data-testid="memory-restart-button" onClick={restart}
          className="w-full tactile bg-white border-slate-200 rounded-2xl py-3 font-bold text-slate-600 mt-5">
          🔄 New Game
        </button>
      </div>
    </div>
  );
}
