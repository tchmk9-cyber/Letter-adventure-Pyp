# 🌍 Letter Adventure — IB PYP Edition (Year 1 to Year 4)

An interactive Primary Years Programme (IB PYP) learning app for **Year 1 to Year 4 (Ages 5–9)** combining phonics, vocabulary, stories, math, science & social inquiry, and creative studio activities.

## ✨ Features

- **🎓 Year 1 to Year 4 Selector**: Filter vocabulary, stories, math, and inquiry quizzes by `All Years (Y1–Y4)`, `Year 1`, `Year 2`, `Year 3`, or `Year 4`.
- **🌍 6 IB PYP Transdisciplinary Themes Hub**:
  1. **Who We Are** — Identity, Responsibility, Wellbeing (Healthy Body vs. Feelings & Kindness)
  2. **Where We Are in Place and Time** — Change, Connection, Perspective (Qatar Heritage: Wooden Pearl Dhow & Tent vs. Doha Metro & Modern Life)
  3. **How We Express Ourselves** — Form, Function, Perspective (Words & Stories vs. Art & Music)
  4. **How the World Works** — Causation, Change, Form (States of Matter, Weather, Plants & Forces)
  5. **How We Organize Ourselves** — Function, Connection, Responsibility (Community Helpers, Schools & Transport)
  6. **Sharing the Planet** — Responsibility, Causation, Connection (Recycling, Clean Energy & Desert Oryx Habitat)
- **🔤 Letter Sounds A–Z & Tracing Canvas**: Large `>=52x52px` letter chips, clear read-aloud, and pointer-enabled finger/mouse letter tracing.
- **📖 Read Words**: Scrambled letter spelling across PYP themes and Year 1–4 vocabulary.
- **🃏 Memory Match (Scoring Bug Fixed)**: Awards `+15 coins` and `+1 star` **only** when two flipped cards actually match, plus a `+25 coins` and `+2 stars` board completion bonus.
- **🎨 Coloring Studio (Pointer Events Fixed)**: Uses `pointerdown`/`pointermove`/`pointerup` with `touch-action: none` so mouse drag on desktop and touch on tablets both paint smooth strokes.
- **📚 Story Time, 🧮 Number Quest & 🔬 Science & Social Inquiry**: Enlarged `>=52x52px` `🔊` speaker buttons on every story sentence and question.
- **🕹️ Rewards Arcade & 👩‍🏫 Teacher / Parent Studio**: Student profile switcher (`Mia`, `Omar`, `Noor`, `Zaid` + custom students), Grown-Up check, PYP theme progress tracking, and custom **Teacher Voice Recording Studio**.

## 🚀 Offline Single-File Usage

Open `Letter-Adventure-IB-PYP.html` directly in Chrome, Edge, or Safari on any desktop, classroom smartboard, tablet, or phone — works 100% offline with zero external dependencies.

## 🛠️ Building from Source

```bash
npm install
npm run build
npm test
```

## 📒 PYP Workbook (Years 1–4)

Aligned with the IB PYP framework. This is an independent teacher resource, not official IB material.

- **App tab "📒 PYP Workbook":** pick a year (it starts on the active student's year), then one of the 6 themes. Each unit has 7 stages: Unit Overview, Tuning In, Finding Out, Sorting Out, Taking Action, Reflection and Exit Card. Responses are saved per student in localStorage, and the teacher dashboard shows exit-card results.
- **Data:** `src/data/yearN/` has one file per theme for each year, with the indexes in `src/data/yearNWorkbook.ts`. All years share the types in `src/data/year1/wbTypes.ts`.
- **Printable A4 workbooks:** `Year-1-PYP-Workbook.pdf` to `Year-4-PYP-Workbook.pdf`. Regenerate them with `node tools/make-pdfs.js`.
- **Page version:** `node tools/build-canvas.js --compact` writes `tools/out/letter-adventure.compact.canvas.tsx`. It has trimmed question banks and keeps every year, theme and stage.
