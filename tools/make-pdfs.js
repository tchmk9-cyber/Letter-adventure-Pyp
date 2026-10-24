/* Builds one printable A4 PYP Workbook PDF per year: node tools/make-pdfs.js */
const fs = require("fs");
const path = require("path");
const NM = "/workspace/abc-app/build/node_modules";
const esbuild = require(NM + "/esbuild");
const { chromium } = require(NM + "/playwright-core");
const css = require("./pdfStyles");
const unitHtml = require("./pdfUnit");
const { esc } = unitHtml;

const root = path.join(__dirname, "..");
const tmp = path.join("/tmp", "pyp-wb-data.cjs");
esbuild.buildSync({ entryPoints: [path.join(root, "src/data/pypWorkbooks.ts")], bundle: true, format: "cjs", platform: "node", outfile: tmp });
const data = require(tmp);

function cover(yr) {
  return `<section class="page cover">
  <div class="small">Primary Years Programme · Inquiry Workbook</div>
  <h1 style="font-size:40pt;margin-top:8mm">📒 PYP Workbook</h1>
  <div style="font-size:26pt;font-weight:800">${esc(yr.label)} · ${esc(yr.ages)}</div>
  <div class="big">${yr.units.map((u) => u.emoji).join(" ")}</div>
  <div style="font-size:15pt">Six transdisciplinary themes · Tuning In · Finding Out · Sorting Out · Taking Action · Reflection · Exit Cards</div>
  <div style="margin:18mm auto 0;width:70%;text-align:left;font-size:15pt">Name: ${'_'.repeat(30)}<br><br>Class: ${'_'.repeat(30)}<br><br>School: ${'_'.repeat(29)}</div>
  <div class="foot" style="margin-top:16mm">${esc(data.WB_DISCLAIMER)}<br>Part of Letter Adventure – PYP Edition (Years 1–4).</div>
</section>`;
}

function teacherNotes(yr) {
  const rows = yr.units.map((u) => `<tr><td>${u.emoji} <b>${esc(u.theme)}</b><br><span class="small">${esc(u.unitTitle)}</span></td><td class="small">${esc(u.centralIdea)}</td><td class="small">${u.keyConcepts.map(esc).join(", ")}</td><td class="small">${u.teacherNotes.map(esc).join("<br>")}</td></tr>`).join("");
  return `<section class="page">
  <h2>👩‍🏫 Teacher Notes · ${esc(yr.label)}</h2>
  <div class="box"><b>Learner focus (${esc(yr.ages)}):</b> ${esc(yr.focus)}.</div>
  <div class="box small"><b>How to use this workbook.</b> Each theme follows the inquiry cycle:
  <b>1 Tuning In</b> (provocation, See–Think–Wonder, curiosity questions) → <b>2 Finding Out</b> (picture words, sorting, true/false, sequencing, counting, draw and label${yr.id === "y1" ? "" : ", think and write"}) →
  <b>3 Sorting Out</b> (graphic organiser and the big idea) → <b>4 Taking Action</b> (a small real action at home or school) → <b>5 Reflection</b> (I used to think… now I think…, feelings, learner profile) → <b>6 Exit Card</b> (3-2-1, quick checks, confidence rating; three different cut-out versions).
  The interactive app version reshuffles questions every time (🔀 New questions) and saves exit-card results per student for the teacher dashboard. Read every prompt aloud for English learners; accept drawn, spoken or written answers.</div>
  <table style="font-size:10pt;break-inside:auto"><tr><th style="width:24%">Theme and unit</th><th style="width:28%">Central idea</th><th style="width:14%">Key concepts</th><th>Teaching notes and assessment</th></tr>${rows}</table>
  <div class="foot">${esc(data.WB_DISCLAIMER)}</div>
</section>`;
}

(async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  for (const yr of data.WB_YEARS) {
    const body = cover(yr) + teacherNotes(yr) + yr.units.map((u) => unitHtml(u, yr, data.WB_LEARNER_PROFILE)).join("");
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>PYP Workbook ${esc(yr.label)}</title><style>${css}</style></head><body>${body}</body></html>`;
    if ((new RegExp("r" + "ain" + "bow|\\u{1F308}", "iu")).test(html)) throw new Error("Forbidden content found in " + yr.label);
    await page.setContent(html, { waitUntil: "load" });
    const out = path.join(root, `Year-${yr.id.slice(1)}-PYP-Workbook.pdf`);
    await page.pdf({ path: out, format: "A4", printBackground: true, displayHeaderFooter: true, headerTemplate: "<span></span>",
      footerTemplate: `<div style="font-size:8px;width:100%;text-align:center;color:#64748B">PYP Workbook · ${esc(yr.label)} · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
      margin: { top: "14mm", bottom: "16mm", left: "13mm", right: "13mm" } });
    console.log("PDF:", out, fs.statSync(out).size, "bytes");
  }
  await browser.close();
})();
