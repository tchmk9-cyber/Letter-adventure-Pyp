import { useState, useCallback, useGrokTheme } from "./grok";
import {
  YEAR_LEVELS,
  AVATARS,
  type YearLevel,
  type PypThemeId,
} from "./data/pypData";
import {
  sfx,
  loadProfiles,
  saveProfiles,
  loadActiveProfileId,
  saveActiveProfileId,
  type ChildProfile,
} from "./lib/soundAndStorage";
import { usePalette, useBtn, VoiceSettingsPanel } from "./components/uiHelpers";
import { PypThemesView } from "./components/PypThemesView";
import { LettersDrillView, WordsSpellView } from "./components/LettersAndWordsView";
import { MemoryGameView, ColoringStudioView } from "./components/MemoryAndColoringView";
import { StoryTimeView, MathQuestView, ScienceQuestView } from "./components/StoriesAndQuestsView";
import { ArcadeView, TeacherAndProfilesView } from "./components/ArcadeAndTeacherView";
import { PypWorkbookView } from "./components/PypWorkbookView";

type TabId =
  | "workbook"
  | "pyp"
  | "letters"
  | "words"
  | "memory"
  | "coloring"
  | "stories"
  | "math"
  | "science"
  | "arcade"
  | "teacher";

const NAV_TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "workbook", emoji: "📒", label: "PYP Workbook" },
  { id: "pyp", emoji: "🌍", label: "6 PYP Themes" },
  { id: "letters", emoji: "🔤", label: "Letter Sounds" },
  { id: "words", emoji: "📖", label: "Read Words" },
  { id: "memory", emoji: "🃏", label: "Memory Match" },
  { id: "coloring", emoji: "🎨", label: "Coloring Studio" },
  { id: "stories", emoji: "📚", label: "Story Time" },
  { id: "math", emoji: "🧮", label: "Number Quest" },
  { id: "science", emoji: "🔬", label: "Science & Social" },
  { id: "arcade", emoji: "🕹️", label: "Rewards Arcade" },
  { id: "teacher", emoji: "👩‍🏫", label: "Profiles & Teacher" },
];

