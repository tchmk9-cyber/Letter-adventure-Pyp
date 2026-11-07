/* Year 1 Workbook: Finding Out (activity menu), Sorting Out (graphic organiser) and Taking Action. */
import { useState } from "../../grok";
import { wbSpeak, wbSfx, useWbTheme } from "./wbEnv";
import { wbShuffle, useWbBtn, useWbCard } from "./wbCore";
import { WbPrompt, WbHeading, WbAnswer, WbChoices, WbDrawPad, WbSpeak } from "./WbParts";
import type { WbStageProps } from "./WbParts";
import { WbPictureWords, WbListenChoose, WbSort, WbDone } from "./WbActivitiesA";
import { WbTrueFalseAct, WbSequenceAct, WbCountAct, WbDrawLabelAct, WbThinkAct } from "./WbActivitiesB";

const WB_ACTS: { id: string; label: string; emoji: string }[] = [
  { id: "words", label: "Picture Words", emoji: "🖼️" },
  { id: "listen", label: "Listen & Choose", emoji: "👂" },
  { id: "sort", label: "Sort It", emoji: "🧺" },
  { id: "tf", label: "True or False", emoji: "👍" },
  { id: "seq", label: "Put in Order", emoji: "🔢" },
  { id: "count", label: "Count & Observe", emoji: "🔎" },
  { id: "draw", label: "Draw & Label", emoji: "🖍️" },
  { id: "think", label: "Think & Write", emoji: "✍️" },
];

export function WbFindingOut(props: WbStageProps) {
  const t = useWbTheme();
  const btn = useWbBtn();
  const [act, setAct] = useState<string>("words");
  const k = `${props.unit.id}-${props.seed}-${act}`;
  return (
    <div data-testid="wb-stage-finding" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <WbHeading emoji="🔍" text="Finding Out: try every activity!" />
      <div className="wb-noprint" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {WB_ACTS.filter((a: { id: string }) => a.id !== "think" || (props.unit.thinkPrompts || []).length > 0).map((a: { id: string; label: string; emoji: string }) => {
          const score = props.resp[`find:${a.id}`];
          return (
            <button
              key={a.id}
              data-testid={`wb-act-tab-${a.id}`}
              onClick={() => {
                wbSfx.tap();
                setAct(a.id);
                wbSpeak(a.label);
              }}
              style={btn(act === a.id ? t.fill.primary : t.bg.elevated, act === a.id ? t.text.onPrimary : t.text.primary, { flex: "1 1 170px", fontSize: 20 })}
            >
              {a.emoji} {a.label} {score ? "✅" : ""}
            </button>
          );
        })}
      </div>
      <div key={k}>
        {act === "words" && <WbPictureWords {...props} />}
        {act === "listen" && <WbListenChoose {...props} />}
        {act === "sort" && <WbSort {...props} />}
        {act === "tf" && <WbTrueFalseAct {...props} />}
        {act === "seq" && <WbSequenceAct {...props} />}
        {act === "count" && <WbCountAct {...props} />}
        {act === "draw" && <WbDrawLabelAct {...props} />}
        {act === "think" && <WbThinkAct {...props} />}
      </div>
    </div>
  );
}

