import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Square, Play, ArrowLeft, Trash2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LETTERS, WORDS } from "@/data/content";

function Recorder({ clipKey, label, hasClip, onSaved, onDelete }) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rec, setRec] = useState(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        setBusy(true);
        const fd = new FormData();
        fd.append("key", clipKey);
        fd.append("file", blob, "clip.webm");
        try {
          await api.post("/voice/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
          onSaved();
        } finally {
          setBusy(false);
        }
      };
      mr.start();
      setRec(mr);
      setRecording(true);
    } catch (e) {
      alert("Please allow microphone access to record your voice.");
    }
  };
  const stop = () => { rec?.stop(); setRecording(false); };

  const playClip = async () => {
    try {
      const { data } = await api.get("/voice");
      const url = data[clipKey];
      if (url) new Audio(`${process.env.REACT_APP_BACKEND_URL}${url}`).play();
    } catch {}
  };

  return (
    <div data-testid={`voice-row-${clipKey}`} className="flex items-center gap-3 bg-white border-2 border-amber-100 rounded-2xl p-3">
      <div className="font-display font-bold text-lg text-slate-800 w-16">{label}</div>
      {hasClip && !recording && (
        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved</span>
      )}
      <div className="ml-auto flex items-center gap-2">
        {hasClip && (
          <button data-testid={`play-${clipKey}`} onClick={playClip} className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
            <Play className="w-5 h-5" />
          </button>
        )}
        {hasClip && (
          <button onClick={() => onDelete(clipKey)} className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
        {!recording ? (
          <button data-testid={`record-${clipKey}`} onClick={start} disabled={busy}
            className="tactile bg-pink-500 border-pink-700 text-white rounded-xl px-4 h-10 font-bold flex items-center gap-2 disabled:opacity-50">
            <Mic className="w-5 h-5" /> {busy ? "Saving…" : hasClip ? "Redo" : "Record"}
          </button>
        ) : (
          <button data-testid={`stop-${clipKey}`} onClick={stop}
            className="tactile bg-slate-800 border-black text-white rounded-xl px-4 h-10 font-bold flex items-center gap-2 animate-pulse">
            <Square className="w-4 h-4 fill-white" /> Stop
          </button>
        )}
      </div>
    </div>
  );
}

export default function VoiceStudio() {
  const navigate = useNavigate();
  const { loadVoices } = useAuth();
  const [tab, setTab] = useState("letters");
  const [clips, setClips] = useState({});

  const load = async () => {
    const { data } = await api.get("/voice");
    setClips(data);
    loadVoices();
  };
  useEffect(() => { load(); }, []);

  const del = async (key) => {
    await api.delete(`/voice?key=${encodeURIComponent(key)}`);
    load();
  };

  const letters = LETTERS.map((L) => ({ key: `letter:${L.l}`, label: `${L.l} ${L.l.toLowerCase()}` }));
  const words = WORDS.map((W) => ({ key: `word:${W.word}`, label: `${W.emoji} ${W.word}` }));
  const rows = tab === "letters" ? letters : words;
  const savedCount = Object.keys(clips).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-amber-50 pb-10">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 border-b-2 border-amber-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button data-testid="voice-back" onClick={() => navigate("/parent")}
            className="tactile bg-white border-amber-200 rounded-2xl w-11 h-11 flex items-center justify-center shadow">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="font-display font-bold text-xl text-slate-800">🎤 My Voice Studio</h1>
          <span className="ml-auto text-sm font-bold text-emerald-600">{savedCount} saved</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-5">
        <p className="text-slate-500 font-semibold text-sm mb-4">
          Record your own voice for each letter and word. Kids will hear <b>you</b> instead of the computer voice during drills!
        </p>
        <div className="flex gap-2 mb-5 bg-white rounded-2xl p-1 border-2 border-amber-100">
          {["letters", "words"].map((t) => (
            <button key={t} data-testid={`voice-tab-${t}`} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl font-bold capitalize transition ${tab === t ? "bg-indigo-600 text-white" : "text-slate-500"}`}>
              {t}
            </button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
          {rows.map((r) => (
            <Recorder key={r.key} clipKey={r.key} label={r.label} hasClip={!!clips[r.key]} onSaved={load} onDelete={del} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
