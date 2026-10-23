import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { sfx } from "@/lib/sound";

export default function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login"
        ? { email: form.email, password: form.password }
        : form;
      const { data } = await api.post(path, payload);
      sfx.coin();
      setUser(data);
      navigate("/children");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-b from-amber-50 to-orange-100">
      <div className="absolute top-10 left-8 text-6xl animate-float-slow">🦊</div>
      <div className="absolute bottom-12 right-10 text-5xl animate-float-slow" style={{ animationDelay: "1s" }}>⭐</div>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="kid-card p-8 w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">📚</div>
          <h1 className="font-display text-3xl font-bold text-indigo-700">Letter Adventure</h1>
          <p className="text-slate-500 font-semibold text-sm mt-1">Learn to read & write, the fun way!</p>
        </div>

        <div className="flex gap-2 mb-5 bg-amber-50 rounded-2xl p-1">
          {["login", "register"].map((m) => (
            <button
              key={m}
              data-testid={`tab-${m}`}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2.5 rounded-xl font-bold capitalize transition ${
                mode === m ? "bg-indigo-600 text-white shadow" : "text-slate-500"
              }`}
            >
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <input
              data-testid="name-input"
              className="w-full rounded-2xl border-2 border-amber-100 px-4 py-3 font-semibold outline-none focus:border-indigo-400"
              placeholder="Parent name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          )}
          <input
            data-testid="email-input"
            type="email"
            className="w-full rounded-2xl border-2 border-amber-100 px-4 py-3 font-semibold outline-none focus:border-indigo-400"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            data-testid="password-input"
            type="password"
            className="w-full rounded-2xl border-2 border-amber-100 px-4 py-3 font-semibold outline-none focus:border-indigo-400"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <p data-testid="auth-error" className="text-rose-600 font-semibold text-sm">{error}</p>}
          <button
            data-testid="submit-auth-button"
            disabled={loading}
            className="w-full tactile bg-yellow-400 border-amber-600 rounded-2xl py-3.5 font-black text-slate-900 text-lg disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "login" ? "Let's Go!" : "Create Account"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