export function WbSortingOut({ unit, seed, resp, setResp }: WbStageProps) {
  const t = useWbTheme();
  const btn = useWbBtn();
  const card = useWbCard();
  const org = unit.organiser;
  const items = wbShuffle(org.items, seed, 31);
  const [sel, setSel] = useState<number>(-1);
  const [placed, setPlaced] = useState<number[]>([]);
  const [oops, setOops] = useState<boolean>(false);
  const place = (col: number) => {
    if (sel < 0) {
      wbSpeak("First tap a picture.");
      return;
    }
    const it = items[sel];
    if (it.col === col) {
      wbSfx.good();
      const next = [...placed, sel];
      setPlaced(next);
      setResp("sort:organiser", `${next.length}/${items.length}`);
      setSel(-1);
      setOops(false);
    } else {
      wbSfx.oops();
      setOops(true);
      wbSpeak("Hmm, try another box.");
    }
  };
  return (
    <div data-testid="wb-stage-sorting" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={card()}>
        <WbHeading emoji="🧩" text={org.title} />
        <WbPrompt text={org.prompt} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {items.map((it: { label: string; emoji: string; col: number }, i: number) =>
            placed.indexOf(i) >= 0 ? null : (
              <button
                key={it.label}
                data-testid={`wb-org-item-${i}`}
                onClick={() => {
                  setSel(i);
                  wbSpeak(it.label);
                }}
                style={btn(sel === i ? t.fill.accent : t.bg.base, sel === i ? t.text.onColor : t.text.primary, { flex: "1 1 160px" })}
              >
                <span style={{ fontSize: 34 }}>{it.emoji}</span> {it.label}
              </button>
            )
          )}
        </div>
        {oops && <div style={{ color: t.text.warning, fontSize: 22, fontWeight: 700 }}>🔁 Not that box. Try again!</div>}
        {placed.length === items.length && <WbDone text="Your chart is complete!" />}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(170px, 1fr))`, gap: 10 }}>
          {org.columns.map((c: { label: string; emoji: string }, ci: number) => (
            <div key={c.label} style={{ border: `3px solid ${t.border.default}`, borderRadius: 16, padding: 10, display: "flex", flexDirection: "column", gap: 8, minHeight: 160 }}>
              <button data-testid={`wb-org-col-${ci}`} onClick={() => place(ci)} style={btn(t.fill.primary, t.text.onPrimary)}>
                {c.emoji} {c.label}
              </button>
              {placed
                .filter((p: number) => items[p].col === ci)
                .map((p: number) => (
                  <div key={p} style={{ fontSize: 20, fontWeight: 600 }}>
                    {items[p].emoji} {items[p].label}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
      <div style={card()}>
        <WbPrompt text="What is the big idea? Say it in your own words." emoji="💡" />
        <WbAnswer id="sort:bigidea" resp={resp} setResp={setResp} placeholder="I learned that…" />
      </div>
    </div>
  );
}

export function WbAction({ unit, resp, setResp }: WbStageProps) {
  const t = useWbTheme();
  const card = useWbCard();
  const btn = useWbBtn();
  const ideas = unit.action.ideas.map((i: { text: string; emoji: string }) => `${i.emoji} ${i.text}`);
  const done = resp["act:done"] === "yes";
  return (
    <div data-testid="wb-stage-action" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={card()}>
        <WbHeading emoji="🤝" text={`Taking Action: ${unit.action.title}`} />
        <WbPrompt text="Choose one thing you will do." />
        <WbChoices options={ideas} selected={resp["act:choice"] ? [resp["act:choice"]] : []} onPick={(o: string) => { setResp("act:choice", o); wbSpeak(o); }} testPrefix="wb-action-idea" />
        <WbPrompt text="Where will you do it?" emoji="📍" />
        <WbChoices options={["🏠 At home", "🏫 At school", "🌳 In my community"]} selected={resp["act:where"] ? [resp["act:where"]] : []} onPick={(o: string) => setResp("act:where", o)} />
        <WbPrompt text="My plan: I will…" emoji="📝" />
        <WbAnswer id="act:plan" resp={resp} setResp={setResp} placeholder="I will…" />
      </div>
      <WbDrawPad id="act:draw" resp={resp} setResp={setResp} label="Draw yourself taking action." />
      <div style={card()}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", fontSize: 22 }}>
          <WbSpeak text={unit.action.homeLink} />
          🏠 <b>Home link:</b> {unit.action.homeLink}
        </div>
        <button
          data-testid="wb-action-done"
          onClick={() => {
            wbSfx.win();
            setResp("act:done", done ? "" : "yes");
          }}
          style={btn(done ? t.text.success : t.bg.base, done ? t.text.onColor : t.text.primary, { alignSelf: "flex-start" })}
        >
          {done ? "✅ I did it!" : "☐ I did my action"}
        </button>
      </div>
    </div>
  );
}
