/* Year 1 Workbook: Unit Overview and Tuning In stages. */
import { WB_WONDER_STARTERS } from "../../data/year1Workbook";
import { wbSfx, useWbTheme } from "./wbEnv";
import { wbPick, useWbBtn, useWbCard, useWbPal } from "./wbCore";
import { WbSpeak, WbPrompt, WbHeading, WbAnswer, WbChoices } from "./WbParts";
import type { WbStageProps } from "./WbParts";

function Chips({ items, color }: { items: string[]; color: string }) {
  const t = useWbTheme();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map((s: string) => (
        <span key={s} style={{ padding: "8px 14px", borderRadius: 999, border: `2px solid ${color}`, fontSize: 20, fontWeight: 700, color: t.text.primary }}>
          {s}
        </span>
      ))}
    </div>
  );
}

export function WbOverview({ unit }: WbStageProps) {
  const t = useWbTheme();
  const card = useWbCard();
  const pal = useWbPal();
  return (
    <div data-testid="wb-stage-overview" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={card()}>
        <div style={{ fontSize: 20, color: t.text.secondary, fontWeight: 700 }}>
          Theme {unit.number}: {unit.theme}
        </div>
        <WbHeading emoji={unit.emoji} text={unit.unitTitle} />
        <WbPrompt text={unit.kidIdea} emoji="💡" big />
        <div style={{ fontSize: 20, color: t.text.secondary }}>
          <b>Central idea (teacher):</b> {unit.centralIdea}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        <div style={card()}>
          <WbHeading emoji="🧭" text="Lines of inquiry" />
          {unit.lines.map((l: string, i: number) => (
            <div key={l} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 21 }}>
              <WbSpeak text={l} />
              <span>
                {i + 1}. {l}
              </span>
            </div>
          ))}
        </div>
        <div style={card()}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>🔑 Key concepts</div>
          <Chips items={unit.keyConcepts} color={pal[0]} />
          <div style={{ fontSize: 22, fontWeight: 800 }}>🔗 Related concepts</div>
          <Chips items={unit.relatedConcepts} color={pal[1 % pal.length]} />
          <div style={{ fontSize: 22, fontWeight: 800 }}>🌟 Learner profile</div>
          <Chips items={unit.learnerProfile} color={pal[2 % pal.length]} />
          <div style={{ fontSize: 22, fontWeight: 800 }}>🛠️ Approaches to learning</div>
          <Chips items={unit.atl} color={pal[3 % pal.length]} />
        </div>
      </div>
    </div>
  );
}

export function WbTuningIn({ unit, seed, resp, setResp }: WbStageProps) {
  const t = useWbTheme();
  const card = useWbCard();
  const btn = useWbBtn();
  const pv = unit.provocation;
  const stw = unit.seeThinkWonder;
  const questions = wbPick(unit.wonderQuestions, 7, seed, 1);
  const starters = wbPick(WB_WONDER_STARTERS, 4, seed, 2);
  const liked = (resp["tune:liked"] || "").split("|").filter((s: string) => s);

  const toggle = (q: string) => {
    const next = liked.indexOf(q) >= 0 ? liked.filter((x: string) => x !== q) : [...liked, q];
    setResp("tune:liked", next.join("|"));
  };

  return (
    <div data-testid="wb-stage-tuning" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={card()}>
        <WbHeading emoji="🎬" text={`Provocation: ${pv.title}`} />
        <div style={{ fontSize: 64, textAlign: "center", letterSpacing: 6 }}>{pv.scene}</div>
        <WbPrompt text={pv.description} />
        <div style={{ padding: 12, borderRadius: 14, background: t.bg.subtle, fontSize: 20 }}>
          👩‍🏫 <b>Teacher prompt:</b> {pv.teacherPrompt}
        </div>
      </div>

      <div style={card()}>
        <WbHeading emoji="👀" text="See – Think – Wonder" />
        <div style={{ fontSize: 56, textAlign: "center" }}>{stw.scene}</div>
        <WbPrompt text={stw.see} emoji="👀" />
        <WbAnswer id="tune:see" resp={resp} setResp={setResp} placeholder="I see…" />
        <WbPrompt text={stw.think} emoji="💭" />
        <WbAnswer id="tune:think" resp={resp} setResp={setResp} placeholder="I think…" />
        <WbPrompt text={stw.wonder} emoji="🤔" />
        <WbAnswer id="tune:wonder" resp={resp} setResp={setResp} placeholder="I wonder…" />
      </div>

      <div style={card()}>
        <WbHeading emoji="❓" text="Curiosity questions" />
        <div style={{ fontSize: 20, color: t.text.secondary }}>Tap ⭐ if you wonder this too.</div>
        {questions.map((q: string, i: number) => {
          const on = liked.indexOf(q) >= 0;
          return (
            <div key={q} data-testid={`wb-wonder-q-${i}`} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <WbSpeak text={q} />
              <span style={{ flex: "1 1 220px", fontSize: 23, fontWeight: 600 }}>{q}</span>
              <button
                onClick={() => {
                  wbSfx.tap();
                  toggle(q);
                }}
                style={btn(on ? t.text.warning : t.bg.base, on ? t.text.onColor : t.text.primary)}
              >
                {on ? "⭐ Me too!" : "☆"}
              </button>
            </div>
          );
        })}
      </div>

      <div style={card()}>
        <WbHeading emoji="💬" text="My own I wonder question" />
        <div style={{ fontSize: 20, color: t.text.secondary }}>Pick a starter. Then finish it.</div>
        <WbChoices options={starters} selected={resp["tune:starter"] ? [resp["tune:starter"]] : []} onPick={(o: string) => setResp("tune:starter", o)} />
        <WbAnswer id="tune:myq" resp={resp} setResp={setResp} placeholder={resp["tune:starter"] || "I wonder…"} />
      </div>
    </div>
  );
}
