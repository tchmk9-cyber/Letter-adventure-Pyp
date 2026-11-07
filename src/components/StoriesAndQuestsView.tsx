import { useState, useMemo, useGrokTheme } from "../grok";
import {
  STORIES,
  MATH_QUESTIONS,
  SCIENCE_QUESTIONS,
  type YearLevel,
  type PypThemeId,
} from "../data/pypData";
import { sfx, speak } from "../lib/soundAndStorage";
import { usePalette, useBtn, filterByYear, RewardBanner } from "./uiHelpers";

export function StoryTimeView({
  year,
  onAward,
}: {
  year: YearLevel;
  onAward: (points: number, stars: number, themeId?: PypThemeId) => void;
}) {
  const t = useGrokTheme();
  const pal = usePalette();
  const btn = useBtn();

  const stories = useMemo(() => filterByYear(STORIES, year), [year]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stage, setStage] = useState<"read" | "quiz">("read");
  const [qIdx, setQIdx] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [reward, setReward] = useState<{ msg: string; pts: number; stars: number }>({ msg: "", pts: 0, stars: 0 });

  const activeStory = stories.find((s) => s.id === selectedId) || null;

  const openStory = (id: string) => {
    sfx.tap();
    setSelectedId(id);
    setStage("read");
    setQIdx(0);
    setFeedback("");
  };

  const handleAnswer = (opt: string) => {
    if (!activeStory) return;
    const drill = activeStory.drills[qIdx];
    if (!drill) return;
    if (opt === drill.answer) {
      sfx.correct();
      speak(["Correct!", opt]);
      if (qIdx + 1 < activeStory.drills.length) {
        setFeedback("✅ Correct! Next question…");
        setQIdx(qIdx + 1);
      } else {
        sfx.fanfare();
        onAward(25, 2, activeStory.theme);
        setReward({ msg: `Completed story "${activeStory.title}"!`, pts: 25, stars: 2 });
        setSelectedId(null);
      }
    } else {
      sfx.wrong();
      setFeedback("💪 Try again! You can re-read the story if you need a hint.");
    }
  };

  return (
    <div data-testid="story-time-view" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <RewardBanner message={reward.msg} points={reward.pts} stars={reward.stars} onClose={() => setReward({ msg: "", pts: 0, stars: 0 })} />

      {!activeStory ? (
        <div
          data-testid="story-list"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 14,
          }}
        >
          {stories.map((st, i) => {
            const col = pal[i % pal.length];
            return (
              <button
                key={st.id}
                data-testid={`story-${st.id}`}
                onClick={() => openStory(st.id)}
                style={{
                  border: `3px solid ${col}`,
                  borderRadius: 22,
                  padding: 20,
                  background: t.bg.elevated,
                  color: t.text.primary,
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: t.font.family,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 48 }}>{st.emoji}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: col }}>{st.year.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{st.title}</div>
                <div style={{ fontSize: 17, color: t.text.secondary }}>{st.lines[0]}</div>
              </button>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            border: `3px solid ${pal[0]}`,
            borderRadius: 24,
            padding: 22,
            background: t.bg.elevated,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <button
              data-testid="back-to-stories-button"
              onClick={() => { sfx.tap(); setSelectedId(null); }}
              style={btn(t.fill.secondary, t.text.primary)}
            >
              ← All Stories
            </button>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              {activeStory.emoji} {activeStory.title} ({activeStory.year.toUpperCase()})
            </div>
            <button
              data-testid="read-all-story-button"
              onClick={() => { sfx.tap(); speak([activeStory.title, ...activeStory.lines]); }}
              style={btn(pal[0], t.text.onColor)}
            >
              🔊 Read Whole Story
            </button>
          </div>

          {stage === "read" ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {activeStory.lines.map((line, i) => (
                  <div
                    key={i}
                    data-testid={`story-line-${i}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 16px",
                      borderRadius: 18,
                      background: t.bg.subtle,
                      border: `1px solid ${t.border.subtle}`,
                    }}
                  >
                    <button
                      data-testid={`story-line-speaker-${i}`}
                      aria-label={`Read sentence ${i + 1}`}
                      onClick={() => { sfx.tap(); speak(line); }}
                      style={btn(pal[i % pal.length], t.text.onColor, { minWidth: 52, minHeight: 52, padding: "10px 14px" })}
                    >
                      🔊
                    </button>
                    <span style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.4 }}>{line}</span>
                  </div>
                ))}
              </div>
              <button
                data-testid="start-drill-button"
                onClick={() => { sfx.tap(); setStage("quiz"); setQIdx(0); setFeedback(""); }}
                style={btn(t.text.success, t.text.onColor, { fontSize: 22 })}
              >
                Answer Story Questions →
              </button>
            </>
          ) : (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "10px 0" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: t.text.secondary }}>
                Question {qIdx + 1} of {activeStory.drills.length}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <div style={{ fontSize: 26, fontWeight: 700 }}>{activeStory.drills[qIdx]?.q}</div>
                <button
                  onClick={() => speak(activeStory.drills[qIdx]?.q || "")}
                  style={btn(pal[0], t.text.onColor, { minWidth: 52, minHeight: 52, padding: "10px 14px" })}
                >
                  🔊
                </button>
              </div>
              <div data-testid="drill-options" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, width: "100%", maxWidth: 680 }}>
                {activeStory.drills[qIdx]?.options.map((opt, oi) => (
                  <button
                    key={opt}
                    data-testid={`drill-option-${oi}`}
                    onClick={() => handleAnswer(opt)}
                    style={btn(t.bg.base, t.text.primary, { minHeight: 60, fontSize: 21 })}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {feedback && <div style={{ fontSize: 20, fontWeight: 700 }}>{feedback}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MathQuestView({
  year,
  onAward,
}: {
  year: YearLevel;
  onAward: (points: number, stars: number) => void;
}) {
  const t = useGrokTheme();
  const pal = usePalette();
  const btn = useBtn();

  const questions = useMemo(() => filterByYear(MATH_QUESTIONS, year), [year]);
  const [idx, setIdx] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [reward, setReward] = useState<{ msg: string; pts: number; stars: number }>({ msg: "", pts: 0, stars: 0 });

  const cur = questions[idx % questions.length] || MATH_QUESTIONS[0];
  const color = pal[idx % pal.length];

  const choose = (opt: number) => {
    if (opt === cur.answer) {
      sfx.correct();
      speak(["Correct!", String(opt)]);
      onAward(15, 1);
      setFeedback(`✅ Correct! ${cur.answer}`);
      setReward({ msg: `Solved ${cur.year.toUpperCase()} Math Challenge!`, pts: 15, stars: 1 });
      setIdx((i: number) => (i + 1) % questions.length);
    } else {
      sfx.wrong();
      setFeedback("💪 Count carefully and try again!");
    }
  };

  return (
    <div data-testid="math-quest-view" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <RewardBanner message={reward.msg} points={reward.pts} stars={reward.stars} onClose={() => setReward({ msg: "", pts: 0, stars: 0 })} />

      <div
        style={{
          border: `3px solid ${color}`,
          borderRadius: 24,
          padding: 24,
          background: t.bg.elevated,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: t.text.secondary }}>
          Number Quest • Question {(idx % questions.length) + 1} of {questions.length} ({cur.year.toUpperCase()})
        </div>

        {cur.kind === "count" && cur.count && (
          <div data-testid="count-items" style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 460 }}>
            {Array.from({ length: cur.count }).map((_, i) => (
              <span key={i} style={{ fontSize: 46 }}>
                {cur.emoji}
              </span>
            ))}
          </div>
        )}

        <div data-testid="math-prompt" style={{ fontSize: cur.kind === "word" ? 26 : 44, fontWeight: 800, maxWidth: 680 }}>
          {cur.prompt}
        </div>

        <button
          data-testid="math-hear-button"
          onClick={() => { sfx.tap(); speak(cur.say); }}
          style={btn(color, t.text.onColor, { minHeight: 52 })}
        >
          🔊 Hear the Question
        </button>

        <div data-testid="math-options" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 14, width: "100%", maxWidth: 640 }}>
          {cur.options.map((opt) => (
            <button
              key={opt}
              data-testid={`math-option-${opt}`}
              onClick={() => choose(opt)}
              style={btn(t.bg.base, t.text.primary, { minHeight: 68, fontSize: 30 })}
            >
              {opt}
            </button>
          ))}
        </div>

        {feedback && <div style={{ fontSize: 20, fontWeight: 700 }}>{feedback}</div>}
      </div>
    </div>
  );
}

export function ScienceQuestView({
  year,
  onAward,
}: {
  year: YearLevel;
  onAward: (points: number, stars: number, themeId?: PypThemeId) => void;
}) {
  const t = useGrokTheme();
  const pal = usePalette();
  const btn = useBtn();

  const questions = useMemo(() => filterByYear(SCIENCE_QUESTIONS, year), [year]);
  const [idx, setIdx] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [reward, setReward] = useState<{ msg: string; pts: number; stars: number }>({ msg: "", pts: 0, stars: 0 });

  const cur = questions[idx % questions.length] || SCIENCE_QUESTIONS[0];
  const color = pal[idx % pal.length];

  const choose = (opt: string) => {
    if (opt === cur.answer) {
      sfx.correct();
      speak(["Correct!", cur.answer]);
      onAward(15, 1, cur.theme);
      setFeedback(`🌟 Correct! ${cur.answer}`);
      setReward({ msg: `Great Science & Social Inquiry!`, pts: 15, stars: 1 });
      setIdx((i: number) => (i + 1) % questions.length);
    } else {
      sfx.wrong();
      setFeedback("💪 Think about our PYP inquiry unit and try again!");
    }
  };

  return (
    <div data-testid="science-quest-view" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <RewardBanner message={reward.msg} points={reward.pts} stars={reward.stars} onClose={() => setReward({ msg: "", pts: 0, stars: 0 })} />

      <div
        style={{
          border: `3px solid ${color}`,
          borderRadius: 24,
          padding: 24,
          background: t.bg.elevated,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: t.text.secondary }}>
          Science & Social Inquiry • Question {(idx % questions.length) + 1} of {questions.length} ({cur.year.toUpperCase()})
        </div>

        <div style={{ fontSize: 76, lineHeight: 1.1 }}>{cur.emoji}</div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <div data-testid="science-question" style={{ fontSize: 26, fontWeight: 700, maxWidth: 640 }}>
            {cur.q}
          </div>
          <button
            data-testid="science-hear-button"
            aria-label="Hear the question"
            onClick={() => { sfx.tap(); speak(cur.q); }}
            style={btn(color, t.text.onColor, { minWidth: 52, minHeight: 52, padding: "10px 14px", fontSize: 22 })}
          >
            🔊
          </button>
        </div>

        <div data-testid="science-options" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, width: "100%", maxWidth: 720 }}>
          {cur.options.map((opt, oi) => (
            <button
              key={opt}
              data-testid={`science-option-${oi}`}
              onClick={() => choose(opt)}
              style={btn(t.bg.base, t.text.primary, { minHeight: 62, fontSize: 21 })}
            >
              {opt}
            </button>
          ))}
        </div>

        {feedback && <div style={{ fontSize: 20, fontWeight: 700 }}>{feedback}</div>}
      </div>
    </div>
  );
}
