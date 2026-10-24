/* Year 1 Workbook — Finding Out activities (part B): true/false, sequencing, counting, draw & label. */
import { useState } from "../../grok";
import type { WbTrueFalse } from "../../data/year1Workbook";
import { wbSpeak, wbSfx, useWbTheme } from "./wbEnv";
import { wbPick, wbShuffle, useWbBtn, useWbCard } from "./wbCore";
import { WbPrompt, WbSpeak, WbDrawPad, WbAnswer } from "./WbParts";
import type { WbStageProps } from "./WbParts";
import { WbDone } from "./WbActivitiesA";

export function WbTrueFalseAct({ unit, seed, setResp }: WbStageProps) {
  const t = useWbTheme();
  const btn = useWbBtn();
  const card = useWbCard();
  const items = wbPick(unit.trueFalse, 6, seed, 21);
  const [i, setI] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [msg, setMsg] = useState<string>("");
  if (i >= items.length) return <WbDone text={`True or false: ${score} out of ${items.length}!`} />;
  const cur: WbTrueFalse = items[i];
  const choose = (v: boolean) => {
    const ok = v === cur.answer;
    if (ok) wbSfx.good();
    else wbSfx.oops();
    const ns = ok ? score + 1 : score;
    setScore(ns);
    setMsg(ok ? "✅ Yes! Well done." : `💡 It is ${cur.answer ? "true" : "false"}.`);
    wbSpeak(ok ? "Well done!" : `It is ${cur.answer ? "true" : "false"}.`);
    setResp("find:tf", `${ns}/${items.length}`);
    window.setTimeout(() => {
      setMsg("");
      setI(i + 1);
    }, 900);
  };
  return (
    <div data-testid="wb-act-tf" style={card()}>
      <div style={{ fontSize: 20, color: t.text.secondary }}>Statement {i + 1} of {items.length}</div>
      <WbPrompt text={cur.text} emoji={cur.emoji} big />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <button data-testid="wb-tf-true" disabled={!!msg} onClick={() => choose(true)} style={btn(t.text.success, t.text.onColor, { flex: "1 1 160px", fontSize: 26 })}>
          👍 True
        </button>
        <button data-testid="wb-tf-false" disabled={!!msg} onClick={() => choose(false)} style={btn(t.text.warning, t.text.onColor, { flex: "1 1 160px", fontSize: 26 })}>
          👎 False
        </button>
      </div>
      {msg && <div style={{ fontSize: 24, fontWeight: 800 }}>{msg}</div>}
    </div>
  );
}

export function WbSequenceAct({ unit, seed, setResp }: WbStageProps) {
  const t = useWbTheme();
  const btn = useWbBtn();
  const card = useWbCard();
  const seq = unit.sequences[seed % unit.sequences.length];
  const cards = wbShuffle(seq.steps, seed, 22);
  const [order, setOrder] = useState<string[]>([]);
  const [oops, setOops] = useState<string>("");
  const done = order.length === seq.steps.length;
  const tap = (text: string) => {
    if (order.indexOf(text) >= 0) return;
    if (seq.steps[order.length].text === text) {
      wbSfx.good();
      const next = [...order, text];
      setOrder(next);
      setOops("");
      if (next.length === seq.steps.length) setResp("find:seq", `${seq.title}: done`);
    } else {
      wbSfx.oops();
      setOops(text);
      wbSpeak("What comes first?");
    }
  };
  return (
    <div data-testid="wb-act-seq" style={card()}>
      <WbPrompt text={`Put in order: ${seq.title}. What comes first?`} emoji="🔢" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {cards.map((s: { text: string; emoji: string }) => {
          const pos = order.indexOf(s.text);
          return (
            <button
              key={s.text}
              onClick={() => tap(s.text)}
              style={btn(pos >= 0 ? t.text.success : oops === s.text ? t.text.warning : t.bg.base, pos >= 0 || oops === s.text ? t.text.onColor : t.text.primary, { flex: "1 1 150px", flexDirection: "column", minHeight: 120 })}
            >
              <span style={{ fontSize: 48 }}>{s.emoji}</span>
              <span>{pos >= 0 ? `${pos + 1}. ` : ""}{s.text}</span>
            </button>
          );
        })}
      </div>
      {done && <WbDone text="Perfect order!" />}
    </div>
  );
}

