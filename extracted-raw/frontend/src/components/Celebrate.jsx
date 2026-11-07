import { useEffect } from "react";
import { motion } from "framer-motion";

export function Confetti({ show }) {
  if (!show) return null;
  const pieces = Array.from({ length: 40 });
  const colors = ["#FBBF24", "#EC4899", "#10B981", "#3B82F6", "#8B5CF6", "#F43F5E"];
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((_, i) => (
        <motion.span
          key={i}
          initial={{ y: -40, x: `${Math.random() * 100}vw`, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: 720, opacity: 0 }}
          transition={{ duration: 1.6 + Math.random(), ease: "easeIn", delay: Math.random() * 0.3 }}
          style={{ background: colors[i % colors.length], width: 12, height: 12, borderRadius: 3, position: "absolute", top: 0 }}
        />
      ))}
    </div>
  );
}

export function RewardModal({ open, points, title, onClose }) {
  useEffect(() => {
    if (open) {
      const t = setTimeout(onClose, 2600);
      return () => clearTimeout(t);
    }
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" data-testid="reward-modal">
      <motion.div
        initial={{ scale: 0, rotate: -12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 16 }}
        className="kid-card p-8 text-center max-w-xs w-full"
      >
        <div className="text-6xl mb-2 animate-float-slow">🎉</div>
        <h3 className="font-display text-2xl font-bold text-slate-800">{title || "Great job!"}</h3>
        {points != null && (
          <div className="mt-3 inline-flex items-center gap-2 bg-yellow-400 rounded-full px-5 py-2 font-black text-slate-900 text-xl">
            +{points} points
          </div>
        )}
      </motion.div>
    </div>
  );
}
