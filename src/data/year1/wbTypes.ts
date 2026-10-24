/* Year 1 PYP Workbook — shared types (aligned with the IB PYP framework; not official IB material). */

export type WbThemeId =
  | "who-we-are"
  | "where-we-are"
  | "express-ourselves"
  | "world-works"
  | "organize-ourselves"
  | "sharing-planet";

export type WbStageId = "overview" | "tuning" | "finding" | "sorting" | "action" | "reflection" | "exit";

export interface WbWord {
  word: string;
  emoji: string;
  sentence: string;
}

export interface WbCheck {
  q: string;
  emoji: string;
  options: string[];
  answer: string;
}

export interface WbTrueFalse {
  text: string;
  emoji: string;
  answer: boolean;
}

export interface WbSortItem {
  label: string;
  emoji: string;
  bucket: number;
}

export interface WbSequence {
  title: string;
  steps: { text: string; emoji: string }[];
}

export interface WbCount {
  emoji: string;
  n: number;
  q: string;
}

export interface WbOrganiser {
  title: string;
  prompt: string;
  columns: { label: string; emoji: string }[];
  items: { label: string; emoji: string; col: number }[];
}

export interface WbUnit {
  id: WbThemeId;
  number: number;
  theme: string;
  emoji: string;
  unitTitle: string;
  centralIdea: string;
  kidIdea: string;
  lines: string[];
  keyConcepts: string[];
  relatedConcepts: string[];
  learnerProfile: string[];
  atl: string[];
  provocation: { scene: string; title: string; description: string; teacherPrompt: string };
  seeThinkWonder: { scene: string; see: string; think: string; wonder: string };
  wonderQuestions: string[];
  words: WbWord[];
  sort: { prompt: string; buckets: [string, string]; items: WbSortItem[] };
  trueFalse: WbTrueFalse[];
  sequences: WbSequence[];
  counts: WbCount[];
  drawLabel: { prompt: string; labels: string[] };
  organiser: WbOrganiser;
  action: { title: string; ideas: { text: string; emoji: string }[]; homeLink: string };
  usedToThink: string;
  checks: WbCheck[];
  teacherNotes: string[];
  /** Written / spoken thinking tasks (explain, compare, cause and effect, perspectives). Used from Year 2 up. */
  thinkPrompts?: string[];
}

export type WbYearId = "y1" | "y2" | "y3" | "y4";

export interface WbYear {
  id: WbYearId;
  label: string;
  ages: string;
  focus: string;
  units: WbUnit[];
}

export const WB_STAGES: { id: WbStageId; label: string; emoji: string; kid: string }[] = [
  { id: "overview", label: "Unit Overview", emoji: "🗺️", kid: "Our big idea" },
  { id: "tuning", label: "Tuning In", emoji: "👀", kid: "Look and wonder" },
  { id: "finding", label: "Finding Out", emoji: "🔍", kid: "Find out" },
  { id: "sorting", label: "Sorting Out", emoji: "🧩", kid: "Sort our ideas" },
  { id: "action", label: "Taking Action", emoji: "🤝", kid: "Help and act" },
  { id: "reflection", label: "Reflection", emoji: "🪞", kid: "Think back" },
  { id: "exit", label: "Exit Card", emoji: "🎟️", kid: "Show what I know" },
];

export const WB_WONDER_STARTERS: string[] = [
  "I wonder why…",
  "I wonder how…",
  "I wonder what…",
  "I wonder who…",
  "What if…?",
  "How do we know…?",
  "I want to find out…",
];

export const WB_FEELINGS: { emoji: string; label: string }[] = [
  { emoji: "😀", label: "Happy" },
  { emoji: "🤩", label: "Excited" },
  { emoji: "😮", label: "Surprised" },
  { emoji: "🤔", label: "Curious" },
  { emoji: "😐", label: "Okay" },
  { emoji: "😟", label: "Worried" },
];

export const WB_HELPERS: { emoji: string; label: string }[] = [
  { emoji: "🖼️", label: "Pictures" },
  { emoji: "🧑‍🤝‍🧑", label: "My friends" },
  { emoji: "👩‍🏫", label: "My teacher" },
  { emoji: "📚", label: "Books" },
  { emoji: "🙋", label: "Asking questions" },
  { emoji: "✋", label: "Trying it myself" },
  { emoji: "🎵", label: "Songs" },
  { emoji: "🔊", label: "Listening" },
];

export const WB_CONFIDENCE: { emoji: string; label: string; value: number }[] = [
  { emoji: "😟", label: "I need help", value: 1 },
  { emoji: "🙂", label: "I am getting there", value: 2 },
  { emoji: "😀", label: "I know it", value: 3 },
  { emoji: "🤩", label: "I can teach a friend", value: 4 },
];

export const WB_LEARNER_PROFILE: Record<string, { emoji: string; kid: string }> = {
  Inquirers: { emoji: "🔍", kid: "I ask questions and find out." },
  Knowledgeable: { emoji: "🧠", kid: "I know new things." },
  Thinkers: { emoji: "💭", kid: "I think hard to solve problems." },
  Communicators: { emoji: "🗣️", kid: "I share my ideas." },
  Principled: { emoji: "⚖️", kid: "I am fair and honest." },
  "Open-minded": { emoji: "👐", kid: "I listen to other ideas." },
  Caring: { emoji: "💛", kid: "I help and care for others." },
  "Risk-takers": { emoji: "🦁", kid: "I try new things." },
  Balanced: { emoji: "🧘", kid: "I rest, play and learn." },
  Reflective: { emoji: "🪞", kid: "I think about my learning." },
};
