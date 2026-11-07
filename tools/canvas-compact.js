/* Serialises the workbook data into a compact text format for the Page (size-limited) version.
 * Banks are trimmed here; the offline HTML keeps the full content. */
const path = require("path");
const NM = "/workspace/abc-app/build/node_modules";
const esbuild = require(NM + "/esbuild");
const tmp = "/tmp/pyp-wb-data2.cjs";
esbuild.buildSync({ entryPoints: [path.join(__dirname, "../src/data/pypWorkbooks.ts")], bundle: true, format: "cjs", platform: "node", outfile: tmp });
const d = require(tmp);
const N = { q: 6, w: 6, s: 6, tf: 4, c: 2, og: 6, a: 3, ck: 4, th: 2 };
const c = (s) => String(s).replace(/[|=\n`$\\]/g, (m) => ({ "|": "/", "=": "-", "\n": " ", "`": "'", $: "S", "\\": "/" }[m]));
function unit(u) {
  const L = [];
  L.push(`T:${u.id}|${u.number}|${c(u.theme)}|${u.emoji}|${c(u.unitTitle)}`);
  L.push(`C:${c(u.centralIdea)}`, `K:${c(u.kidIdea)}`, `L:${u.lines.map(c).join("|")}`);
  L.push(`KC:${u.keyConcepts.join("|")}`, `RC:${u.relatedConcepts.join("|")}`, `LP:${u.learnerProfile.join("|")}`, `ATL:${u.atl.slice(0, 2).map((a) => c(a.split(":")[0])).join("|")}`);
  const p = u.provocation; L.push(`P:${c(p.title)}|${p.scene}|${c(p.description)}|${c(p.teacherPrompt.split("?")[0] + "?")}`);
  const s = u.seeThinkWonder; L.push(`S:${c(s.scene)}|${c(s.see)}|${c(s.think)}|${c(s.wonder)}`);
  L.push(`Q:${u.wonderQuestions.slice(0, N.q).map(c).join("|")}`);
  L.push(`W:${u.words.slice(0, N.w).map((w) => `${w.emoji} ${c(w.word)}=${c(w.sentence)}`).join("|")}`);
  const pick = (arr, n, key, vals) => { const out = []; vals.forEach((v) => out.push(...arr.filter((x) => x[key] === v).slice(0, n / vals.length))); return out; };
  L.push(`SO:${c(u.sort.prompt)}|${c(u.sort.buckets[0])}|${c(u.sort.buckets[1])}`);
  L.push(`SI:${pick(u.sort.items, N.s, "bucket", [0, 1]).map((i) => `${i.emoji} ${c(i.label)}=${i.bucket}`).join("|")}`);
  L.push(`TF:${pick(u.trueFalse, N.tf, "answer", [true, false]).map((t) => `${t.emoji} ${c(t.text)}=${t.answer ? 1 : 0}`).join("|")}`);
  const q = u.sequences[0]; L.push(`SQ:${c(q.title)}|${q.steps.map((x) => `${x.emoji} ${c(x.text)}`).join("|")}`);
  L.push(`CN:${u.counts.slice(0, N.c).map((x) => `${x.emoji}=${x.n}=${c(x.q)}`).join("|")}`);
  L.push(`DL:${c(u.drawLabel.prompt)}|${u.drawLabel.labels.slice(0, 6).map(c).join(",")}`);
  const o = u.organiser; L.push(`OG:${c(o.title)}|${c(o.prompt)}|${o.columns.map((x) => `${x.emoji} ${c(x.label)}`).join(",")}|${o.items.slice(0, N.og).map((x) => `${x.emoji} ${c(x.label)}=${x.col}`).join("|")}`);
  L.push(`A:${c(u.action.title)}|${c(u.action.homeLink)}|${u.action.ideas.slice(0, N.a).map((x) => `${x.emoji} ${c(x.text)}`).join("|")}`);
  L.push(`U:${c(u.usedToThink)}`);
  L.push(`CK:${u.checks.slice(0, N.ck).map((x) => `${x.emoji} ${c(x.q)}=${x.options.map(c).join(";")}=${x.options.indexOf(x.answer)}`).join("|")}`);
  if (u.thinkPrompts && u.thinkPrompts.length) L.push(`TH:${u.thinkPrompts.slice(0, N.th).map(c).join("|")}`);
  return L.join("\n");
}
for (const y of d.WB_YEARS) for (const u of y.units) for (const x of u.checks) if (x.options.indexOf(x.answer) < 0) throw new Error("bad check " + x.q);
let out = "";
for (const y of d.WB_YEARS) out += `const WBD_${y.id.toUpperCase()} = \`\n${y.units.map(unit).join("\n#\n")}\n\`;\n`;
process.stdout.write(out);
