import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Coins, Lock } from "lucide-react";
import { KidHeader } from "@/components/KidHeader";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiError } from "@/lib/api";
import { sfx } from "@/lib/sound";

export default function Arcade() {
  const { child, selectChild } = useAuth();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");

  const theme = child?.theme || "princess";
  const royal = theme === "king"
    ? { title: "Save the King", emoji: "🤴", to: "/game/royal" }
    : { title: "Save the Princess", emoji: "👑", to: "/game/royal" };

  const GAMES = [
    { ...royal, cost: 30, color: "bg-pink-400 border-pink-600", desc: "Spell words to cross bridges!" },
    { title: "Find the Key", emoji: "🗝️", to: "/game/key", cost: 20, color: "bg-amber-400 border-amber-600", desc: "Flip doors, find golden keys!" },
    { title: "Memory Challenge", emoji: "🃏", to: "/memory", cost: 0, color: "bg-purple-400 border-purple-600", desc: "Free to play, earn points!" },
  ];

  const playGame = async (g) => {
    if (g.cost === 0) { sfx.tap(); navigate(g.to); return; }
    if ((child?.points || 0) < g.cost) {
      sfx.wrong();
      setMsg(`You need ${g.cost} points. Keep learning to earn more! ⭐`);
      setTimeout(() => setMsg(""), 2500);
      return;
    }
    try {
      const { data } = await api.post(`/children/${child.id}/spend`, { game: g.title, cost: g.cost });
      selectChild(data);
      sfx.coin();
      navigate(g.to);
    } catch (err) {
      setMsg(formatApiError(err.response?.data?.detail));
      setTimeout(() => setMsg(""), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-yellow-100 pb-10">
      <KidHeader title="Rewards Arcade" />
      <div className="max-w-xl mx-auto px-4 pt-5">
        <div className="kid-card p-5 text-center mb-5">
          <p className="font-bold text-slate-500">Your coins</p>
          <div className="font-display text-5xl font-bold text-amber-500 flex items-center justify-center gap-2">
            <Coins className="w-9 h-9" /> {child?.points || 0}
          </div>
          <p className="text-xl font-semibold text-slate-500 mt-1">Spend coins to unlock fun games!</p>
        </div>

        {msg && <div data-testid="arcade-message" className="bg-rose-100 text-rose-700 font-bold rounded-2xl p-3 text-center mb-4">{msg}</div>}

        <div className="space-y-4">
          {GAMES.map((g, i) => {
            const locked = g.cost > 0 && (child?.points || 0) < g.cost;
            return (
              <motion.button
                key={g.title}
                data-testid={`arcade-game-${i}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => playGame(g)}
                className={`tactile ${g.color} rounded-3xl p-5 w-full text-white shadow-lg flex items-center gap-4 text-left`}
              >
                <span className="text-5xl">{g.emoji}</span>
                <div className="flex-1">
                  <div className="font-display font-bold text-xl">{g.title}</div>
                  <div className="font-semibold text-white/90 text-sm">{g.desc}</div>
                </div>
                <div className="bg-white/25 rounded-2xl px-3 py-2 font-black flex items-center gap-1">
                  {locked && <Lock className="w-4 h-4" />}
                  {g.cost === 0 ? "FREE" : `${g.cost}🪙`}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
