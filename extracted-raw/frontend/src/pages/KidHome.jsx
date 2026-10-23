import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, Sparkles, Settings } from "lucide-react";
import { KidHeader } from "@/components/KidHeader";
import { useAuth } from "@/context/AuthContext";
import { sfx } from "@/lib/sound";
import { AVATARS, LEVEL2_STARS, LEVEL3_STARS, LEVEL4_STARS } from "@/data/content";

const ACTIVITIES = [
  { to: "/letters", testid: "nav-letter-drill", emoji: "🔤", title: "Letter Sounds", color: "bg-sky-400 border-blue-600" },
  { to: "/words", testid: "nav-word-learn", emoji: "📖", title: "Read Words", color: "bg-emerald-400 border-emerald-600" },
  { to: "/memory", testid: "nav-memory-game", emoji: "🃏", title: "Memory Match", color: "bg-purple-400 border-purple-600" },
  { to: "/coloring", testid: "nav-coloring", emoji: "🎨", title: "Coloring", color: "bg-pink-400 border-pink-600" },
  { to: "/arcade", testid: "nav-arcade", emoji: "🕹️", title: "Rewards Arcade", color: "bg-amber-400 border-amber-600" },
];

const LEVELS = [
  { n: 1, title: "Letters & Words", emoji: "🏝️", playing: true },
  { n: 2, title: "Short Stories", emoji: "🏕️", to: "/stories", gate: LEVEL2_STARS },
  { n: 3, title: "Number Quest", emoji: "🧮", to: "/math", gate: LEVEL3_STARS },
  { n: 4, title: "Science & Social", emoji: "🔬", to: "/science", gate: LEVEL4_STARS },
];

export default function KidHome() {
  const { child } = useAuth();
  const navigate = useNavigate();
  if (!child) { navigate("/children"); return null; }
  const emoji = AVATARS.find((a) => a.id === child.avatar)?.emoji || "🦊";

  const go = (to) => { sfx.tap(); navigate(to); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 pb-10">
      <KidHeader back={false} />
      <div className="max-w-5xl xl:max-w-7xl mx-auto px-4 xl:px-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-4 py-5">
          <div className="text-6xl animate-float-slow">{emoji}</div>
          <div>
            <p className="font-semibold text-xl text-slate-500">Hi there,</p>
            <h1 className="font-display text-3xl font-bold text-slate-800">{child.name}! 👋</h1>
          </div>
          <button data-testid="go-children-button" onClick={() => navigate("/children")}
            className="ml-auto tactile bg-white border-amber-200 rounded-2xl p-3 shadow">
            <Settings className="w-5 h-5 text-slate-500" />
          </button>
        </motion.div>

        <h2 className="font-display text-2xl font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" /> Let's Play & Learn
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-8" data-testid="activity-grid">
          {ACTIVITIES.map((a, i) => (
            <motion.button
              key={a.to}
              data-testid={a.testid}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.07, type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => go(a.to)}
              className={`tactile ${a.color} rounded-3xl p-5 text-white shadow-lg flex flex-col items-center gap-2 aspect-square justify-center`}
            >
              <span className="text-5xl drop-shadow">{a.emoji}</span>
              <span className="font-display font-bold text-xl sm:text-2xl leading-tight text-center">{a.title}</span>
            </motion.button>
          ))}
        </div>

        <h2 className="font-display text-2xl font-bold text-slate-700 mb-3">🗺️ Adventure Levels</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LEVELS.map((lv) => {
            const stars = child.stars || 0;
            const unlocked = lv.playing || (lv.to && stars >= lv.gate);
            const clickable = lv.playing || !!lv.to;
            return (
              <button key={lv.n} data-testid={`level-${lv.n}`} disabled={!clickable}
                onClick={() => { if (lv.to) { sfx.tap(); navigate(lv.to); } }}
                className={`kid-card p-4 text-center relative ${clickable ? "" : "opacity-70"}`}>
                {((lv.gate && !unlocked) || lv.soon) && <Lock className="w-5 h-5 text-slate-400 absolute top-3 right-3" />}
                <div className="text-4xl mb-1">{lv.emoji}</div>
                <div className="font-black text-xl text-indigo-600">Level {lv.n}</div>
                <div className="text-xl font-bold text-slate-500 leading-tight">{lv.title}</div>
                {lv.playing && <span className="inline-block mt-2 text-base font-black text-emerald-600 bg-emerald-50 px-3 py-0.5 rounded-full">PLAYING</span>}
                {lv.gate && (unlocked
                  ? <span className="inline-block mt-2 text-base font-black text-emerald-600 bg-emerald-50 px-3 py-0.5 rounded-full">UNLOCKED</span>
                  : <span className="inline-block mt-2 text-xl font-bold text-amber-500">⭐ {stars}/{lv.gate}</span>)}
                {lv.soon && <span className="inline-block mt-2 text-base font-bold text-slate-400">Coming soon</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
