/* Environment adapter for the Year 1 Workbook (project build).
 * The canvas build swaps this file for a canvas-only version. */
import { useGrokTheme } from "../../grok";
import type { CSSProperties } from "../../grok";
import { speak, sfx } from "../../lib/soundAndStorage";

export function wbSpeak(text: string | string[]): void {
  speak(text);
}

export const wbSfx = {
  tap: (): void => sfx.tap(),
  good: (): void => sfx.correct(),
  oops: (): void => sfx.wrong(),
  win: (): void => sfx.fanfare(),
};

export function useWbTheme() {
  return useGrokTheme();
}
export type WbStyle = CSSProperties;
