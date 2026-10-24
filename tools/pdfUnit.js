/* HTML builders for one PYP Workbook unit (all stages) in the printable PDF. */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const lines = (n) => Array.from({ length: n }, () => '<div class="lines"></div>').join("");
const chips = (arr) => arr.map((c) => `<span class="chip">${esc(c)}</span>`).join(" ");

/* Deterministic shuffle so each printed exit card asks different questions. */
function pick(arr, n, salt) {
  const a = arr.slice();
  let x = 12345 + salt * 7919;
  for (let i = a.length - 1; i > 0; i--) {
    x = (x * 1103515245 + 12345) % 2147483648;
    const j = x % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

function overviewPage(u, yr) {
  return `<section class="page">
  <div class="small">${esc(yr.label)} · Theme ${u.number} of 6</div>
  <h2>${u.emoji} ${esc(u.theme)}: ${esc(u.unitTitle)}</h2>
  <div class="box"><b>Our big idea:</b> ${esc(u.kidIdea)}<br><span class="small"><b>Central idea:</b> ${esc(u.centralIdea)}</span></div>
  <div class="grid2">
    <div class="box"><b>Lines of inquiry</b><ol style="margin:1mm 0 0 5mm;padding:0">${u.lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ol></div>
    <div class="box"><b>Key concepts:</b> ${chips(u.keyConcepts)}<br><b>Related concepts:</b> ${chips(u.relatedConcepts)}<br><b>Learner profile:</b> ${chips(u.learnerProfile)}</div>
  </div>
  <div class="box small"><b>Approaches to learning:</b> ${u.atl.map(esc).join(" · ")}</div>
  <h3><span class="stage">1</span>👀 Tuning In: ${esc(u.provocation.title)}</h3>
  <div class="box"><div style="font-size:26pt;text-align:center">${u.provocation.scene}</div>${esc(u.provocation.description)}<div class="small"><b>Teacher prompt:</b> ${esc(u.provocation.teacherPrompt)}</div></div>
  <h3>See – Think – Wonder <span style="font-size:20pt">${u.seeThinkWonder.scene}</span></h3>
  <div class="grid3">
    <div><b>👀 ${esc(u.seeThinkWonder.see)}</b><div class="write" style="min-height:26mm">I see…</div></div>
    <div><b>💭 ${esc(u.seeThinkWonder.think)}</b><div class="write" style="min-height:26mm">I think…</div></div>
    <div><b>🤔 ${esc(u.seeThinkWonder.wonder)}</b><div class="write" style="min-height:26mm">I wonder…</div></div>
  </div>
</section>`;
}

function wonderAndFindingPage(u) {
  const words = u.words.map((w) => `<div class="word"><span class="e">${w.emoji}</span><b>${esc(w.word)}</b><span class="small">${esc(w.sentence)}</span></div>`).join("");
  return `<section class="page">
  <h3>❓ Curiosity questions: tick the ones you wonder about too</h3>
  <div class="grid2">${u.wonderQuestions.slice(0, 10).map((q) => `<div><span class="tick"></span>${esc(q)}</div>`).join("")}</div>
  <h3>💬 My own question</h3>
  <div class="small">Starters: I wonder why… · I wonder how… · What if…? · How do we know…?</div>${lines(2)}
  <h3><span class="stage">2</span>🔍 Finding Out: picture words</h3>
  <div class="grid4">${words}</div>
</section>`;
}

function findingPage2(u, yr) {
  const tf = u.trueFalse.slice(0, 8).map((s) => `<tr><td>${s.emoji} ${esc(s.text)}</td><td style="width:22mm;text-align:center">True</td><td style="width:22mm;text-align:center">False</td></tr>`).join("");
  const seq = u.sequences[0];
  const seqCells = pick(seq.steps, seq.steps.length, 3).map((s) => `<div class="box" style="text-align:center"><span class="num"></span><div style="font-size:22pt">${s.emoji}</div>${esc(s.text)}</div>`).join("");
  const sortRows = pick(u.sort.items, 10, 5).map((i) => `<span class="chip">${i.emoji} ${esc(i.label)}</span>`).join(" ");
  const counts = u.counts.slice(0, 2).map((c) => `<div class="box"><b>${esc(c.q)}</b><div style="font-size:16pt;letter-spacing:1mm">${c.emoji.repeat(c.n)}</div>Answer: <span class="num"></span></div>`).join("");
  return `<section class="page">
  <h3>🧺 Sort it: ${esc(u.sort.prompt)}</h3>
  <div class="small">Write or draw each item in the right column.</div><div>${sortRows}</div>
  <table><tr><th>${esc(u.sort.buckets[0])}</th><th>${esc(u.sort.buckets[1])}</th></tr><tr><td style="height:30mm"></td><td></td></tr></table>
  <h3>👍 True or false? Circle one.</h3>
  <table>${tf}</table>
  <h3>🔢 Put in order: ${esc(seq.title)}. Number the boxes.</h3>
  <div class="grid${seq.steps.length >= 4 ? 4 : 3}">${seqCells}</div>
</section>
<section class="page">
  <h3>🔎 Count and observe</h3><div class="grid2">${counts}</div>
  <h3>🖍️ Draw and label: ${esc(u.drawLabel.prompt)}</h3>
  <div class="small">Word bank: ${chips(u.drawLabel.labels)}</div>
  <div class="write mid" style="min-height:48mm"></div>
  ${(u.thinkPrompts || []).length ? `<h3>✍️ Think and write</h3>${u.thinkPrompts.slice(0, yr.id === "y4" ? 3 : 2).map((p) => `<div><b>${esc(p)}</b></div>${lines(2)}`).join("")}` : `<h3>✍️ Tell a friend</h3><div>Tell a friend one new word. Draw it here:</div><div class="write mid"></div>`}
</section>`;
}

function sortingActionPage(u) {
  const org = u.organiser;
  return `<section class="page">
  <h3><span class="stage">3</span>🧩 Sorting Out: ${esc(org.title)}</h3>
  <div>${esc(org.prompt.replace(/Tap/g, "Choose").replace(/tap/g, "write it under"))}</div>
  <div style="margin:2mm 0">${org.items.map((i) => `<span class="chip">${i.emoji} ${esc(i.label)}</span>`).join(" ")}</div>
  <table><tr>${org.columns.map((c) => `<th>${c.emoji} ${esc(c.label)}</th>`).join("")}</tr><tr>${org.columns.map(() => '<td style="height:40mm"></td>').join("")}</tr></table>
  <h3>💡 The big idea in my own words</h3>${lines(2)}
</section>
<section class="page">
  <h3><span class="stage">4</span>🤝 Taking Action: ${esc(u.action.title)}</h3>
  <div class="grid2">${u.action.ideas.map((i) => `<div><span class="tick"></span>${i.emoji} ${esc(i.text)}</div>`).join("")}</div>
  <div style="margin-top:2mm"><b>My plan: I will…</b></div>${lines(2)}
  <div><b>Where?</b> <span class="tick"></span>🏠 Home <span class="tick"></span>🏫 School <span class="tick"></span>🌳 Community</div>
  <div class="write tall">Draw yourself taking action.</div>
  <div class="box small">🏠 <b>Home link:</b> ${esc(u.action.homeLink)}</div>
</section>`;
}

function reflectionPage(u, lp) {
  return `<section class="page">
  <h3><span class="stage">5</span>🪞 Reflection</h3>
  <div class="small">Example: ${esc(u.usedToThink)}</div>
  <div class="grid2"><div><b>⬅️ I used to think…</b><div class="write mid"></div></div><div><b>➡️ Now I think…</b><div class="write mid"></div></div></div>
  <b>How do I feel about this unit? Circle one.</b>
  <div class="faces"><span>😀</span><span>🤩</span><span>😮</span><span>🤔</span><span>😐</span><span>😟</span></div>
  <b>What helped me learn? Tick.</b>
  <div class="grid4 small">${["🖼️ Pictures", "🧑‍🤝‍🧑 Friends", "👩‍🏫 Teacher", "📚 Books", "🙋 Asking questions", "✋ Trying myself", "🎵 Songs", "🔊 Listening"].map((h) => `<div><span class="tick"></span>${h}</div>`).join("")}</div>
  <h3>🌟 Learner profile check</h3>
  <table><tr><th>Attribute</th><th>🌱 Not yet</th><th>🌿 Sometimes</th><th>🌳 Yes, I did!</th></tr>
  ${u.learnerProfile.map((a) => `<tr><td>${(lp[a] || {}).emoji || "⭐"} <b>${esc(a)}</b>: ${esc((lp[a] || {}).kid || "")}</td><td></td><td></td><td></td></tr>`).join("")}</table>
  <div style="margin-top:2mm"><b>I showed this when I…</b></div>${lines(2)}
</section>`;
}

function exitCard(u, salt) {
  const checks = pick(u.checks, 3, salt);
  return `<div class="cut">
  <b>🎟️ Exit Card · ${esc(u.theme)}</b> <span class="small">Name: ____________ Date: ________</span>
  <div class="grid3 small" style="margin-top:1.5mm">
    <div><b>3</b> things I learned${lines(3)}</div><div><b>2</b> things I found interesting${lines(2)}</div><div><b>1</b> question I still have${lines(2)}</div>
  </div>
  ${checks.map((c, i) => `<div class="small"><b>${i + 1}. ${c.emoji} ${esc(c.q)}</b> ${pick(c.options, c.options.length, salt + i).map((o) => `<span class="tick"></span>${esc(o)} &nbsp;`).join("")}</div>`).join("")}
  <div class="small" style="margin-top:1mm"><b>How sure do I feel?</b> 😟 I need help · 🙂 Getting there · 😀 I know it · 🤩 I can teach a friend</div>
</div>`;
}

function exitPage(u) {
  return `<section class="page">
  <h3><span class="stage">6</span>🎟️ Exit Cards: cut out and hand in (three versions)</h3>
  ${exitCard(u, 11)}${exitCard(u, 23)}${exitCard(u, 37)}
</section>`;
}

module.exports = function unitHtml(u, yr, lp) {
  return overviewPage(u, yr) + wonderAndFindingPage(u) + findingPage2(u, yr) + sortingActionPage(u) + reflectionPage(u, lp) + exitPage(u);
};
module.exports.esc = esc;
