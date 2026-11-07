export { useState, useEffect, useMemo, useRef, useCallback } from "react";
export type { CSSProperties, ReactNode, ChangeEvent, PointerEvent, KeyboardEvent } from "react";

const THEME = {
  kind: "light" as const,
  bg: { base: "#FFFDF7", subtle: "#F5F3EC", elevated: "#FFFFFF" },
  text: {
    primary: "#1E293B",
    secondary: "#475569",
    tertiary: "#64748B",
    onColor: "#FFFFFF",
    onPrimary: "#FFFFFF",
    accent: "#2563EB",
    success: "#16A34A",
    warning: "#EA580C",
    danger: "#DC2626",
  },
  fill: { primary: "#1E293B", secondary: "#ECEAE3", accent: "#2563EB" },
  border: { subtle: "#E7E5E0", default: "#D6D3CC" },
  font: {
    family:
      'ui-rounded, "SF Pro Rounded", "Nunito", "Fredoka", "Segoe UI", system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"',
  },
  chart: ["#2563EB", "#D97706", "#0891B2", "#DB2777"],
  dataviz: { categorical: ["#7C3AED", "#059669", "#EA580C"] },
};

export function useGrokTheme() {
  return THEME;
}
