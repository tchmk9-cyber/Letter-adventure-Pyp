import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AVATARS, DIFFICULTIES } from "@/data/content";
import { sfx } from "@/lib/sound";

export default function ChildSelect() {
  const { selectChild, logout } = useAuth();
  const navigate = useNavigate();
  const [kids, setKids] = useState([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", avatar: "fox", theme: "princess", difficulty: "medium" });

  const load = async () => {
    const { data } = await api.get("/children");
    setKids(data);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name.trim()) return;
    const { data } = await api.post("/children", form);
    sfx.correct();
    setAdding(false);
    setForm({ name: "", avatar: "fox", theme: "princess", difficulty: "medium" });
    setKids([...kids, data]);
  };

  const pick = (c) => { sfx.coin(); selectChild(c); navigate("/play"); };

  const remove = async (e, id) => {
    e.stopPropagation();
    await api.delete(`/children/${id}`);
    setKids(kids.filter((k) => k.id !== id));
  };

  const emoji = (id) => AVATARS.find((a) => a.id === id)?.emoji || "🦊";

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-amber-50 p-5">
      <div className="max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 pt-2">
          <h1 className="font-display text-3xl font-bold text-indigo-700">Who's learning today?</h1>
          <div className="flex gap-2">
            <button data-testid="parent-portal-link" onClick={() => navigate("/parent")}
              className="tactile bg-white border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-700 flex items-center gap-2 shadow">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> Parents
            </button>
            <button data-testid="logout-button" onClick={() => { logout(); navigate("/"); }}
              className="tactile bg-white border-slate-200 rounded-2xl px-3 py-2.5 shadow">
              <LogOut className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {kids.map((c, i) => (
            <motion.button
              key={c.id}
              data-testid={`child-card-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => pick(c)}
              className="kid-card p-5 flex flex-col items-center gap-2 relative"
            >
              <span onClick={(e) => remove(e, c.id)} className="absolute top-2 right-2 text-rose-400 p-1">
                <Trash2 className="w-4 h-4" />
              </span>
              <div className="text-6xl">{emoji(c.avatar)}</div>
              <div className="font-display font-bold text-2xl text-slate-800">{c.name}</div>
              <div className="text-xl font-bold text-amber-600">⭐ {c.stars} · 🪙 {c.points}</div>
            </motion.button>
          ))}

          <button
            data-testid="add-child-button"
            onClick={() => setAdding(true)}
            className="kid-card border-dashed border-2 border-indigo-200 p-5 flex flex-col items-center justify-center gap-2 text-indigo-500 min-h-[150px]"
          >
            <Plus className="w-10 h-10" />
            <span className="font-bold text-xl">Add child</span>
          </button>
        </div>
      </div>

      {adding && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-5 z-50">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="kid-card p-6 w-full max-w-sm">
            <h2 className="font-display text-2xl font-bold text-slate-800 mb-4">New learner</h2>
            <input
              data-testid="child-name-input"
              className="w-full rounded-2xl border-2 border-amber-100 px-4 py-3 font-semibold outline-none focus:border-indigo-400 mb-4"
              placeholder="Child's name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <p className="font-bold text-sm text-slate-500 mb-2">Pick a buddy</p>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {AVATARS.map((a) => (
                <button key={a.id} onClick={() => setForm({ ...form, avatar: a.id })}
                  className={`text-3xl p-1.5 rounded-xl ${form.avatar === a.id ? "bg-amber-200 ring-2 ring-amber-400" : "bg-amber-50"}`}>
                  {a.emoji}
                </button>
              ))}
            </div>
            <p className="font-bold text-sm text-slate-500 mb-2">Adventure theme</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[["princess", "👑 Princess"], ["king", "🤴 King"]].map(([v, label]) => (
                <button key={v} onClick={() => setForm({ ...form, theme: v })}
                  className={`py-2.5 rounded-2xl font-bold ${form.theme === v ? "bg-pink-500 text-white" : "bg-amber-50 text-slate-600"}`}>
                  {label}
                </button>
              ))}
            </div>
            <p className="font-bold text-sm text-slate-500 mb-2">Learning level</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {DIFFICULTIES.map((d) => (
                <button key={d.id} data-testid={`new-difficulty-${d.id}`} onClick={() => setForm({ ...form, difficulty: d.id })}
                  className={`py-2 rounded-2xl font-bold text-sm ${form.difficulty === d.id ? "bg-indigo-600 text-white" : "bg-amber-50 text-slate-600"}`}>
                  {d.label}<span className="block text-[10px] font-semibold opacity-80">{d.sub}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAdding(false)} className="flex-1 py-3 rounded-2xl font-bold bg-slate-100 text-slate-600">Cancel</button>
              <button data-testid="save-child-button" onClick={create} className="flex-1 tactile bg-yellow-400 border-amber-600 rounded-2xl py-3 font-black text-slate-900">Add</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
