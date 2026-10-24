/* Year 1 Workbook: Reflection and Exit Card stages. */
import { useState } from "../../grok";
import { WB_FEELINGS, WB_HELPERS, WB_CONFIDENCE, WB_LEARNER_PROFILE } from "../../data/year1Workbook";
import type { WbCheck, WbWord, WbTrueFalse } from "../../data/year1Workbook";
import { wbSpeak, wbSfx, useWbTheme } from "./wbEnv";
import { wbPick, wbShuffle, useWbBtn, useWbCard } from "./wbCore";
import type { WbExitResult } from "./wbCore";
import { WbPrompt, WbHeading, WbAnswer, WbChoices, WbSpeak } from "./WbParts";
import type { WbStageProps } from "./WbParts";

const split = (s: string | undefined): string[] => (s || "").split("|").filter((x: string) => x);

export function WbReflection({ unit, resp, setResp }: WbStageProps) {
  const t = useWbTheme();
  const card = useWbCard();
  const btn = useWbBtn();
  const helpers = split(resp["ref:helped"]);
  return (
    <div data-testid="wb-stage-reflection" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={card()}>
        <WbHeading emoji="🔄" text="I used to think… Now I think…" />
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", fontSize: 20, color: t.text.secondary }}>
          <WbSpeak text={unit.usedToThink} /> Example: {unit.usedToThink}
        </div>
        <WbPrompt text="I used to think…" emoji="⬅️" />
        <WbAnswer id="ref:used" resp={resp} setResp={setResp} placeholder="I used to think…" />
        <WbPrompt text="Now I think…" emoji="➡️" />
        <WbAnswer id="ref:now" resp={resp} setResp={setResp} placeholder="Now I think…" />
      </div>
      <div style={card()}>
        <WbPrompt text="How do you feel about this unit?" emoji="💛" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {WB_FEELINGS.map((f: { emoji: string; label: string }) => {
            const on = resp["ref:feeling"] === f.label;
            return (
              <button key={f.label} data-testid={`wb-feeling-${f.label}`} onClick={() => { setResp("ref:feeling", f.label); wbSpeak(f.label); }} style={btn(on ? t.fill.accent : t.bg.base, on ? t.text.onColor : t.text.primary, { flexDirection: "column", flex: "1 1 110px", minHeight: 110 })}>
                <span style={{ fontSize: 48 }}>{f.emoji}</span>
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div style={card()}>
        <WbPrompt text="What helped me learn? Tap all that helped." emoji="🧰" />
        <WbChoices
          options={WB_HELPERS.map((h: { emoji: string; label: string }) => `${h.emoji} ${h.label}`)}
          selected={helpers}
          onPick={(o: string) => setResp("ref:helped", (helpers.indexOf(o) >= 0 ? helpers.filter((x: string) => x !== o) : [...helpers, o]).join("|"))}
        />
      </div>
      <div style={card()}>
        <WbHeading emoji="🌟" text="Learner profile check" />
        {unit.learnerProfile.map((lp: string) => {
          const info = WB_LEARNER_PROFILE[lp] || { emoji: "⭐", kid: lp };
          const key = `ref:lp:${lp}`;
          return (
            <div key={lp} style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 8, borderBottom: `1px solid ${t.border.subtle}` }}>
              <WbPrompt text={`${lp}: ${info.kid}`} emoji={info.emoji} />
              <WbChoices options={["🌱 Not yet", "🌿 Sometimes", "🌳 Yes, I did!"]} selected={resp[key] ? [resp[key]] : []} onPick={(o: string) => setResp(key, o)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WbExitCard({ unit, seed, resp, setResp, exits, onSaveExit }: WbStageProps & { exits: WbExitResult[]; onSaveExit: (r: WbExitResult) => void }) {
  const t = useWbTheme();
  const card = useWbCard();
  const btn = useWbBtn();
  const [saved, setSaved] = useState<WbExitResult | null>(null);
  const wordOpts = wbPick(unit.words, 8, seed, 41).map((w: WbWord) => `${w.emoji} ${w.word}`);
  const facts = wbPick(
    [...unit.trueFalse.filter((f: WbTrueFalse) => f.answer).map((f: WbTrueFalse) => `${f.emoji} ${f.text}`), ...unit.words.map((w: WbWord) => `${w.emoji} ${w.sentence}`)],
    6,
    seed,
    42
  );
  const qOpts = wbPick(unit.wonderQuestions, 4, seed, 43);
  const checks = wbPick(unit.checks, 3, seed, 44);
  const words = split(resp["exit:words"]);
  const interesting = split(resp["exit:interesting"]);
  const limitPick = (key: string, cur: string[], o: string, max: number) => {
    const next = cur.indexOf(o) >= 0 ? cur.filter((x: string) => x !== o) : [...cur, o].slice(-max);
    setResp(key, next.join("|"));
    wbSpeak(o.replace(/^\S+\s/, ""));
  };
  const save = () => {
    const conf = Number(resp["exit:conf"] || 0);
    const answered = checks.filter((_: WbCheck, i: number) => !!resp[`exit:c${i}`]).length;
    if (!conf || answered < checks.length) {
      wbSfx.oops();
      wbSpeak("Answer the questions and pick a face first.");
      return;
    }
    const score = checks.filter((c: WbCheck, i: number) => resp[`exit:c${i}`] === c.answer).length;
    const r: WbExitResult = { date: new Date().toISOString(), words, interesting, question: resp["exit:q"] || "", confidence: conf, score, total: checks.length };
    onSaveExit(r);
    setSaved(r);
    wbSfx.win();
    wbSpeak(`Exit card saved! You got ${score} out of ${checks.length}.`);
  };
  return (
    <div data-testid="wb-stage-exit" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={card({ border: `3px dashed ${t.text.primary}` })}>
        <WbHeading emoji="🎟️" text={`Exit Card: ${unit.theme}`} />
        <WbPrompt text="3 new words I learned. Tap 3." emoji="3️⃣" />
        <WbChoices options={wordOpts} selected={words} onPick={(o: string) => limitPick("exit:words", words, o, 3)} testPrefix="wb-exit-word" />
        <WbPrompt text="2 things I found interesting. Tap 2." emoji="2️⃣" />
        <WbChoices options={facts} selected={interesting} onPick={(o: string) => limitPick("exit:interesting", interesting, o, 2)} testPrefix="wb-exit-fact" />
        <WbPrompt text="1 question I still have." emoji="1️⃣" />
        <WbChoices options={qOpts} selected={resp["exit:q"] ? [resp["exit:q"]] : []} onPick={(o: string) => setResp("exit:q", o)} />
        <WbAnswer id="exit:q" resp={resp} setResp={setResp} placeholder="Or type my own question…" />
      </div>
      <div style={card()}>
        <WbHeading emoji="✅" text="Check my understanding" />
        {checks.map((c: WbCheck, i: number) => {
          const key = `exit:c${i}`;
          const options = wbShuffle(c.options, seed + i, 45);
          return (
            <div key={c.q} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <WbPrompt text={`${i + 1}. ${c.q}`} emoji={c.emoji} />
              <WbChoices options={options} selected={resp[key] ? [resp[key]] : []} onPick={(o: string) => setResp(key, o)} correct={saved ? c.answer : undefined} testPrefix={`wb-exit-check-${i}`} />
            </div>
          );
        })}
      </div>
      <div style={card()}>
        <WbPrompt text="How sure do I feel?" emoji="📊" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {WB_CONFIDENCE.map((c: { emoji: string; label: string; value: number }) => {
            const on = resp["exit:conf"] === String(c.value);
            return (
              <button key={c.value} data-testid={`wb-exit-conf-${c.value}`} onClick={() => { setResp("exit:conf", String(c.value)); wbSpeak(c.label); }} style={btn(on ? t.fill.accent : t.bg.base, on ? t.text.onColor : t.text.primary, { flexDirection: "column", flex: "1 1 130px", minHeight: 120 })}>
                <span style={{ fontSize: 52 }}>{c.emoji}</span>
                <span style={{ fontSize: 19 }}>{c.label}</span>
              </button>
            );
          })}
        </div>
        <button data-testid="wb-exit-save" className="wb-noprint" onClick={save} style={btn(t.text.success, t.text.onColor, { fontSize: 26 })}>
          💾 Save my exit card
        </button>
        {saved && (
          <div data-testid="wb-exit-saved" style={{ fontSize: 24, fontWeight: 800, color: t.text.success }}>
            🎉 Saved! {saved.score} / {saved.total} correct. {WB_CONFIDENCE[saved.confidence - 1]?.emoji}
          </div>
        )}
        {exits.length > 0 && (
          <div style={{ fontSize: 19, color: t.text.secondary }}>
            Saved exit cards for this theme: {exits.length}. Last: {exits[exits.length - 1].score}/{exits[exits.length - 1].total}
          </div>
        )}
      </div>
    </div>
  );
}
