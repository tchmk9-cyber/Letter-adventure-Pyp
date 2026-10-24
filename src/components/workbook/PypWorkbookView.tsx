/* 📒 PYP Workbook (Year 1 to Year 4) — year picker, theme picker, unit overview and the six inquiry stages. */
import { useState, useEffect } from "../../grok";
import { WB_STAGES, WB_DISCLAIMER, WB_YEARS, wbYear } from "../../data/pypWorkbooks";
import type { WbUnit, WbThemeId, WbYear, WbYearId } from "../../data/pypWorkbooks";
import { wbSpeak, wbSfx, useWbTheme } from "./wbEnv";
import { useWbBtn, useWbCard, useWbPal, wbGetRecord, wbSaveRecord } from "./wbCore";
import type { WbThemeRecord, WbExitResult } from "./wbCore";
import { WbOverview, WbTuningIn } from "./WbStagesIntro";
import { WbFindingOut, WbSortingOut, WbAction } from "./WbStagesMiddle";
import { WbReflection, WbExitCard } from "./WbStagesEnd";
import { WbTeacherPanel } from "./WbTeacherPanel";
import { WbSpeak } from "./WbParts";

const WB_PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  .wb-print-area, .wb-print-area * { visibility: visible !important; }
  .wb-print-area { position: absolute; left: 0; top: 0; width: 100%; }
  .wb-noprint { display: none !important; }
  .wb-print-area input { border: 2px solid currentColor !important; }
}`;

export type WbStudent = { id: string; name: string; year?: string };

function toYearId(y: string | undefined): WbYearId {
  return y === "y2" || y === "y3" || y === "y4" ? y : "y1";
}

export function PypWorkbookView({
  students,
  activeId,
  onAward,
}: {
  students: WbStudent[];
  activeId: string;
  onAward?: (points: number, stars: number) => void;
}) {
  const t = useWbTheme();
  const btn = useWbBtn();
  const card = useWbCard();
  const pal = useWbPal();
  const activeStudent = students.find((s: WbStudent) => s.id === activeId);
  const [yearId, setYearId] = useState<WbYearId>(() => toYearId(activeStudent ? activeStudent.year : undefined));
  const [themeId, setThemeId] = useState<WbThemeId | null>(null);
  const [stage, setStage] = useState<number>(0);
  const [seed, setSeed] = useState<number>(() => 1 + Math.floor(Math.random() * 100000));
  const [rec, setRec] = useState<WbThemeRecord>({ responses: {}, exits: [] });
  const [showTeacher, setShowTeacher] = useState<boolean>(false);
  const year: WbYear = wbYear(yearId);
  const unit: WbUnit | undefined = year.units.find((u: WbUnit) => u.id === themeId);
  const student = activeStudent || students[0];
  const recKey = (id: string): string => `${yearId}:${id}`;

  useEffect(() => {
    setYearId(toYearId(activeStudent ? activeStudent.year : undefined));
    setThemeId(null);
  }, [activeId]);

  useEffect(() => {
    if (themeId) setRec(wbGetRecord(activeId, recKey(themeId)));
  }, [activeId, themeId, yearId]);

  const setResp = (key: string, value: string) => {
    if (!themeId) return;
    setRec((prev: WbThemeRecord) => {
      const next = { ...prev, responses: { ...prev.responses, [key]: value } };
      wbSaveRecord(activeId, recKey(themeId), next);
      return next;
    });
  };
  const saveExit = (r: WbExitResult) => {
    if (!themeId) return;
    setRec((prev: WbThemeRecord) => {
      const next = { ...prev, exits: [...prev.exits, r] };
      wbSaveRecord(activeId, recKey(themeId), next);
      return next;
    });
    if (onAward) onAward(20 + r.score * 5, 1 + r.score);
  };
  const openUnit = (id: WbThemeId) => {
    wbSfx.tap();
    setThemeId(id);
    setStage(0);
    setSeed(1 + Math.floor(Math.random() * 100000));
  };

  if (!unit) {
    return (
      <div data-testid="wb-view" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <style>{WB_PRINT_CSS}</style>
        <div style={card()}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <WbSpeak text={`PYP Workbook. ${year.label}. Choose a theme.`} />
            <span style={{ fontSize: 32, fontWeight: 800 }}>📒 PYP Workbook: {year.label}</span>
          </div>
          <div data-testid="wb-year-picker" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {WB_YEARS.map((y: WbYear, i: number) => (
              <button key={y.id} data-testid={`wb-year-${y.id}`} onClick={() => { wbSfx.tap(); setYearId(y.id); wbSpeak(y.label); }} style={btn(yearId === y.id ? pal[i % pal.length] : t.bg.elevated, yearId === y.id ? t.text.onColor : t.text.primary, { flex: "1 1 150px", flexDirection: "column" })}>
                <span>🎓 {y.label}</span>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{y.ages}</span>
              </button>
            ))}
          </div>
          <div data-testid="wb-year-focus" style={{ fontSize: 20 }}>{year.ages}: {year.focus}. Six inquiry units, each with Tuning In, Finding Out, Sorting Out, Taking Action, Reflection and an Exit Card.</div>
          <div style={{ fontSize: 18, color: t.text.secondary }}>Student: <b>{student ? student.name : ""}</b> · {WB_DISCLAIMER}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {year.units.map((u: WbUnit, i: number) => {
            const n = wbGetRecord(activeId, recKey(u.id)).exits.length;
            return (
              <button key={u.id} data-testid={`wb-theme-${u.id}`} onClick={() => openUnit(u.id)} style={{ ...card({ border: `4px solid ${pal[i % pal.length]}`, cursor: "pointer", textAlign: "left", fontFamily: t.font.family, color: t.text.primary, minHeight: 200 }) }}>
                <span style={{ fontSize: 56 }}>{u.emoji}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: t.text.secondary }}>Theme {u.number}</span>
                <span style={{ fontSize: 25, fontWeight: 800 }}>{u.theme}</span>
                <span style={{ fontSize: 20 }}>{u.unitTitle}</span>
                {n > 0 && <span style={{ fontSize: 18, color: t.text.success, fontWeight: 700 }}>🎟️ {n} exit card{n > 1 ? "s" : ""} saved</span>}
              </button>
            );
          })}
        </div>
        <button data-testid="wb-teacher-toggle" onClick={() => setShowTeacher(!showTeacher)} style={btn(t.fill.secondary, t.text.primary, { alignSelf: "flex-start" })}>
          👩‍🏫 {showTeacher ? "Hide" : "Show"} teacher results
        </button>
        {showTeacher && <div style={card()}><WbTeacherPanel students={students} initialYear={yearId} /></div>}
      </div>
    );
  }

  const st = WB_STAGES[stage];
  const props = { unit, seed, resp: rec.responses, setResp };
  const pct = Math.round(((stage + 1) / WB_STAGES.length) * 100);
  return (
    <div data-testid="wb-view" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <style>{WB_PRINT_CSS}</style>
      <div className="wb-noprint" style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <button data-testid="wb-back-themes" onClick={() => setThemeId(null)} style={btn(t.fill.secondary, t.text.primary)}>⬅️ Themes</button>
        <span style={{ fontSize: 24, fontWeight: 800, flex: "1 1 240px" }}>{unit.emoji} {year.label} · {unit.theme}</span>
        <button data-testid="wb-shuffle" onClick={() => { wbSfx.tap(); setSeed(seed + 1 + Math.floor(Math.random() * 997)); wbSpeak("New questions!"); }} style={btn(t.fill.accent, t.text.onColor)}>🔀 New questions</button>
        <button data-testid="wb-print" onClick={() => window.print()} style={btn(t.fill.secondary, t.text.primary)}>🖨️ Print workbook page</button>
      </div>
      <div className="wb-noprint" data-testid="wb-progress" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 18, borderRadius: 999, background: t.bg.subtle, border: `1px solid ${t.border.default}`, overflow: "hidden" }}>
          <div data-testid="wb-progress-fill" style={{ width: `${pct}%`, height: "100%", background: t.fill.accent, transition: "width 0.3s" }} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {WB_STAGES.map((s: { id: string; label: string; emoji: string }, i: number) => (
            <button key={s.id} data-testid={`wb-stage-btn-${s.id}`} onClick={() => { wbSfx.tap(); setStage(i); wbSpeak(s.label); }} style={btn(i === stage ? t.fill.primary : i < stage ? t.bg.subtle : t.bg.elevated, i === stage ? t.text.onPrimary : t.text.primary, { flex: "1 1 130px", fontSize: 18, padding: "8px 10px" })}>
              {i < stage ? "✅" : s.emoji} {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="wb-print-area" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontSize: 18, color: t.text.secondary }}>
          {student ? student.name : ""} · {year.label} · {unit.theme} · Step {stage + 1} of {WB_STAGES.length}: {st.label}
        </div>
        <div key={`${yearId}-${unit.id}-${seed}-${st.id}`}>
          {st.id === "overview" && <WbOverview {...props} />}
          {st.id === "tuning" && <WbTuningIn {...props} />}
          {st.id === "finding" && <WbFindingOut {...props} />}
          {st.id === "sorting" && <WbSortingOut {...props} />}
          {st.id === "action" && <WbAction {...props} />}
          {st.id === "reflection" && <WbReflection {...props} />}
          {st.id === "exit" && <WbExitCard {...props} exits={rec.exits} onSaveExit={saveExit} />}
        </div>
      </div>
      <div className="wb-noprint" style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <button data-testid="wb-prev" disabled={stage === 0} onClick={() => setStage(Math.max(0, stage - 1))} style={btn(t.fill.secondary, t.text.primary, { opacity: stage === 0 ? 0.5 : 1 })}>⬅️ Back</button>
        {stage < WB_STAGES.length - 1 ? (
          <button data-testid="wb-next" onClick={() => { wbSfx.tap(); setStage(stage + 1); wbSpeak(WB_STAGES[stage + 1].label); }} style={btn(t.fill.primary, t.text.onPrimary)}>Next: {WB_STAGES[stage + 1].emoji} {WB_STAGES[stage + 1].label} ➡️</button>
        ) : (
          <button onClick={() => setThemeId(null)} style={btn(t.fill.primary, t.text.onPrimary)}>🏁 Choose another theme</button>
        )}
      </div>
    </div>
  );
}
