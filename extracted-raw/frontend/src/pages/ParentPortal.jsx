import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ArrowLeft, Clock, Target, Trophy, Lightbulb, CheckCircle2, AlertCircle, Mic, CalendarClock } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AVATARS, DIFFICULTIES } from "@/data/content";
import { PinGate } from "@/components/PinGate";

function Stat({ icon: Icon, label, value, tint }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${tint}`}><Icon className="w-5 h-5" /></div>
      <div className="text-2xl font-extrabold text-slate-900">{value}</div>
      <div className="text-xs font-semibold text-slate-500">{label}</div>
    </div>
  );
}

export default function ParentPortal() {
  const navigate = useNavigate();
  const { logout, child, selectChild } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [kids, setKids] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [period, setPeriod] = useState("week");
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!unlocked) return;
    api.get("/children").then(({ data }) => {
      setKids(data);
      if (data[0]) setActiveId(data[0].id);
    });
    api.get("/parent/settings").then(({ data }) => setSettings(data));
  }, [unlocked]);

  const saveSettings = async () => {
    const { data } = await api.put("/parent/settings", settings);
    setSettings(data);
    setEditing(false);
  };

  const setDifficulty = async (level) => {
    const { data } = await api.put(`/children/${activeId}`, { difficulty: level });
    setKids((ks) => ks.map((k) => (k.id === data.id ? data : k)));
    if (child?.id === data.id) selectChild(data);
  };

  useEffect(() => {
    if (!activeId) return;
    api.get(`/children/${activeId}/stats?period=${period}`).then(({ data }) => setStats(data));
  }, [activeId, period]);

  if (!unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} onBack={() => navigate("/children")} />;
  }

  const tips = [
    "Practice 10–15 minutes daily — short sessions beat long ones for young readers.",
    "Let your child hear each letter sound aloud, then say it back together.",
    "Celebrate effort, not just correct answers, to build reading confidence.",
    "Re-visit 'needs practice' letters below 2–3 times this week.",
  ];
  const activeKid = kids.find((k) => k.id === activeId);
  const emoji = (id) => AVATARS.find((a) => a.id === id)?.emoji || "🦊";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center gap-3">
          <button data-testid="parent-back" onClick={() => navigate("/children")} className="p-2 hover:bg-white/10 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold" style={{ fontFamily: "Plus Jakarta Sans" }}>Progress Dashboard</h1>
          <button data-testid="voice-studio-link" onClick={() => navigate("/voice")}
            className="ml-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-1.5 text-sm font-bold">
            <Mic className="w-4 h-4" /> My Voice
          </button>
          <button data-testid="parent-logout" onClick={() => { logout(); navigate("/"); }} className="text-sm font-semibold text-slate-300 hover:text-white">Log out</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-6">
        {kids.length === 0 ? (
          <p className="text-slate-500 font-semibold">No child profiles yet. Add one from the kids screen.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <select
                data-testid="child-profile-select"
                value={activeId || ""}
                onChange={(e) => setActiveId(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-800 shadow-sm"
              >
                {kids.map((k) => <option key={k.id} value={k.id}>{emoji(k.avatar)} {k.name}</option>)}
              </select>
              {activeKid && (
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm" data-testid="difficulty-control">
                  <span className="text-xs font-bold text-slate-400 px-2">Math level</span>
                  {DIFFICULTIES.map((d) => (
                    <button key={d.id} data-testid={`difficulty-${d.id}`} onClick={() => setDifficulty(d.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-sm ${activeKid.difficulty === d.id ? "bg-indigo-600 text-white" : "text-slate-500"}`}>
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="ml-auto flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                {["week", "month"].map((p) => (
                  <button key={p} data-testid={`period-${p}`} onClick={() => setPeriod(p)}
                    className={`px-4 py-1.5 rounded-lg font-bold text-sm capitalize ${period === p ? "bg-indigo-600 text-white" : "text-slate-500"}`}>
                    {p === "week" ? "Weekly" : "Monthly"}
                  </button>
                ))}
              </div>
            </div>

            {settings && (() => {
              const la = activeKid?.last_active;
              const daysAgo = la ? Math.floor((Date.now() - new Date(la).getTime()) / 86400000) : null;
              const lastText = daysAgo == null
                ? " They haven't practiced yet — a great time to start!"
                : daysAgo === 0 ? " Practiced today — awesome! 🎉"
                : ` Last practiced ${daysAgo} day${daysAgo > 1 ? "s" : ""} ago.`;
              return (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6" data-testid="reminder-banner">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shrink-0">
                      <CalendarClock className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800">Practice reminder</h3>
                      {settings.reminders_enabled ? (
                        <p className="text-sm font-semibold text-slate-600">
                          Best time to practice with {activeKid?.name || "your child"}:{" "}
                          <b>{settings.reminder_time}</b> on <b>{settings.reminder_days.join(", ") || "—"}</b>.
                          {lastText}
                        </p>
                      ) : (
                        <p className="text-sm font-semibold text-slate-500">Reminders are off. Turn them on for gentle weekly nudges.</p>
                      )}
                      <button data-testid="edit-reminder-button" onClick={() => setEditing(!editing)} className="text-indigo-600 font-bold text-sm mt-1">
                        {editing ? "Close" : "Edit schedule"}
                      </button>
                    </div>
                  </div>
                  {editing && (
                    <div className="mt-4 bg-white rounded-2xl p-4 border border-amber-200">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <label className="font-bold text-sm text-slate-600">Time</label>
                        <input type="time" data-testid="reminder-time-input" value={settings.reminder_time}
                          onChange={(e) => setSettings({ ...settings, reminder_time: e.target.value })}
                          className="border border-slate-200 rounded-xl px-3 py-1.5 font-semibold" />
                        <label className="flex items-center gap-2 ml-auto font-bold text-sm text-slate-600">
                          <input type="checkbox" data-testid="reminders-enabled-toggle" checked={settings.reminders_enabled}
                            onChange={(e) => setSettings({ ...settings, reminders_enabled: e.target.checked })} /> Enabled
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => {
                          const on = settings.reminder_days.includes(d);
                          return (
                            <button key={d} data-testid={`day-${d}`}
                              onClick={() => setSettings({ ...settings, reminder_days: on ? settings.reminder_days.filter((x) => x !== d) : [...settings.reminder_days, d] })}
                              className={`px-3 py-1.5 rounded-xl font-bold text-sm ${on ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                              {d}
                            </button>
                          );
                        })}
                      </div>
                      <button data-testid="save-reminder-button" onClick={saveSettings}
                        className="bg-indigo-600 text-white rounded-xl px-4 py-2 font-bold hover:bg-indigo-700">Save schedule</button>
                    </div>
                  )}
                </div>
              );
            })()}

            {stats && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <Stat icon={Clock} label="Time practiced" value={`${stats.totals.minutes}m`} tint="bg-sky-100 text-sky-600" />
                  <Stat icon={Target} label="Avg accuracy" value={`${stats.totals.avg_accuracy}%`} tint="bg-emerald-100 text-emerald-600" />
                  <Stat icon={Trophy} label="Points earned" value={stats.totals.points} tint="bg-amber-100 text-amber-600" />
                  <Stat icon={CheckCircle2} label="Activities" value={stats.totals.activities} tint="bg-indigo-100 text-indigo-600" />
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
                  <h2 className="font-bold text-slate-800 mb-4">{period === "week" ? "This week's" : "This month's"} practice</h2>
                  {stats.series.length === 0 ? (
                    <p className="text-slate-400 font-semibold text-center py-10" data-testid="no-data">No activity yet. Have {activeKid?.name} play a few learning games!</p>
                  ) : (
                    <div style={{ width: "100%", height: 240 }}>
                      <ResponsiveContainer minHeight={240}>
                        <BarChart data={stats.series}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="label" tick={{ fontSize: 12, fontWeight: 600 }} stroke="#94A3B8" />
                          <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                          <Tooltip />
                          <Bar dataKey="minutes" name="Minutes" fill="#4338CA" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="points" name="Points" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Target className="w-5 h-5 text-emerald-600" /> Letter Mastery</h2>
                    <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Mastered</p>
                    <div className="flex flex-wrap gap-1.5 mb-4" data-testid="mastered-letters">
                      {stats.mastery.mastered.length ? stats.mastery.mastered.map((l) => (
                        <span key={l} className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-black flex items-center justify-center">{l}</span>
                      )) : <span className="text-slate-400 text-sm font-semibold">None yet</span>}
                    </div>
                    <p className="text-xs font-bold text-amber-600 uppercase mb-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Needs practice</p>
                    <div className="flex flex-wrap gap-1.5">
                      {stats.mastery.needs_practice.length ? stats.mastery.needs_practice.map((l) => (
                        <span key={l} className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 font-black flex items-center justify-center">{l}</span>
                      )) : <span className="text-slate-400 text-sm font-semibold">All good! 🎉</span>}
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                    <h2 className="font-bold text-indigo-900 mb-3 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-500" /> Teacher Tips</h2>
                    <ul className="space-y-2.5">
                      {tips.map((t, i) => (
                        <li key={i} className="flex gap-2 text-sm font-semibold text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
