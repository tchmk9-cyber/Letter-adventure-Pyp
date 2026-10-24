/* Builds the single-module Page source (tools/out/letter-adventure.canvas.tsx) from the
 * existing Page base plus the PYP Workbook data and components.
 * Usage: node tools/build-canvas.js [--trim]   (--trim shortens question banks for size limits) */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const rd = (p) => fs.readFileSync(path.join(root, p), "utf8");
const TRIM = process.argv.includes("--trim");
const COMPACT = process.argv.includes("--compact");

const dataFiles = ["src/data/year1/wbTypes.ts"];
const yearDirs = { year1: ["unitWhoWeAre", "unitWhereWeAre", "unitExpress", "unitWorldWorks", "unitOrganize", "unitSharingPlanet"] };
for (const y of [2, 3, 4]) yearDirs[`year${y}`] = ["WhoWeAre", "WhereWeAre", "Express", "WorldWorks", "Organize", "SharingPlanet"].map((n) => `y${y}${n}`);
for (const [dir, files] of Object.entries(yearDirs)) {
  files.forEach((f) => dataFiles.push(`src/data/${dir}/${f}.ts`));
  dataFiles.push(`src/data/${dir}Workbook.ts`);
}
dataFiles.push("src/data/pypWorkbooks.ts");
const compFiles = ["wbCore.ts", "WbParts.tsx", "WbActivitiesA.tsx", "WbActivitiesB.tsx", "WbStagesIntro.tsx", "WbStagesMiddle.tsx", "WbStagesEnd.tsx", "WbTeacherPanel.tsx", "PypWorkbookView.tsx"].map((f) => `src/components/workbook/${f}`);

const CANVAS_ENV = `
/* ---------- PYP Workbook environment (Page version) ---------- */
function wbSpeak(text: string | string[]): void {
  speak(text);
}
const wbSfx = { tap: (): void => undefined, good: (): void => undefined, oops: (): void => undefined, win: (): void => undefined };
function useWbTheme() {
  return useGrokTheme();
}
type WbStyle = CSSProperties;
`;

function strip(src) {
  return src
    .replace(/^import[\s\S]*?from\s+"[^"]+";[ \t]*\n/gm, "")
    .replace(/^export \* from "[^"]+";\n/gm, "")
    .replace(/^export (?=(function|const|type|interface|let|class) )/gm, "");
}

/* Shorten long arrays in unit data (only used with --trim). */
function trimUnit(src) {
  return src;
}

let wb = "\n/* ====================== 📒 PYP WORKBOOK (Years 1–4) ====================== */\n";
wb += "/* Aligned with the IB PYP framework. Independent teacher resource, not official IB material. */\n";
if (COMPACT) {
  const { execFileSync } = require("child_process");
  wb += strip(rd("src/data/year1/wbTypes.ts"));
  wb += execFileSync("node", [path.join(__dirname, "canvas-compact.js")], { encoding: "utf8" });
  wb += fs.readFileSync(path.join(__dirname, "canvasParser.ts"), "utf8");
} else for (const f of dataFiles) wb += `\n/* --- ${f} --- */\n` + (TRIM ? trimUnit(strip(rd(f))) : strip(rd(f)));
wb += CANVAS_ENV;
for (const f of compFiles) wb += `\n/* --- ${f} --- */\n` + strip(rd(f));

if (COMPACT) {
  let inTpl = false;
  wb = wb.split("\n").map((l) => {
    const out = inTpl ? l : l.replace(/^\s+/, "");
    if (((l.match(/`/g) || []).length) % 2 === 1) inTpl = !inTpl;
    return out;
  }).filter((l) => !/^\/\/ /.test(l) && !/^\/\*.*\*\/$/.test(l) && !/^\/\*\* .*\*\/$/.test(l)).join("\n");
  fs.mkdirSync(path.join(__dirname, "out"), { recursive: true });
  fs.writeFileSync(path.join(__dirname, "out", "wb-block.tsx"), wb);
}
let base = fs.readFileSync(path.join(__dirname, "canvas-base.canvas.tsx"), "utf8");
const must = (cond, msg) => { if (!cond) throw new Error("Patch failed: " + msg); };
must(base.includes('type TabId = "pyp"'), "TabId");
base = base.replace('type TabId = "pyp"', wb + '\ntype TabId = "workbook" | "pyp"');
must(base.includes('  { id: "pyp", emoji: "🌍", label: "6 PYP Themes" },'), "NAV");
base = base.replace('  { id: "pyp", emoji: "🌍", label: "6 PYP Themes" },', '  { id: "workbook", emoji: "📒", label: "PYP Workbook" },\n  { id: "pyp", emoji: "🌍", label: "6 PYP Themes" },');
must(base.includes('        {tab === "pyp" && ('), "render");
base = base.replace('        {tab === "pyp" && (', `        {tab === "workbook" && (
          <PypWorkbookView
            students={[{ id: "class", name: "My Class", year: year === "all" ? "y1" : year }]}
            activeId="class"
            onAward={(pts: number, st: number) => award(pts, st, "Exit card saved")}
          />
        )}
        {tab === "pyp" && (`);
if ((new RegExp("r" + "ain" + "bow|\\u{1F308}", "iu")).test(base)) throw new Error("Forbidden content in canvas source");
fs.mkdirSync(path.join(__dirname, "out"), { recursive: true });
const out = path.join(__dirname, "out", COMPACT ? "letter-adventure.compact.canvas.tsx" : "letter-adventure.canvas.tsx");
fs.writeFileSync(out, base);
console.log("Canvas source:", out, Buffer.byteLength(base), "bytes", base.split("\n").length, "lines");
