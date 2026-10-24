const { chromium } = require("/workspace/abc-app/build/node_modules/playwright-core");

(async () => {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox"],
  });

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  const externalReqs = [];

  page.on("console", (m) => {
    if (m.type() === "error") errors.push("console.error: " + m.text());
  });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

  await ctx.route("**/*", (r) => {
    const u = r.request().url();
    if (!u.startsWith("file:") && !u.startsWith("data:")) {
      externalReqs.push(u);
      return r.abort();
    }
    return r.continue();
  });

  await page.goto("file:///workspace/letter-adventure-pyp/Letter-Adventure-IB-PYP.html");
  await page.waitForSelector('[data-testid="year-selector-bar"]');

  const report = {};


  // 0. PYP Workbook: 4 years x 6 themes x every stage, exit cards save
  await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
  await page.click('[data-testid="nav-tab-workbook"]');
  await page.waitForSelector('[data-testid="wb-view"]');
  const WB_THEMES = ["who-we-are", "where-we-are", "express-ourselves", "world-works", "organize-ourselves", "sharing-planet"];
  const WB_STAGES = ["overview", "tuning", "finding", "sorting", "action", "reflection", "exit"];
  const WB_YEARS = ["y1", "y2", "y3", "y4"];
  report.workbook = { themes: {}, minButton: { w: 9999, h: 9999 }, minPromptFont: 999 };
  for (const yr of WB_YEARS) {
  await page.click(`[data-testid="wb-year-${yr}"]`);
  for (const th of WB_THEMES) {
    await page.click(`[data-testid="wb-theme-${th}"]`);
    const r = { stages: [], acts: [], exitSaved: false, shuffleChanges: false };
    for (const st of WB_STAGES) {
      await page.click(`[data-testid="wb-stage-btn-${st}"]`);
      await page.waitForSelector(`[data-testid="wb-stage-${st}"]`, { timeout: 4000 });
      r.stages.push(st);
      const m = await page.evaluate(() => {
        const out = { w: 9999, h: 9999, font: 999 };
        document.querySelectorAll('[data-testid="wb-view"] button').forEach((b) => {
          const rc = b.getBoundingClientRect();
          if (rc.width === 0) return;
          out.w = Math.min(out.w, rc.width); out.h = Math.min(out.h, rc.height);
        });
        document.querySelectorAll('[data-testid="wb-speak"] + span, [data-testid="wb-speak"] ~ span').forEach((sp) => {
          out.font = Math.min(out.font, parseFloat(getComputedStyle(sp).fontSize));
        });
        return out;
      });
      report.workbook.minButton.w = Math.min(report.workbook.minButton.w, Math.round(m.w));
      report.workbook.minButton.h = Math.min(report.workbook.minButton.h, Math.round(m.h));
      report.workbook.minPromptFont = Math.min(report.workbook.minPromptFont, m.font);
      if (st === "tuning") {
        const before = await page.textContent('[data-testid="wb-wonder-q-0"]');
        let changed = false;
        for (let k = 0; k < 4 && !changed; k++) {
          await page.click('[data-testid="wb-shuffle"]');
          await page.waitForSelector('[data-testid="wb-stage-tuning"]');
          changed = (await page.textContent('[data-testid="wb-wonder-q-0"]')) !== before;
        }
        r.shuffleChanges = changed;
      }
      if (st === "finding") {
        const acts = await page.$$eval('[data-testid^="wb-act-tab-"]', (els) => els.map((e) => e.getAttribute("data-testid").replace("wb-act-tab-", "")));
        for (const a of acts) {
          await page.click(`[data-testid="wb-act-tab-${a}"]`);
          await page.waitForSelector(`[data-testid="wb-act-${a}"]`, { timeout: 4000 });
          r.acts.push(a);
        }
        await page.click('[data-testid="wb-act-tab-draw"]');
        const box = await page.locator('[data-testid="wb-draw-find:draw"]').boundingBox();
        await page.mouse.move(box.x + 40, box.y + 40); await page.mouse.down();
        await page.mouse.move(box.x + 200, box.y + 120, { steps: 6 }); await page.mouse.up();
      }
      if (st === "exit") {
        for (const i of [0, 1, 2]) await page.click(`[data-testid="wb-exit-word-${i}"]`);
        for (const i of [0, 1]) await page.click(`[data-testid="wb-exit-fact-${i}"]`);
        for (const i of [0, 1, 2]) await page.click(`[data-testid="wb-exit-check-${i}-0"]`);
        await page.click('[data-testid="wb-exit-conf-3"]');
        await page.click('[data-testid="wb-exit-save"]');
        await page.waitForSelector('[data-testid="wb-exit-saved"]', { timeout: 4000 });
        r.exitSaved = true;
      }
    }
    if (th === "who-we-are" && yr === "y1") { await page.click('[data-testid="wb-print"]'); }
    report.workbook.themes[`${yr}:${th}`] = r;
    await page.click('[data-testid="wb-back-themes"]');
  }
  }
  report.workbook.printCalled = await page.evaluate(() => window.__printed);
  report.workbook.storedExitThemes = await page.evaluate(() => {
    const db = JSON.parse(localStorage.getItem("la-pyp-y1-workbook-v1") || "{}");
    return Object.values(db).map((p) => Object.values(p).filter((r) => r.exits && r.exits.length).length);
  });
  await page.click('[data-testid="wb-teacher-toggle"]');
  await page.click('[data-testid="wb-teacher-year-y4"]');
  report.workbook.teacherPanelCellsY4 = await page.$$eval('[data-testid="wb-teacher-panel"] td', (els) => els.filter((e) => /\d\/3/.test(e.textContent)).length);
  await page.click('[data-testid="wb-teacher-year-y1"]');
  report.workbook.teacherPanelCells = await page.$$eval('[data-testid="wb-teacher-panel"] td', (els) => els.filter((e) => /\d\/3/.test(e.textContent)).length);
  report.workbook.noForbiddenArcInDom = await page.evaluate(() => !(new RegExp("r" + "ain" + "bow|\\u{1F308}", "iu")).test(document.body.innerHTML));
  await page.click('[data-testid="nav-tab-pyp"]');

  // 1. Check Year 1 to Year 4 buttons
  report.yearButtons = await page.$$eval('[data-testid^="year-btn-"]', (els) => els.map((e) => e.textContent.trim()));
  await page.click('[data-testid="year-btn-y2"]');
  report.year2Desc = await page.textContent('[data-testid="year-desc"]');
  await page.click('[data-testid="year-btn-all"]');

  // 2. Check 6 PYP Themes
  report.pypThemeCount = await page.$$eval('[data-testid^="pyp-theme-card-"]', (els) => els.length);
  await page.click('[data-testid="pyp-subtab-sort"]');
  await page.waitForSelector('[data-testid="pyp-sort-panel"]');
  await page.click('[data-testid="pyp-subtab-quiz"]');
  await page.waitForSelector('[data-testid="pyp-quiz-panel"]');
  const quizSpeakerBox = await page.locator('[data-testid="pyp-quiz-speaker-btn"]').boundingBox();
  report.pypQuizSpeakerSize = { w: Math.round(quizSpeakerBox.width), h: Math.round(quizSpeakerBox.height) };

  // 3. Check Letter Sounds & chip touch targets (>=48x48)
  await page.click('[data-testid="nav-tab-letters"]');
  await page.waitForSelector('[data-testid="letters-drill-view"]');
  const chipABox = await page.locator('[data-testid="letter-chip-A"]').boundingBox();
  report.letterChipASize = { w: Math.round(chipABox.width), h: Math.round(chipABox.height) };

  // 4. Check Read Words & Shuffle button size
  await page.click('[data-testid="nav-tab-words"]');
  await page.waitForSelector('[data-testid="words-spell-view"]');
  const shuffleBox = await page.locator('[data-testid="word-shuffle-button"]').boundingBox();
  report.shuffleBtnHeight = Math.round(shuffleBox.height);

  // 5. Memory Match scoring: a match must give exactly +15 coins and +1 star; a mismatch gives nothing.
  await page.click('[data-testid="nav-tab-memory"]');
  await page.waitForSelector('[data-testid="memory-game-view"]');
  const num = (s) => Number(String(s).replace(/[^0-9-]/g, ""));
  const hud = async () => ({
    coins: num(await page.textContent('[data-testid="header-coins"]')),
    stars: num(await page.textContent('[data-testid="header-stars"]')),
  });
  const deckKeys = () => page.$$eval('[data-testid^="memory-card-"]', (els) => els.map((e) => e.getAttribute("data-match-key")));
  // The deck must not change by itself after it is shown (it used to be rebuilt on mount).
  const deckAtMount = await deckKeys();
  await page.waitForTimeout(600);
  const deckLater = await deckKeys();
  const deckStable = JSON.stringify(deckAtMount) === JSON.stringify(deckLater);

  const hud0 = await hud();
  let keys = await deckKeys();
  const mismatchIdx = keys.findIndex((k) => k !== keys[0]);
  await page.click('[data-testid="memory-card-0"]');
  await page.click(`[data-testid="memory-card-${mismatchIdx}"]`);
  await page.waitForTimeout(250);
  const hud1 = await hud();
  await page.waitForTimeout(800); // mismatch cards flip back after 700ms

  keys = await deckKeys(); // re-read right before the match clicks
  const matchIdx = keys.findIndex((k, i) => i !== 0 && k === keys[0]);
  await page.click('[data-testid="memory-card-0"]');
  await page.click(`[data-testid="memory-card-${matchIdx}"]`);
  await page.waitForTimeout(250);
  const hud2 = await hud();
  const statusAfterMatch = (await page.textContent('[data-testid="memory-status"]')).trim();

  const mismatchDelta = { coins: hud1.coins - hud0.coins, stars: hud1.stars - hud0.stars };
  const matchDelta = { coins: hud2.coins - hud1.coins, stars: hud2.stars - hud1.stars };
  report.memory = {
    deckStableAfterMount: deckStable,
    before: hud0,
    afterMismatch: hud1,
    afterMatch: hud2,
    mismatchDelta,
    matchDelta,
    statusAfterMatch,
  };
  report.memory.pass =
    deckStable &&
    mismatchDelta.coins === 0 && mismatchDelta.stars === 0 &&
    matchDelta.coins === 15 && matchDelta.stars === 1 &&
    /Matched: 1\//.test(statusAfterMatch);

  // 6. Verify Coloring Studio pointer drag painting
  await page.click('[data-testid="nav-tab-coloring"]');
  await page.waitForSelector('[data-testid="coloring-canvas"]');
  const canvasBox = await page.locator('[data-testid="coloring-canvas"]').boundingBox();
  await page.mouse.move(canvasBox.x + 80, canvasBox.y + 80);
  await page.mouse.down();
  await page.mouse.move(canvasBox.x + 180, canvasBox.y + 150, { steps: 5 });
  await page.mouse.up();
  await page.click('[data-testid="coloring-done-button"]');
  report.coloringRewardShown = (await page.locator('[data-testid="reward-banner"]').count()) > 0;

  // 7. Verify Story Time per-sentence speaker buttons (>=48x48)
  await page.click('[data-testid="nav-tab-stories"]');
  await page.waitForSelector('[data-testid="story-sam"]');
  await page.click('[data-testid="story-sam"]');
  const speaker0Box = await page.locator('[data-testid="story-line-speaker-0"]').boundingBox();
  report.storySpeakerSize = { w: Math.round(speaker0Box.width), h: Math.round(speaker0Box.height) };

  // 8. Verify Number Quest & Science Quest speaker button (>=48x48)
  await page.click('[data-testid="nav-tab-math"]');
  await page.waitForSelector('[data-testid="math-quest-view"]');
  const mathHearBox = await page.locator('[data-testid="math-hear-button"]').boundingBox();
  report.mathHearHeight = Math.round(mathHearBox.height);

  await page.click('[data-testid="nav-tab-science"]');
  await page.waitForSelector('[data-testid="science-quest-view"]');
  const sciHearBox = await page.locator('[data-testid="science-hear-button"]').boundingBox();
  report.scienceSpeakerSize = { w: Math.round(sciHearBox.width), h: Math.round(sciHearBox.height) };

  // 9. Verify Profiles & Teacher Studio
  await page.click('[data-testid="nav-tab-teacher"]');
  await page.waitForSelector('[data-testid="teacher-gate-42"]');
  await page.click('[data-testid="teacher-gate-42"]');
  report.teacherStudioUnlocked = (await page.locator('[data-testid="teacher-dashboard-content"]').count()) > 0;
  report.teacherWorkbookResults = await page.$$eval('[data-testid="teacher-dashboard-content"] [data-testid="wb-teacher-panel"] td', (els) => els.filter((e) => /\d\/3/.test(e.textContent)).length);

  report.errors = errors;
  report.externalReqs = externalReqs;

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  const wbOk = Object.values(report.workbook.themes).every((r) => r.stages.length === 7 && r.acts.length >= 7 && r.exitSaved);
  if (!report.memory.pass) console.error("FAIL: Memory Match scoring", JSON.stringify(report.memory));
  if (!report.memory.pass || errors.length > 0 || externalReqs.length > 0 || !wbOk || !report.workbook.noForbiddenArcInDom) process.exit(1);
})();
