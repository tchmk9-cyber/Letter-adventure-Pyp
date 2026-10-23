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

  // 5. Verify Memory Match scoring bug fix!
  await page.click('[data-testid="nav-tab-memory"]');
  await page.waitForSelector('[data-testid="memory-game-view"]');
  const coinsBefore = await page.textContent('[data-testid="header-coins"]');
  const starsBefore = await page.textContent('[data-testid="header-stars"]');

  // Find two cards with DIFFERENT matchKey and click them
  const keys = await page.$$eval('[data-testid^="memory-card-"]', (els) =>
    els.map((e, i) => ({ i, key: e.getAttribute("data-match-key") }))
  );
  const firstIdx = 0;
  const mismatchIdx = keys.find((k) => k.key !== keys[0].key).i;
  await page.click(`[data-testid="memory-card-${firstIdx}"]`);
  await page.click(`[data-testid="memory-card-${mismatchIdx}"]`);
  const coinsAfterMismatch = await page.textContent('[data-testid="header-coins"]');
  const starsAfterMismatch = await page.textContent('[data-testid="header-stars"]');
  report.memoryMismatchZeroAward = coinsBefore === coinsAfterMismatch && starsBefore === starsAfterMismatch;

  // Wait for mismatch reset (750ms) and then click a matching pair
  await page.waitForTimeout(800);
  const matchIdx = keys.find((k, i) => i !== 0 && k.key === keys[0].key).i;
  await page.click(`[data-testid="memory-card-${firstIdx}"]`);
  await page.click(`[data-testid="memory-card-${matchIdx}"]`);
  const coinsAfterMatch = await page.textContent('[data-testid="header-coins"]');
  const starsAfterMatch = await page.textContent('[data-testid="header-stars"]');
  report.memoryMatchAwarded = {
    before: { coins: coinsBefore, stars: starsBefore },
    afterMismatch: { coins: coinsAfterMismatch, stars: starsAfterMismatch },
    afterMatch: { coins: coinsAfterMatch, stars: starsAfterMatch },
  };

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

  report.errors = errors;
  report.externalReqs = externalReqs;

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  if (errors.length > 0) process.exit(1);
})();
