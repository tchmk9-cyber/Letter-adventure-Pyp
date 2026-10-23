import { useState, useMemo, useGrokTheme } from "../grok";
import {
  PYP_THEMES,
  VOCABULARY,
  SCIENCE_QUESTIONS,
  type PypThemeId,
  type YearLevel,
} from "../data/pypData";
import { sfx, speak, type ChildProfile } from "../lib/soundAndStorage";
import { usePalette, useBtn, filterByYear, RewardBanner } from "./uiHelpers";

export function PypThemesView({
  year,
  child,
  onAward,
}: {
  year: YearLevel;
  child: ChildProfile;
  onAward: (points: number, stars: number, themeId?: PypThemeId, letter?: string) => void;
}) {
  const t = useGrokTheme();
  const pal = usePalette();
  const btn = useBtn();

  const [activeThemeId, setActiveThemeId] = useState<PypThemeId>("who-we-are");
  const [subTab, setSubTab] = useState<"vocab" | "sort" | "quiz">("vocab");
  const [vocabIdx, setVocabIdx] = useState<number>(0);
  const [sortIdx, setSortIdx] = useState<number>(0);
  const [sortedCount, setSortedCount] = useState<number>(0);
  const [sortFeedback, setSortFeedback] = useState<string>("");
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [quizFeedback, setQuizFeedback] = useState<string>("");
  const [rewardMsg, setRewardMsg] = useState<{ msg: string; pts: number; stars: number }>({ msg: "", pts: 0, stars: 0 });

  const themeIdx = PYP_THEMES.findIndex((th) => th.id === activeThemeId);
  const theme = PYP_THEMES[themeIdx >= 0 ? themeIdx : 0];
  const accent = pal[(themeIdx >= 0 ? themeIdx : 0) % pal.length];

  const themeVocab = useMemo(() => {
    const byTheme = VOCABULARY.filter((v) => v.theme === theme.id);
    return filterByYear(byTheme, year);
  }, [theme.id, year]);

  const themeQuestions = useMemo(() => {
    const byTheme = SCIENCE_QUESTIONS.filter((q) => q.theme === theme.id);
    return filterByYear(byTheme, year);
  }, [theme.id, year]);

  const selectTheme = (id: PypThemeId) => {
    sfx.tap();
    setActiveThemeId(id);
    setVocabIdx(0);
    setSortIdx(0);
    setSortedCount(0);
    setSortFeedback("");
    setQuizIdx(0);
    setQuizFeedback("");
  };

  const curVocab = themeVocab[vocabIdx % Math.max(1, themeVocab.length)];
  const curSort = theme.sortItems[sortIdx % theme.sortItems.length];
  const curQuiz = themeQuestions[quizIdx % Math.max(1, themeQuestions.length)];

  const handleSortPick = (bucket: string) => {
    if (!curSort) return;
    if (bucket === curSort.bucket) {
      sfx.correct();
      const nextCount = sortedCount + 1;
      setSortedCount(nextCount);
      setSortFeedback(`✅ Correct! "${curSort.label}" belongs in ${bucket}.`);
      speak([curSort.label, "Correct!"]);
      if (nextCount >= theme.sortItems.length) {
        sfx.fanfare();
        onAward(20, 1, theme.id);
        setRewardMsg({ msg: `Completed ${theme.title} Sorting Lab!`, pts: 20, stars: 1 });
        setSortedCount(0);
        setSortIdx(0);
      } else {
        setSortIdx((i: number) => (i + 1) % theme.sortItems.length);
      }
    } else {
      sfx.wrong();
      setSortFeedback(`💪 Try the other bucket for "${curSort.label}"!`);
    }
  };

  const handleQuizPick = (opt: string) => {
    if (!curQuiz) return;
    if (opt === curQuiz.answer) {
      sfx.correct();
      setQuizFeedback(`🌟 Correct! ${curQuiz.answer}`);
      speak(["Correct!", curQuiz.answer]);
      onAward(15, 1, theme.id);
      setRewardMsg({ msg: `Great inquiry answer in ${theme.title}!`, pts: 15, stars: 1 });
      setQuizIdx((i: number) => (i + 1) % themeQuestions.length);
    } else {
      sfx.wrong();
      setQuizFeedback(`Not quite — listen to the question and try again!`);
    }
  };

  return (
    <div data-testid="pyp-themes-view" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <RewardBanner
        message={rewardMsg.msg}
        points={rewardMsg.pts}
        stars={rewardMsg.stars}
        onClose={() => setRewardMsg({ msg: "", pts: 0, stars: 0 })}
      />

      {/* 6 PYP Transdisciplinary Theme Selector Grid */}
      <div
        data-testid="pyp-theme-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {PYP_THEMES.map((th, idx) => {
          const isSel = th.id === theme.id;
          const col = pal[idx % pal.length];
          const starsEarned = child.pypStars?.[th.id] || 0;
          return (
            <button
              key={th.id}
              data-testid={`pyp-theme-card-${th.id}`}
              onClick={() => selectTheme(th.id)}
              style={{
                border: isSel ? `4px solid ${col}` : `2px solid ${t.border.default}`,
                borderRadius: 20,
                padding: "14px 16px",
                background: isSel ? col : t.bg.elevated,
                color: isSel ? t.text.onColor : t.text.primary,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: t.font.family,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                minHeight: 110,
                touchAction: "manipulation",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 34 }}>{th.emoji}</span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>⭐ {starsEarned}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.25 }}>
                {th.number}. {th.title}
              </div>
              <div style={{ fontSize: 15, opacity: 0.9 }}>{th.keyConcepts.join(" · ")}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Theme Banner: Central Idea & Lines of Inquiry */}
      <div
        style={{
          border: `3px solid ${accent}`,
          borderRadius: 24,
          padding: 20,
          background: t.bg.elevated,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 44 }}>{theme.emoji}</span>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700 }}>{theme.title}</div>
              <div style={{ fontSize: 18, color: t.text.secondary }}>
                Key Concepts: {theme.keyConcepts.join(" • ")}
              </div>
            </div>
          </div>
          <button
            data-testid="hear-central-idea-btn"
            onClick={() => {
              sfx.tap();
              speak([theme.title, "Central Idea.", theme.centralIdea]);
            }}
            style={btn(accent, t.text.onColor)}
          >
            🔊 Hear Central Idea
          </button>
        </div>

        <div style={{ fontSize: 20, fontWeight: 600, padding: "12px 16px", borderRadius: 16, background: t.bg.subtle }}>
          💡 Central Idea: {theme.centralIdea}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {theme.linesOfInquiry.map((line, i) => {
            const lineYear = `y${i + 1}`;
            const activeLine = year === "all" || year === lineYear;
            return (
              <div
                key={i}
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  border: activeLine ? `2px solid ${accent}` : `1px solid ${t.border.subtle}`,
                  background: activeLine ? t.bg.base : t.bg.subtle,
                  opacity: activeLine ? 1 : 0.6,
                  fontSize: 17,
                  fontWeight: activeLine ? 700 : 500,
                }}
              >
                {line}
              </div>
            );
          })}
        </div>

        {/* Sub-Activity Tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 4 }}>
          <button
            data-testid="pyp-subtab-vocab"
            onClick={() => { sfx.tap(); setSubTab("vocab"); }}
            style={btn(subTab === "vocab" ? t.fill.primary : t.fill.secondary, subTab === "vocab" ? t.text.onPrimary : t.text.primary, { flex: "1 1 180px" })}
          >
            🃏 Theme Vocabulary ({themeVocab.length})
          </button>
          <button
            data-testid="pyp-subtab-sort"
            onClick={() => { sfx.tap(); setSubTab("sort"); }}
            style={btn(subTab === "sort" ? t.fill.primary : t.fill.secondary, subTab === "sort" ? t.text.onPrimary : t.text.primary, { flex: "1 1 180px" })}
          >
            🧩 Sorting Lab ({theme.sortItems.length})
          </button>
          <button
            data-testid="pyp-subtab-quiz"
            onClick={() => { sfx.tap(); setSubTab("quiz"); }}
            style={btn(subTab === "quiz" ? t.fill.primary : t.fill.secondary, subTab === "quiz" ? t.text.onPrimary : t.text.primary, { flex: "1 1 180px" })}
          >
            ❓ Inquiry Quiz ({themeQuestions.length})
          </button>
        </div>

        {/* Sub-Tab 1: Theme Vocabulary Flashcards */}
        {subTab === "vocab" && curVocab && (
          <div data-testid="pyp-vocab-panel" style={{ textAlign: "center", padding: "16px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 18, color: t.text.secondary, fontWeight: 600 }}>
              Word {(vocabIdx % themeVocab.length) + 1} of {themeVocab.length} • {curVocab.year.toUpperCase()}
            </div>
            <div style={{ fontSize: 88, lineHeight: 1.1 }}>{curVocab.emoji}</div>
            <div style={{ fontSize: 44, fontWeight: 700, textTransform: "capitalize" }}>{curVocab.word}</div>
            <div style={{ fontSize: 22, color: t.text.secondary, maxWidth: 560 }}>{curVocab.hint}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 6 }}>
              <button
                data-testid="pyp-vocab-hear-btn"
                onClick={() => {
                  sfx.tap();
                  speak([curVocab.word, curVocab.hint], `word:${curVocab.word}`);
                }}
                style={btn(accent, t.text.onColor)}
              >
                🔊 Hear Word & Meaning
              </button>
              <button
                data-testid="pyp-vocab-know-btn"
                onClick={() => {
                  sfx.correct();
                  onAward(10, 1, theme.id);
                  setRewardMsg({ msg: `Learned "${curVocab.word}"!`, pts: 10, stars: 1 });
                  setVocabIdx((i: number) => (i + 1) % themeVocab.length);
                }}
                style={btn(t.text.success, t.text.onColor)}
              >
                ✅ I Know It! (+10🪙)
              </button>
              <button
                data-testid="pyp-vocab-next-btn"
                onClick={() => {
                  sfx.tap();
                  setVocabIdx((i: number) => (i + 1) % themeVocab.length);
                }}
                style={btn(t.fill.secondary, t.text.primary)}
              >
                Next Word ▶
              </button>
            </div>
          </div>
        )}

        {/* Sub-Tab 2: Interactive Sorting Lab */}
        {subTab === "sort" && curSort && (
          <div data-testid="pyp-sort-panel" style={{ textAlign: "center", padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{theme.interactiveTitle}</div>
            <div style={{ fontSize: 19, color: t.text.secondary }}>
              {theme.interactivePrompt} ({sortedCount}/{theme.sortItems.length} sorted)
            </div>
            <div
              style={{
                border: `3px dashed ${accent}`,
                borderRadius: 22,
                padding: "18px 28px",
                background: t.bg.base,
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 68 }}>{curSort.emoji}</span>
              <span style={{ fontSize: 28, fontWeight: 700 }}>{curSort.label}</span>
              <button
                onClick={() => speak(curSort.label)}
                style={btn(t.fill.secondary, t.text.primary, { padding: "6px 14px", fontSize: 18 })}
              >
                🔊 Listen
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, width: "100%", maxWidth: 640 }}>
              {theme.buckets.map((b, bi) => (
                <button
                  key={b}
                  data-testid={`pyp-bucket-${bi}`}
                  onClick={() => handleSortPick(b)}
                  style={btn(pal[(themeIdx + bi + 1) % pal.length], t.text.onColor, { minHeight: 68, fontSize: 22 })}
                >
                  {b}
                </button>
              ))}
            </div>
            {sortFeedback && <div style={{ fontSize: 20, fontWeight: 700 }}>{sortFeedback}</div>}
          </div>
        )}

        {/* Sub-Tab 3: Theme Inquiry Quiz */}
        {subTab === "quiz" && curQuiz && (
          <div data-testid="pyp-quiz-panel" style={{ textAlign: "center", padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 64 }}>{curQuiz.emoji}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontSize: 24, fontWeight: 700, maxWidth: 620 }}>{curQuiz.q}</div>
              <button
                data-testid="pyp-quiz-speaker-btn"
                aria-label="Hear inquiry question"
                onClick={() => { sfx.tap(); speak(curQuiz.q); }}
                style={btn(accent, t.text.onColor, { minWidth: 52, minHeight: 52, padding: "10px 14px" })}
              >
                🔊
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, width: "100%", maxWidth: 720 }}>
              {curQuiz.options.map((opt, oi) => (
                <button
                  key={opt}
                  data-testid={`pyp-quiz-opt-${oi}`}
                  onClick={() => handleQuizPick(opt)}
                  style={btn(t.bg.base, t.text.primary, { minHeight: 60, fontSize: 21 })}
                >
                  {opt}
                </button>
              ))}
            </div>
            {quizFeedback && <div style={{ fontSize: 20, fontWeight: 700 }}>{quizFeedback}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
