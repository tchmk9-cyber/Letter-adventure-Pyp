/* Page-only: parse the compact workbook text into WbUnit objects. */
function wbSplitEmoji(s: string): { emoji: string; label: string } {
  const i = s.indexOf(" ");
  return i < 0 ? { emoji: "", label: s } : { emoji: s.slice(0, i), label: s.slice(i + 1) };
}
function wbParseUnit(block: string): WbUnit {
  const m: Record<string, string> = {};
  block.trim().split("\n").forEach((ln: string) => {
    const k = ln.indexOf(":");
    m[ln.slice(0, k)] = ln.slice(k + 1);
  });
  const P = (k: string): string[] => (m[k] || "").split("|").filter((x: string) => x);
  const [id, num, theme, emoji, unitTitle] = P("T");
  const [pt, ps, pd, pp] = P("P");
  const [ss, s1, s2, s3] = P("S");
  const so = P("SO");
  const sq = P("SQ");
  const dl = P("DL");
  const og = P("OG");
  const ac = P("A");
  return {
    id: id as WbThemeId, number: Number(num), theme, emoji, unitTitle,
    centralIdea: m.C, kidIdea: m.K, lines: P("L"), keyConcepts: P("KC"), relatedConcepts: P("RC"), learnerProfile: P("LP"), atl: P("ATL"),
    provocation: { title: pt, scene: ps, description: pd, teacherPrompt: pp },
    seeThinkWonder: { scene: ss, see: s1, think: s2, wonder: s3 },
    wonderQuestions: P("Q"),
    words: P("W").map((w: string) => { const [a, b] = w.split("="); const e = wbSplitEmoji(a); return { word: e.label, emoji: e.emoji, sentence: b || "" }; }),
    sort: { prompt: so[0], buckets: [so[1], so[2]], items: P("SI").map((x: string) => { const [a, b] = x.split("="); const e = wbSplitEmoji(a); return { label: e.label, emoji: e.emoji, bucket: Number(b) }; }) },
    trueFalse: P("TF").map((x: string) => { const [a, b] = x.split("="); const e = wbSplitEmoji(a); return { text: e.label, emoji: e.emoji, answer: b === "1" }; }),
    sequences: [{ title: sq[0], steps: sq.slice(1).map((x: string) => { const e = wbSplitEmoji(x); return { text: e.label, emoji: e.emoji }; }) }],
    counts: P("CN").map((x: string) => { const [e, n, q] = x.split("="); return { emoji: e, n: Number(n), q }; }),
    drawLabel: { prompt: dl[0], labels: (dl[1] || "").split(",") },
    organiser: {
      title: og[0], prompt: og[1],
      columns: (og[2] || "").split(",").map((x: string) => { const e = wbSplitEmoji(x); return { label: e.label, emoji: e.emoji }; }),
      items: og.slice(3).map((x: string) => { const [a, b] = x.split("="); const e = wbSplitEmoji(a); return { label: e.label, emoji: e.emoji, col: Number(b) }; }),
    },
    action: { title: ac[0], homeLink: ac[1], ideas: ac.slice(2).map((x: string) => { const e = wbSplitEmoji(x); return { text: e.label, emoji: e.emoji }; }) },
    usedToThink: m.U,
    checks: P("CK").map((x: string) => { const [a, o, ans] = x.split("="); const e = wbSplitEmoji(a); const op = o.split(";"); return { q: e.label, emoji: e.emoji, options: op, answer: op[Number(ans)] }; }),
    teacherNotes: [],
    thinkPrompts: P("TH"),
  };
}
const wbUnits = (txt: string): WbUnit[] => txt.split("\n#\n").map(wbParseUnit);
const WB_DISCLAIMER = "Aligned with the IB PYP framework. Independent teacher resource, not official IB material.";
const WB_YEARS: WbYear[] = [
  { id: "y1", label: "Year 1", ages: "Ages 5–6", focus: "Picture words, very short sentences, tap and draw", units: wbUnits(WBD_Y1) },
  { id: "y2", label: "Year 2", ages: "Ages 6–7", focus: "Short sentences and simple reasons", units: wbUnits(WBD_Y2) },
  { id: "y3", label: "Year 3", ages: "Ages 7–8", focus: "Explaining, comparing and short written answers", units: wbUnits(WBD_Y3) },
  { id: "y4", label: "Year 4", ages: "Ages 8–9", focus: "Research questions, cause and effect, and perspectives", units: wbUnits(WBD_Y4) },
];
function wbYear(id: WbYearId): WbYear {
  return WB_YEARS.find((y: WbYear) => y.id === id) || WB_YEARS[0];
}
