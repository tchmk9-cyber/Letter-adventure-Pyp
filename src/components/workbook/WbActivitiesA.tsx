/* Year 1 Workbook — Finding Out activities (part A): picture words, listen & choose, sort. */
import { useState } from "../../grok";
import type { WbWord, WbSortItem } from "../../data/year1Workbook";
import { wbSpeak, wbSfx, useWbTheme } from "./wbEnv";
import { wbPick, wbShuffle, useWbBtn, useWbCard } from "./wbCore";
import { WbPrompt, WbSpeak } from "./WbParts";
import type { WbStageProps } from "./WbParts";

export function WbDone({ text }: { text: string }) {
  const t = useWbTheme();
  return (
    <div data-testid="wb-activity-done" style={{ padding: 14, borderRadius: 16, border: `3px solid ${t.text.success}`, fontSize: 24, fontWeight: 800, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <WbSpeak text={text} />
      🎉 {text}
    </div>
  );
}

export function WbPictureWords({ unit, seed }: WbStageProps) {
  const t = useWbTheme();
  const words = wbPick(unit.words, 8, seed, 11);
  return (
    <div data-testid="wb-act-words" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <WbPrompt text="Tap a picture. Listen and say the word." emoji="🖼️" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
        {words.map((w: WbWord) => (
          <button
            key={w.word}
            onClick={() => {
              wbSfx.tap();
              wbSpeak([w.word, w.sentence]);
            }}
            style={{ minHeight: 150, borderRadius: 18, border: `2px solid ${t.border.default}`, background: t.bg.base, color: t.text.primary, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: t.font.family, touchAction: "manipulation" }}
          >
            <span style={{ fontSize: 56 }}>{w.emoji}</span>
            <span style={{ fontSize: 26, fontWeight: 800 }}>{w.word}</span>
            <span style={{ fontSize: 17, color: t.text.secondary }}>{w.sentence}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function WbListenChoose({ unit, seed, setResp }: WbStageProps) {
  const t = useWbTheme();
  const btn = useWbBtn();
  const card = useWbCard();
  const rounds = wbPick(unit.words, 6, seed, 12);
  const [i, setI] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [wrong, setWrong] = useState<string>("");
  if (i >= rounds.length) return <WbDone text={`Great listening! ${score} out of ${rounds.length}.`} />;
  const target = rounds[i];
  const others = wbPick(unit.words.filter((w: WbWord) => w.word !== target.word), 2, seed + i, 13);
  const opts = wbShuffle([target, ...others], seed + i, 14);
  return (
    <div data-testid="wb-act-listen" style={card()}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button data-testid="wb-listen-play" onClick={() => wbSpeak(["Find", target.word])} style={btn(t.fill.accent, t.text.onColor, { fontSize: 24 })}>
          🔊 Listen
        </button>
        <span style={{ fontSize: 23, fontWeight: 700 }}>Listen. Tap the right picture. ({i + 1}/{rounds.length})</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {opts.map((w: WbWord) => (
          <button
            key={w.word}
            onClick={() => {
              if (w.word === target.word) {
                wbSfx.good();
                const ns = wrong ? score : score + 1;
                setScore(ns);
                setWrong("");
                setI(i + 1);
                setResp("find:listen", `${ns}/${rounds.length}`);
              } else {
                wbSfx.oops();
                setWrong(w.word);
                wbSpeak("Try again!");
              }
            }}
            style={btn(wrong === w.word ? t.text.warning : t.bg.base, wrong === w.word ? t.text.onColor : t.text.primary, { flex: "1 1 160px", minHeight: 120, fontSize: 64 })}
          >
            {w.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

export function WbSort({ unit, seed, setResp }: WbStageProps) {
  const t = useWbTheme();
  const btn = useWbBtn();
  const card = useWbCard();
  const items = wbPick(unit.sort.items, 8, seed, 15);
  const [i, setI] = useState<number>(0);
  const [placed, setPlaced] = useState<WbSortItem[][]>([[], []]);
  const [oops, setOops] = useState<boolean>(false);
  const cur = items[i];
  const pick = (b: number) => {
    if (!cur) return;
    if (cur.bucket === b) {
      wbSfx.good();
      const next = placed.map((col: WbSortItem[], k: number) => (k === b ? [...col, cur] : col));
      setPlaced(next);
      setI(i + 1);
      setOops(false);
      setResp("find:sort", `${i + 1}/${items.length}`);
    } else {
      wbSfx.oops();
      setOops(true);
      wbSpeak("Think again!");
    }
  };
  return (
    <div data-testid="wb-act-sort" style={card()}>
      <WbPrompt text={unit.sort.prompt} emoji="🧺" />
      {cur ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 30, fontWeight: 800, padding: 12, borderRadius: 16, background: t.bg.subtle }}>
          <WbSpeak text={cur.label} />
          <span style={{ fontSize: 64 }}>{cur.emoji}</span> {cur.label}
          {oops && <span style={{ color: t.text.warning, fontSize: 22 }}>🔁 Try the other side</span>}
        </div>
      ) : (
        <WbDone text="You sorted them all!" />
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {unit.sort.buckets.map((b: string, k: number) => (
          <div key={b} style={{ border: `3px dashed ${t.border.default}`, borderRadius: 18, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            <button data-testid={`wb-sort-bucket-${k}`} onClick={() => pick(k)} style={btn(t.fill.primary, t.text.onPrimary, { fontSize: 24 })}>
              {b}
            </button>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: 36, minHeight: 48 }}>
              {placed[k].map((p: WbSortItem) => (
                <span key={p.label} title={p.label}>{p.emoji}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
