import { useState, useRef, useGrokTheme } from "../grok";
import { WbTeacherPanel } from "./PypWorkbookView";
import type { ChangeEvent } from "../grok";
import {
  LETTERS,
  VOCABULARY,
  PYP_THEMES,
  AVATARS,
  YEAR_LEVELS,
  type YearLevel,
} from "../data/pypData";
import {
  sfx,
  speak,
  loadCustomClips,
  saveCustomClip,
  deleteCustomClip,
  type ChildProfile,
} from "../lib/soundAndStorage";
import { usePalette, useBtn, shuffle } from "./uiHelpers";

export function ArcadeView({
  child,
  onSpendCoins,
  onAward,
}: {
  child: ChildProfile;
  onSpendCoins: (cost: number) => boolean;
  onAward: (points: number, stars: number) => void;
}) {
  const t = useGrokTheme();
  const pal = usePalette();
  const btn = useBtn();

  const [game, setGame] = useState<"menu" | "bridge" | "keys">("menu");
  const [msg, setMsg] = useState<string>("");
  const [bridgeStep, setBridgeStep] = useState<number>(0);
  const [bridgeWordIdx, setBridgeWordIdx] = useState<number>(0);
  const [doors, setDoors] = useState<{ i: number; hasKey: boolean; open: boolean }[]>([]);
  const [triesLeft, setTriesLeft] = useState<number>(3);
  const [keysFound, setKeysFound] = useState<number>(0);

  const initDoors = () => {
    const winner = Math.floor(Math.random() * 6);
    setDoors(Array.from({ length: 6 }, (_, i) => ({ i, hasKey: i === winner, open: false })));
    setTriesLeft(3);
  };

  const launchGame = (target: "bridge" | "keys", cost: number) => {
    if (!onSpendCoins(cost)) {
      sfx.wrong();
      setMsg(`You need ${cost} 🪙 coins to play! Complete learning activities to earn more coins.`);
      return;
    }
    sfx.coin();
    setMsg("");
    if (target === "bridge") {
      setBridgeStep(0);
      setBridgeWordIdx(Math.floor(Math.random() * VOCABULARY.length));
    } else {
      initDoors();
    }
    setGame(target);
  };

  const targetVocab = VOCABULARY[bridgeWordIdx % VOCABULARY.length];
  const bridgeOptions = shuffle([
    targetVocab,
    VOCABULARY[(bridgeWordIdx + 3) % VOCABULARY.length],
    VOCABULARY[(bridgeWordIdx + 7) % VOCABULARY.length],
  ]);

  const answerBridge = (word: string) => {
    speak(word);
    if (word === targetVocab.word) {
      sfx.correct();
      const next = bridgeStep + 1;
      if (next >= 4) {
        sfx.fanfare();
        onAward(10, 2);
        setMsg("🏆 You crossed all 4 bridges and rescued the Royal Oryx! (+2⭐)");
        setGame("menu");
      } else {
        setBridgeStep(next);
        setBridgeWordIdx((i: number) => i + 5);
      }
    } else {
      sfx.wrong();
    }
  };

  const tapDoor = (d: { i: number; hasKey: boolean; open: boolean }) => {
    if (d.open || triesLeft <= 0) return;
    const nextDoors = doors.map((x) => (x.i === d.i ? { ...x, open: true } : x));
    setDoors(nextDoors);
    if (d.hasKey) {
      sfx.fanfare();
      setKeysFound((k: number) => k + 1);
      onAward(10, 1);
      window.setTimeout(initDoors, 900);
    } else {
      sfx.wrong();
      setTriesLeft((tr: number) => tr - 1);
    }
  };

  return (
    <div data-testid="arcade-view" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        style={{
          border: `3px solid ${pal[1]}`,
          borderRadius: 24,
          padding: 20,
          background: t.bg.elevated,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>🕹️ Rewards Arcade</div>
          <div style={{ fontSize: 18, color: t.text.secondary }}>
            Spend the coins you earn from PYP themes, reading, math, and science!
          </div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: t.text.warning }}>
          🪙 {child.points} Coins Available
        </div>
      </div>

      {msg && (
        <div data-testid="arcade-message" style={{ padding: 16, borderRadius: 18, border: `2px solid ${t.border.default}`, background: t.bg.subtle, fontSize: 20, fontWeight: 700 }}>
          {msg}
        </div>
      )}

      {game === "menu" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <div style={{ border: `3px solid ${pal[0]}`, borderRadius: 24, padding: 20, background: t.bg.elevated, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 54 }}>🦌🌉</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>Rescue the Royal Oryx</div>
            <div style={{ fontSize: 18, color: t.text.secondary }}>Match 4 PYP picture words to cross the desert bridge!</div>
            <button data-testid="arcade-game-0" onClick={() => launchGame("bridge", 30)} style={btn(pal[0], t.text.onColor)}>
              Play Bridge Rescue (30 🪙)
            </button>
          </div>

          <div style={{ border: `3px solid ${pal[1]}`, borderRadius: 24, padding: 20, background: t.bg.elevated, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 54 }}>🗝️🚪</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>Find the Golden Key</div>
            <div style={{ fontSize: 18, color: t.text.secondary }}>Open mystery doors to discover the hidden golden key!</div>
            <button data-testid="arcade-game-1" onClick={() => launchGame("keys", 20)} style={btn(pal[1], t.text.onColor)}>
              Play Golden Key (20 🪙)
            </button>
          </div>
        </div>
      )}

      {game === "bridge" && (
        <div style={{ border: `3px solid ${pal[0]}`, borderRadius: 24, padding: 24, background: t.bg.elevated, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            🌉 Bridge Step {bridgeStep + 1} of 4 • Pick the matching word!
          </div>
          <div style={{ fontSize: 80 }}>{targetVocab.emoji}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            {bridgeOptions.map((o) => (
              <button key={o.word} onClick={() => answerBridge(o.word)} style={btn(pal[0], t.text.onColor, { minWidth: 150, fontSize: 24 })}>
                {o.word}
              </button>
            ))}
          </div>
          <button onClick={() => setGame("menu")} style={btn(t.fill.secondary, t.text.primary)}>
            ← Back to Arcade
          </button>
        </div>
      )}

      {game === "keys" && (
        <div style={{ border: `3px solid ${pal[1]}`, borderRadius: 24, padding: 24, background: t.bg.elevated, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            🗝️ Keys Found: {keysFound} • ❤️ Tries Left: {triesLeft}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(90px, 130px))", gap: 14, justifyContent: "center" }}>
            {doors.map((d) => (
              <button
                key={d.i}
                data-testid={`door-${d.i}`}
                onClick={() => tapDoor(d)}
                style={btn(d.open ? t.bg.subtle : pal[1], d.open ? t.text.primary : t.text.onColor, { minHeight: 110, fontSize: 44 })}
              >
                {d.open ? (d.hasKey ? "🗝️" : "🕳️") : "🚪"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={initDoors} style={btn(t.fill.accent, t.text.onColor)}>
              🔄 New Doors
            </button>
            <button onClick={() => setGame("menu")} style={btn(t.fill.secondary, t.text.primary)}>
              ← Back to Arcade
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TeacherAndProfilesView({
  profiles,
  activeChild,
  onSelectChild,
  onAddChild,
}: {
  profiles: ChildProfile[];
  activeChild: ChildProfile;
  onSelectChild: (id: string) => void;
  onAddChild: (name: string, avatar: string, year: YearLevel) => void;
}) {
  const t = useGrokTheme();
  const pal = usePalette();
  const btn = useBtn();

  const [newName, setNewName] = useState<string>("");
  const [newAvatar, setNewAvatar] = useState<string>("oryx");
  const [newYear, setNewYear] = useState<YearLevel>("y1");

  // Grown-up multiplication check (replaces insecure default 1234 login)
  const [teacherUnlocked, setTeacherUnlocked] = useState<boolean>(false);
  const [gateChoice, setGateChoice] = useState<number | null>(null);
  const [clips, setClips] = useState<Record<string, string>>(() => loadCustomClips());
  const [recordingKey, setRecordingKey] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const handleCreateProfile = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    sfx.correct();
    onAddChild(trimmed, newAvatar, newYear);
    setNewName("");
  };

  const startRec = async (clipKey: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      mr.ondataavailable = (ev) => chunks.push(ev.data);
      mr.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setClips(saveCustomClip(clipKey, reader.result));
          }
        };
        reader.readAsDataURL(blob);
      };
      mr.start();
      recorderRef.current = mr;
      setRecordingKey(clipKey);
    } catch {
      // microphone unavailable in headless or restricted context
    }
  };

  const stopRec = () => {
    recorderRef.current?.stop();
    setRecordingKey(null);
  };

  return (
    <div data-testid="teacher-profiles-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Student Profile Switcher */}
      <div style={{ border: `2px solid ${t.border.default}`, borderRadius: 24, padding: 20, background: t.bg.elevated, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontSize: 24, fontWeight: 800 }}>👧🧒 Student Profiles (Years 1–4)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {profiles.map((p, i) => {
            const av = AVATARS.find((a) => a.id === p.avatar)?.emoji || "🦊";
            const isSel = p.id === activeChild.id;
            return (
              <button
                key={p.id}
                data-testid={`profile-card-${p.id}`}
                onClick={() => { sfx.tap(); onSelectChild(p.id); }}
                style={btn(isSel ? pal[i % pal.length] : t.bg.subtle, isSel ? t.text.onColor : t.text.primary, {
                  flexDirection: "column",
                  padding: 16,
                  minHeight: 110,
                })}
              >
                <span style={{ fontSize: 40 }}>{av}</span>
                <span style={{ fontSize: 22 }}>{p.name} ({p.year.toUpperCase()})</span>
                <span style={{ fontSize: 16 }}>⭐ {p.stars} • 🪙 {p.points}</span>
              </button>
            );
          })}
        </div>

        {/* Add Student Row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", paddingTop: 8 }}>
          <input
            data-testid="new-student-name-input"
            type="text"
            placeholder="New student name…"
            value={newName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
            style={{
              fontSize: 18,
              padding: "10px 14px",
              borderRadius: 14,
              border: `1px solid ${t.border.default}`,
              background: t.bg.base,
              color: t.text.primary,
              minHeight: 48,
            }}
          />
          <select
            value={newAvatar}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewAvatar(e.target.value)}
            style={{ fontSize: 18, padding: "10px 12px", borderRadius: 14, border: `1px solid ${t.border.default}`, background: t.bg.base, color: t.text.primary, minHeight: 48 }}
          >
            {AVATARS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.emoji} {a.label}
              </option>
            ))}
          </select>
          <select
            value={newYear}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewYear(e.target.value as YearLevel)}
            style={{ fontSize: 18, padding: "10px 12px", borderRadius: 14, border: `1px solid ${t.border.default}`, background: t.bg.base, color: t.text.primary, minHeight: 48 }}
          >
            {YEAR_LEVELS.filter((y) => y.id !== "all").map((y) => (
              <option key={y.id} value={y.id}>
                {y.label} ({y.ages})
              </option>
            ))}
          </select>
          <button data-testid="add-student-button" onClick={handleCreateProfile} style={btn(t.fill.accent, t.text.onColor)}>
            ➕ Add Student
          </button>
        </div>
      </div>

      {/* Teacher & Parent Studio Gate */}
      <div style={{ border: `2px solid ${t.border.default}`, borderRadius: 24, padding: 20, background: t.bg.elevated, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 24, fontWeight: 800 }}>👩‍🏫 Teacher & Parent Dashboard + Voice Studio</div>
        {!teacherUnlocked ? (
          <div data-testid="teacher-gate" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 19, color: t.text.secondary }}>
              Grown-Up Check: Tap the answer to <b>6 × 7</b> to open the Teacher Progress & Voice Recording Studio:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[36, 42, 48, 54].map((ans) => (
                <button
                  key={ans}
                  data-testid={`teacher-gate-${ans}`}
                  onClick={() => {
                    setGateChoice(ans);
                    if (ans === 42) {
                      sfx.correct();
                      setTeacherUnlocked(true);
                    } else {
                      sfx.wrong();
                    }
                  }}
                  style={btn(t.fill.secondary, t.text.primary, { minWidth: 80 })}
                >
                  {ans}
                </button>
              ))}
            </div>
            {gateChoice !== null && gateChoice !== 42 && (
              <div style={{ fontSize: 18, color: t.text.danger }}>Try again: 6 × 7 = 42</div>
            )}
          </div>
        ) : (
          <div data-testid="teacher-dashboard-content" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <div style={{ padding: 14, borderRadius: 16, background: t.bg.subtle }}>
                <div style={{ fontSize: 16, color: t.text.secondary }}>Active Student</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{activeChild.name} ({activeChild.year.toUpperCase()})</div>
              </div>
              <div style={{ padding: 14, borderRadius: 16, background: t.bg.subtle }}>
                <div style={{ fontSize: 16, color: t.text.secondary }}>Mastered Letters</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{activeChild.masteredLetters.join(", ") || "None yet"}</div>
              </div>
              <div style={{ padding: 14, borderRadius: 16, background: t.bg.subtle }}>
                <div style={{ fontSize: 16, color: t.text.secondary }}>Total Stars & Coins</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>⭐ {activeChild.stars} • 🪙 {activeChild.points}</div>
              </div>
            </div>

            <div style={{ fontSize: 20, fontWeight: 700 }}>📊 IB PYP Transdisciplinary Theme Stars for {activeChild.name}:</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
              {PYP_THEMES.map((th) => (
                <div key={th.id} style={{ padding: 12, borderRadius: 14, border: `1px solid ${t.border.default}`, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 18, fontWeight: 600 }}>
                  <span>{th.emoji} {th.title}</span>
                  <span>⭐ {activeChild.pypStars?.[th.id] || 0}</span>
                </div>
              ))}
            </div>

            <WbTeacherPanel students={profiles} initialYear={activeChild.year === "all" ? "y1" : activeChild.year} />

            <div style={{ fontSize: 20, fontWeight: 700 }}>🎤 Teacher Voice Recording Studio ({Object.keys(clips).length} saved clips):</div>
            <div style={{ fontSize: 17, color: t.text.secondary }}>
              Record your own voice for any letter below. When saved, the app plays your voice instead of the device synthesizer!
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {LETTERS.slice(0, 12).map((L) => {
                const key = `letter:${L.l}`;
                const saved = !!clips[key];
                const isRec = recordingKey === key;
                return (
                  <div key={key} style={{ padding: 10, borderRadius: 14, border: `1px solid ${t.border.default}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{L.l} ({L.word})</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {saved && (
                        <button onClick={() => speak(L.word, key)} style={btn(t.fill.secondary, t.text.primary, { padding: "6px 10px", fontSize: 16 })}>
                          ▶️
                        </button>
                      )}
                      {saved && (
                        <button onClick={() => setClips(deleteCustomClip(key))} style={btn(t.fill.secondary, t.text.danger, { padding: "6px 10px", fontSize: 16 })}>
                          🗑️
                        </button>
                      )}
                      {!isRec ? (
                        <button onClick={() => startRec(key)} style={btn(t.fill.accent, t.text.onColor, { padding: "6px 12px", fontSize: 16 })}>
                          🎤 {saved ? "Redo" : "Rec"}
                        </button>
                      ) : (
                        <button onClick={stopRec} style={btn(t.text.danger, t.text.onColor, { padding: "6px 12px", fontSize: 16 })}>
                          ⏹️ Stop
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
