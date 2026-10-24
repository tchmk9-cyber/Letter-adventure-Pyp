/* Teacher view: each student's latest Year 1 Workbook exit-card results per theme. */
import { useState } from "../../grok";
import { WB_CONFIDENCE, WB_YEARS, wbYear } from "../../data/pypWorkbooks";
import type { WbUnit, WbYear, WbYearId } from "../../data/pypWorkbooks";
import { useWbTheme } from "./wbEnv";
import { wbGetRecord, useWbBtn } from "./wbCore";

export function WbTeacherPanel({ students, initialYear }: { students: { id: string; name: string }[]; initialYear?: WbYearId }) {
  const t = useWbTheme();
  const btn = useWbBtn();
  const [yearId, setYearId] = useState<WbYearId>(initialYear || "y1");
  const units = wbYear(yearId).units;
  const cell = { padding: "10px 8px", borderBottom: `1px solid ${t.border.subtle}`, fontSize: 18, textAlign: "center" as const };
  return (
    <div data-testid="wb-teacher-panel" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 22, fontWeight: 800 }}>📒 PYP Workbook: Exit-Card Results</div>
      <div style={{ fontSize: 17, color: t.text.secondary }}>
        Latest score, confidence face and number of exit cards saved for each theme.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {WB_YEARS.map((y: WbYear) => (
          <button key={y.id} data-testid={`wb-teacher-year-${y.id}`} onClick={() => setYearId(y.id)} style={btn(yearId === y.id ? t.fill.primary : t.bg.elevated, yearId === y.id ? t.text.onPrimary : t.text.primary, { fontSize: 18 })}>
            {y.label}
          </button>
        ))}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 720 }}>
          <thead>
            <tr>
              <th style={{ ...cell, textAlign: "left" }}>Student</th>
              {units.map((u: WbUnit) => (
                <th key={u.id} style={cell} title={u.theme}>
                  {u.emoji} {u.theme.split(" ").slice(0, 3).join(" ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s: { id: string; name: string }) => (
              <tr key={s.id} data-testid={`wb-teacher-row-${s.id}`}>
                <td style={{ ...cell, textAlign: "left", fontWeight: 700 }}>{s.name}</td>
                {units.map((u: WbUnit) => {
                  const exits = wbGetRecord(s.id, `${yearId}:${u.id}`).exits;
                  const last = exits[exits.length - 1];
                  return (
                    <td key={u.id} style={cell}>
                      {last ? (
                        <span>
                          {WB_CONFIDENCE[last.confidence - 1]?.emoji} {last.score}/{last.total}
                          <br />
                          <span style={{ fontSize: 14, color: t.text.secondary }}>
                            {exits.length} card{exits.length > 1 ? "s" : ""} · {last.date.slice(0, 10)}
                          </span>
                        </span>
                      ) : (
                        <span style={{ color: t.text.secondary }}>–</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