export function WbCountAct({ unit, seed, setResp }: WbStageProps) {
  const t = useWbTheme();
  const btn = useWbBtn();
  const card = useWbCard();
  const items = wbPick(unit.counts, 4, seed, 23);
  const [i, setI] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [wrong, setWrong] = useState<number>(-1);
  if (i >= items.length) return <WbDone text={`Super counting! ${score} out of ${items.length}.`} />;
  const c = items[i];
  const opts = wbShuffle([c.n, c.n + 1, Math.max(1, c.n - 1) === c.n ? c.n + 2 : c.n - 1], seed + i, 24);
  return (
    <div data-testid="wb-act-count" style={card()}>
      <WbPrompt text={c.q} emoji="🔎" big />
      <div style={{ fontSize: 52, letterSpacing: 8, textAlign: "center", padding: 10, borderRadius: 16, background: t.bg.subtle }}>
        {Array.from({ length: c.n }).map((_: unknown, k: number) => (
          <span key={k}>{c.emoji}</span>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {opts.map((n: number) => (
          <button
            key={n}
            onClick={() => {
              if (n === c.n) {
                wbSfx.good();
                wbSpeak(`${n}! Yes!`);
                const ns = wrong >= 0 ? score : score + 1;
                setScore(ns);
                setResp("find:count", `${ns}/${items.length}`);
                setWrong(-1);
                setI(i + 1);
              } else {
                wbSfx.oops();
                setWrong(n);
                wbSpeak("Count again, slowly.");
              }
            }}
            style={btn(wrong === n ? t.text.warning : t.bg.base, wrong === n ? t.text.onColor : t.text.primary, { flex: "1 1 120px", fontSize: 40, minHeight: 90 })}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function WbDrawLabelAct({ unit, resp, setResp }: WbStageProps) {
  const t = useWbTheme();
  const btn = useWbBtn();
  const card = useWbCard();
  const chosen = (resp["find:labels"] || "").split("|").filter((s: string) => s);
  const toggle = (w: string) => {
    const next = chosen.indexOf(w) >= 0 ? chosen.filter((x: string) => x !== w) : [...chosen, w];
    setResp("find:labels", next.join("|"));
    wbSpeak(w);
  };
  return (
    <div data-testid="wb-act-draw" style={card()}>
      <WbPrompt text={unit.drawLabel.prompt} emoji="🖍️" />
      <WbDrawPad id="find:draw" resp={resp} setResp={setResp} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <WbSpeak text={unit.drawLabel.labels.join(", ")} />
        {unit.drawLabel.labels.map((w: string) => (
          <button key={w} onClick={() => toggle(w)} style={btn(chosen.indexOf(w) >= 0 ? t.fill.accent : t.bg.base, chosen.indexOf(w) >= 0 ? t.text.onColor : t.text.primary)}>
            {chosen.indexOf(w) >= 0 ? "🏷️ " : ""}{w}
          </button>
        ))}
      </div>
      {chosen.length > 0 && <div style={{ fontSize: 22 }}>My labels: <b>{chosen.join(", ")}</b></div>}
    </div>
  );
}

export function WbThinkAct({ unit, seed, resp, setResp }: WbStageProps) {
  const card = useWbCard();
  const prompts = wbPick(unit.thinkPrompts || [], 3, seed, 25);
  return (
    <div data-testid="wb-act-think" style={card()}>
      <WbPrompt text="Think and write. Explain your ideas in full sentences." emoji="✍️" />
      {prompts.map((p: string, i: number) => (
        <div key={p} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <WbPrompt text={`${i + 1}. ${p}`} emoji="💭" />
          <WbAnswer id={`find:think:${p.slice(0, 24)}`} resp={resp} setResp={setResp} placeholder="I think… because…" />
        </div>
      ))}
    </div>
  );
}