export default function App() {
  const t = useGrokTheme();
  const pal = usePalette();
  const btn = useBtn();

  const [profiles, setProfiles] = useState<ChildProfile[]>(() => loadProfiles());
  const [activeId, setActiveId] = useState<string>(() => loadActiveProfileId());
  const [year, setYear] = useState<YearLevel>("all");
  const [tab, setTab] = useState<TabId>("pyp");
  const [showVoice, setShowVoice] = useState<boolean>(false);

  const activeChild = profiles.find((p) => p.id === activeId) || profiles[0];
  const avatarEmoji = AVATARS.find((a) => a.id === activeChild.avatar)?.emoji || "🦊";
  const yearMeta = YEAR_LEVELS.find((y) => y.id === year) || YEAR_LEVELS[0];

  const handleSelectChild = (id: string) => {
    setActiveId(id);
    saveActiveProfileId(id);
    const found = profiles.find((p) => p.id === id);
    if (found) setYear(found.year);
  };

  const handleAddChild = (name: string, avatar: string, childYear: YearLevel) => {
    const newId = `student-${Date.now()}`;
    const created: ChildProfile = {
      id: newId,
      name,
      avatar,
      theme: "king",
      year: childYear,
      stars: 5,
      points: 50,
      masteredLetters: [],
      needsPracticeLetters: [],
      pypStars: {
        "who-we-are": 1,
        "where-we-are": 1,
        "express-ourselves": 1,
        "world-works": 1,
        "organize-ourselves": 1,
        "sharing-planet": 0,
      },
      activitiesCount: 1,
      minutesPracticed: 5,
      lastActive: new Date().toISOString(),
    };
    const next = [...profiles, created];
    setProfiles(next);
    saveProfiles(next);
    setActiveId(newId);
    saveActiveProfileId(newId);
    setYear(childYear);
  };

  const handleAward = useCallback(
    (points: number, stars: number, themeId?: PypThemeId, letter?: string) => {
      setProfiles((prev: ChildProfile[]) => {
        const next = prev.map((p) => {
          if (p.id !== activeChild.id) return p;
          const nextMastered =
            letter && p.masteredLetters.indexOf(letter) < 0
              ? [...p.masteredLetters, letter]
              : p.masteredLetters;
          const nextPyp = { ...p.pypStars };
          if (themeId) {
            nextPyp[themeId] = (nextPyp[themeId] || 0) + stars;
          }
          return {
            ...p,
            points: p.points + points,
            stars: p.stars + stars,
            masteredLetters: nextMastered,
            pypStars: nextPyp,
            activitiesCount: p.activitiesCount + 1,
            minutesPracticed: p.minutesPracticed + 2,
            lastActive: new Date().toISOString(),
          };
        });
        saveProfiles(next);
        return next;
      });
    },
    [activeChild.id]
  );

  const handleSpendCoins = useCallback(
    (cost: number): boolean => {
      if (activeChild.points < cost) return false;
      setProfiles((prev: ChildProfile[]) => {
        const next = prev.map((p) => (p.id === activeChild.id ? { ...p, points: p.points - cost } : p));
        saveProfiles(next);
        return next;
      });
      return true;
    },
    [activeChild.id, activeChild.points]
  );

  return (
    <div
      style={{
        background: t.bg.base,
        color: t.text.primary,
        fontFamily: t.font.family,
        minHeight: "100vh",
        padding: "18px 16px 48px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            padding: "14px 18px",
            borderRadius: 24,
            background: t.bg.elevated,
            border: `2px solid ${t.border.default}`,
          }}
        >
          <div>
            <div style={{ fontSize: "clamp(24px, 3.6vw, 36px)", fontWeight: 800 }}>
              🌍 Letter Adventure — IB PYP Edition
            </div>
            <div style={{ fontSize: 18, color: t.text.secondary }}>
              Primary Years Programme (Year 1 to Year 4) • Phonics, Vocabulary, Stories, Math & Inquiry
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <button
              data-testid="active-profile-btn"
              onClick={() => { sfx.tap(); setTab("teacher"); }}
              style={btn(t.bg.subtle, t.text.primary, { padding: "8px 16px" })}
            >
              <span style={{ fontSize: 26 }}>{avatarEmoji}</span>
              <span>{activeChild.name}</span>
              <span data-testid="header-stars" style={{ color: t.text.success }}>⭐ {activeChild.stars}</span>
              <span data-testid="header-coins" style={{ color: t.text.warning }}>🪙 {activeChild.points}</span>
            </button>
            <button
              id="voice-btn"
              data-testid="voice-settings-btn"
              onClick={() => { sfx.tap(); setShowVoice((v: boolean) => !v); }}
              style={btn(showVoice ? t.fill.primary : t.fill.secondary, showVoice ? t.text.onPrimary : t.text.primary)}
            >
              ⚙️ Voice
            </button>
          </div>
        </div>

        {showVoice && (
          <VoiceSettingsPanel
            onClose={() => setShowVoice(false)}
            onOpenStudio={() => {
              setShowVoice(false);
              setTab("teacher");
            }}
          />
        )}

        {/* Year 1 to Year 4 Level Bar */}
        <div
          data-testid="year-selector-bar"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "12px 16px",
            borderRadius: 20,
            background: t.bg.subtle,
            border: `1px solid ${t.border.subtle}`,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 19, fontWeight: 800, marginRight: 4 }}>🎓 PYP Grade Level:</span>
            {YEAR_LEVELS.map((yl, idx) => (
              <button
                key={yl.id}
                data-testid={`year-btn-${yl.id}`}
                onClick={() => { sfx.tap(); setYear(yl.id); }}
                style={btn(
                  year === yl.id ? pal[idx % pal.length] : t.bg.elevated,
                  year === yl.id ? t.text.onColor : t.text.primary,
                  { padding: "8px 16px", fontSize: 19 }
                )}
              >
                {yl.label}
              </button>
            ))}
          </div>
          <div data-testid="year-desc" style={{ fontSize: 16, fontWeight: 600, color: t.text.secondary }}>
            {yearMeta.ages}: {yearMeta.desc}
          </div>
        </div>

        {/* Activity Navigation Tabs */}
        <div data-testid="main-nav-tabs" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {NAV_TABS.map((nt, idx) => {
            const active = tab === nt.id;
            return (
              <button
                key={nt.id}
                data-testid={`nav-tab-${nt.id}`}
                onClick={() => { sfx.tap(); setTab(nt.id); }}
                style={btn(
                  active ? pal[idx % pal.length] : t.bg.elevated,
                  active ? t.text.onColor : t.text.primary,
                  { flex: "1 1 165px", fontSize: 20, padding: "12px 14px" }
                )}
              >
                <span>{nt.emoji}</span>
                <span>{nt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active View Content */}
        <div style={{ paddingTop: 4 }}>
          {tab === "workbook" && (
            <PypWorkbookView students={profiles} activeId={activeChild.id} onAward={(pts: number, st: number) => handleAward(pts, st)} />
          )}
          {tab === "pyp" && <PypThemesView year={year} child={activeChild} onAward={handleAward} />}
          {tab === "letters" && <LettersDrillView mastered={activeChild.masteredLetters} onAward={handleAward} />}
          {tab === "words" && <WordsSpellView year={year} onAward={handleAward} />}
          {tab === "memory" && <MemoryGameView year={year} onAward={handleAward} />}
          {tab === "coloring" && <ColoringStudioView onAward={handleAward} />}
          {tab === "stories" && <StoryTimeView year={year} onAward={handleAward} />}
          {tab === "math" && <MathQuestView year={year} onAward={handleAward} />}
          {tab === "science" && <ScienceQuestView year={year} onAward={handleAward} />}
          {tab === "arcade" && <ArcadeView child={activeChild} onSpendCoins={handleSpendCoins} onAward={handleAward} />}
          {tab === "teacher" && (
            <TeacherAndProfilesView
              profiles={profiles}
              activeChild={activeChild}
              onSelectChild={handleSelectChild}
              onAddChild={handleAddChild}
            />
          )}
        </div>

        <div style={{ fontSize: 15, color: t.text.tertiary, textAlign: "center", paddingTop: 12 }}>
          Letter Adventure — IB PYP Edition (Year 1 to Year 4). Works 100% offline in any browser on desktop, smartboard, tablet, or phone.
        </div>
      </div>
    </div>
  );
}
