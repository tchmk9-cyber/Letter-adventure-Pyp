import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api, formatApiError } from "@/lib/api";

const pinInput = "w-full text-center tracking-[0.6em] text-3xl font-bold border-2 border-slate-200 rounded-2xl py-3 outline-none focus:border-indigo-500 mb-3";

export const PinGate = ({ onUnlock, onBack }) => {
  const [mode, setMode] = useState(null);
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/parent/pin-status").then(({ data }) => setMode(data.has_pin ? "verify" : "create"));
  }, []);

  const submit = async () => {
    setErr("");
    if (pin.length !== 4) return setErr("PIN must be 4 digits");
    try {
      if (mode === "verify") {
        await api.post("/parent/verify-pin", { pin });
      } else {
        if (pin !== confirm) return setErr("PINs don't match");
        await api.put("/parent/pin", { new_pin: pin, password: mode === "reset" ? password : undefined });
      }
      onUnlock();
    } catch (e) {
      setErr(formatApiError(e.response?.data?.detail) || "Something went wrong");
    }
  };

  const switchMode = (m) => { setMode(m); setPin(""); setConfirm(""); setPassword(""); setErr(""); };
  const digits = (setter) => (e) => setter(e.target.value.replace(/\D/g, ""));
  const title = { verify: "Enter your 4-digit PIN", create: "Create a 4-digit PIN to protect this area", reset: "Enter your account password and a new PIN" }[mode];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-5">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl" data-testid="pin-gate">
        <div className="text-5xl mb-3">🔒</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "Plus Jakarta Sans" }}>Parent Portal</h1>
        <p className="text-slate-500 text-sm mb-5 font-semibold" data-testid="pin-gate-title">{title || "Loading…"}</p>
        {mode === "reset" && (
          <input data-testid="pin-reset-password" type="password" value={password} placeholder="Account password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-indigo-500 mb-3" />
        )}
        <input data-testid="parent-pin-input" inputMode="numeric" maxLength={4} value={pin} placeholder="••••"
          onChange={digits(setPin)} onKeyDown={(e) => e.key === "Enter" && submit()} className={pinInput} />
        {mode && mode !== "verify" && (
          <input data-testid="parent-pin-confirm" inputMode="numeric" maxLength={4} value={confirm} placeholder="Repeat PIN"
            onChange={digits(setConfirm)} onKeyDown={(e) => e.key === "Enter" && submit()} className={pinInput} />
        )}
        {err && <p className="text-rose-600 font-semibold text-sm mb-3" data-testid="pin-error">{err}</p>}
        <button data-testid="verify-pin-button" onClick={submit} disabled={!mode}
          className="w-full bg-indigo-600 text-white rounded-2xl py-3 font-bold hover:bg-indigo-700 transition">
          {mode === "verify" ? "Unlock" : "Save PIN"}
        </button>
        {mode === "verify" && (
          <button data-testid="forgot-pin-button" onClick={() => switchMode("reset")} className="w-full text-indigo-600 text-sm font-semibold mt-3">Forgot PIN?</button>
        )}
        {mode === "reset" && (
          <button data-testid="cancel-reset-pin" onClick={() => switchMode("verify")} className="w-full text-indigo-600 text-sm font-semibold mt-3">Back to PIN entry</button>
        )}
        <button data-testid="pin-back-to-kids" onClick={onBack} className="w-full text-slate-400 text-sm font-semibold mt-3">← Back to kids</button>
      </motion.div>
    </div>
  );
};
