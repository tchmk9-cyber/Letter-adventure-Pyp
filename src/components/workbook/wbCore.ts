/* Shared helpers for the Year 1 Workbook: seeded shuffles, styles and storage. */
import { useWbTheme } from "./wbEnv";
import type { WbStyle } from "./wbEnv";

export function wbRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function wbShuffle<T>(arr: T[], seed: number, salt: number): T[] {
  const r = wbRng(seed * 7919 + salt * 104729 + 13);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

export function wbPick<T>(arr: T[], n: number, seed: number, salt: number): T[] {
  return wbShuffle(arr, seed, salt).slice(0, n);
}

export function useWbPal(): string[] {
  const t = useWbTheme();
  const out: string[] = [];
  [...t.chart, ...t.dataviz.categorical].forEach((c: string) => {
    if (out.indexOf(c) < 0) out.push(c);
  });
  return out;
}

export function useWbBtn() {
  const t = useWbTheme();
  return (bg: string, fg: string, extra?: WbStyle): WbStyle => ({
    background: bg,
    color: fg,
    border: `2px solid ${t.border.default}`,
    borderRadius: 16,
    padding: "12px 18px",
    fontSize: 22,
    fontWeight: 700,
    minHeight: 56,
    minWidth: 56,
    cursor: "pointer",
    fontFamily: t.font.family,
    touchAction: "manipulation",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxSizing: "border-box",
    ...(extra || {}),
  });
}

export function useWbCard() {
  const t = useWbTheme();
  return (extra?: WbStyle): WbStyle => ({
    background: t.bg.elevated,
    border: `2px solid ${t.border.default}`,
    borderRadius: 20,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    fontSize: 22,
    ...(extra || {}),
  });
}

/* ---------------- Storage (per student profile, per theme) ---------------- */
export interface WbExitResult {
  date: string;
  words: string[];
  interesting: string[];
  question: string;
  confidence: number;
  score: number;
  total: number;
}

export interface WbThemeRecord {
  responses: Record<string, string>;
  exits: WbExitResult[];
}

type WbDb = Record<string, Record<string, WbThemeRecord>>;
const WB_KEY = "la-pyp-y1-workbook-v1";
let wbMemory: WbDb | null = null;

export function wbLoadDb(): WbDb {
  if (wbMemory) return wbMemory;
  let db: WbDb = {};
  try {
    const raw = window.localStorage.getItem(WB_KEY);
    if (raw) db = JSON.parse(raw) as WbDb;
  } catch {
    db = {};
  }
  wbMemory = db;
  return db;
}

function wbPersist(db: WbDb): void {
  wbMemory = db;
  try {
    window.localStorage.setItem(WB_KEY, JSON.stringify(db));
  } catch {
    // storage may be full or blocked; keep the in-memory copy
  }
}

export function wbGetRecord(profileId: string, themeId: string): WbThemeRecord {
  const db = wbLoadDb();
  const rec = db[profileId]?.[themeId];
  return rec ? rec : { responses: {}, exits: [] };
}

export function wbSaveRecord(profileId: string, themeId: string, rec: WbThemeRecord): void {
  const db = { ...wbLoadDb() };
  db[profileId] = { ...(db[profileId] || {}), [themeId]: rec };
  wbPersist(db);
}
