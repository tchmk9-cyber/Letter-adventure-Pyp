import { motion } from "framer-motion";
import { Star, Coins, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function KidHeader({ back = true, title }) {
  const { child } = useAuth();
  const navigate = useNavigate();
  if (!child) return null;
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b-2 border-amber-100">
      <div className="max-w-5xl xl:max-w-7xl mx-auto px-4 xl:px-8 py-3 flex items-center gap-3">
        {back && (
          <button
            data-testid="back-button"
            onClick={() => navigate("/play")}
            className="tactile bg-white border-amber-200 rounded-2xl w-11 h-11 flex items-center justify-center shadow"
          >
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
        )}
        {title && <h2 className="font-display font-bold text-lg sm:text-xl text-slate-800 truncate">{title}</h2>}
        <div className="ml-auto flex items-center gap-2">
          <motion.div
            data-testid="points-counter-display"
            key={child.points}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 bg-yellow-400 tactile border-amber-600 rounded-full px-3.5 py-1.5 font-black text-slate-900 shadow"
          >
            <Coins className="w-5 h-5" /> {child.points}
          </motion.div>
          <div
            data-testid="star-counter-display"
            className="flex items-center gap-1.5 bg-pink-500 tactile border-pink-700 rounded-full px-3.5 py-1.5 font-black text-white shadow"
          >
            <Star className="w-5 h-5 fill-white" /> {child.stars}
          </div>
        </div>
      </div>
    </header>
  );
}
