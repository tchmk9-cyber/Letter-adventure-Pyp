/* Print CSS for the PYP Workbook PDFs (A4). Plain colours only. */
module.exports = `
@page { size: A4; margin: 14mm 13mm 16mm 13mm; }
* { box-sizing: border-box; }
body { font-family: "Nunito", "Segoe UI", "DejaVu Sans", Arial, sans-serif, "Noto Color Emoji"; color: #1E293B; font-size: 12.5pt; line-height: 1.3; margin: 0; }
.page { page-break-after: always; break-after: page; }
.page:last-child { page-break-after: auto; }
h1 { font-size: 30pt; margin: 0 0 6mm; }
h2 { font-size: 20pt; margin: 0 0 3mm; padding-bottom: 2mm; border-bottom: 3px solid #2563EB; }
h3 { font-size: 14.5pt; margin: 3mm 0 1.5mm; }
.small { font-size: 10.5pt; color: #475569; }
.box { border: 2px solid #CBD5E1; border-radius: 10px; padding: 3mm 4mm; margin: 2mm 0; break-inside: avoid; }
.write { border: 2px dashed #94A3B8; border-radius: 8px; min-height: 16mm; margin: 1.5mm 0 3mm; padding: 2mm; color: #94A3B8; font-size: 10pt; }
.write.tall { min-height: 55mm; }
.write.mid { min-height: 32mm; }
.lines { height: 9mm; border-bottom: 1.5px solid #94A3B8; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; }
.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3mm; }
.grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2.5mm; }
.chip { display: inline-block; border: 1.5px solid #64748B; border-radius: 999px; padding: 0.6mm 3mm; margin: 0.8mm; font-size: 11.5pt; }
.word { border: 1.5px solid #CBD5E1; border-radius: 8px; text-align: center; padding: 1.2mm 1mm; break-inside: avoid; }
.word .e { font-size: 20pt; }
.word .small { font-size: 9pt; }
.word b { display: block; font-size: 13pt; }
table { border-collapse: collapse; width: 100%; break-inside: avoid; }
tr { break-inside: avoid; }
td, th { border: 1.5px solid #94A3B8; padding: 2mm; vertical-align: top; font-size: 12pt; }
th { background: #F1F5F9; }
.tick { display: inline-block; width: 5mm; height: 5mm; border: 1.5px solid #475569; border-radius: 1mm; margin-right: 2mm; vertical-align: -1mm; }
.num { display: inline-block; width: 8mm; height: 8mm; border: 1.5px solid #475569; border-radius: 2mm; margin-right: 2mm; vertical-align: middle; }
.cut { border: 2.5px dashed #1E293B; border-radius: 10px; padding: 3mm 4mm; margin: 3mm 0; break-inside: avoid; position: relative; }
.cut::before { content: "✂"; position: absolute; top: -4.5mm; left: 6mm; background: white; padding: 0 1mm; font-size: 13pt; }
.faces span { font-size: 22pt; margin-right: 5mm; }
.cover { text-align: center; padding-top: 12mm; }
.cover .big { font-size: 54pt; letter-spacing: 5mm; margin: 10mm 0; }
.stage { display: inline-block; background: #1E293B; color: white; border-radius: 6px; padding: 0.5mm 3mm; font-size: 11pt; margin-right: 2mm; }
.foot { font-size: 9pt; color: #64748B; margin-top: 3mm; }
`;
