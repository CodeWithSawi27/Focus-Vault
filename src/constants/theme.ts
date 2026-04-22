import type { ColorSchemeName } from "react-native";

// ─── Light ────────────────────────────────────────────────────────────────────
export const lightColors = {
  primary: "#111111",
  background: "#F5F5F5",
  surface: "rgba(255, 255, 255, 0.7)",
  surfaceStrong: "rgba(255, 255, 255, 0.95)",
  border: "rgba(0, 0, 0, 0.08)",
  text: {
    primary: "#0A0A0A",
    secondary: "#6B6B6B",
    tertiary: "#ABABAB",
    inverse: "#FFFFFF",
  },
  accent: {
    green: "#25671E",
    greenMuted: "rgba(37, 103, 30, 0.12)",
    sage: "#869D7A",
    sageMuted: "rgba(134, 157, 122, 0.12)",
    red: "#CC2B2B",
    redMuted: "rgba(204, 43, 43, 0.1)",
    blue: "#1A56DB",
    blueMuted: "rgba(26, 86, 219, 0.1)",
    orange: "#B45309",
    orangeMuted: "rgba(180, 83, 9, 0.1)",
  },
  glass: {
    background: "rgba(255, 255, 255, 0.65)",
    border: "rgba(255, 255, 255, 0.5)",
    shadow: "rgba(0, 0, 0, 0.06)",
  },
  statusBar: "dark" as const,
  blurTint: "light" as const,
} as const;

// ─── Dark ─────────────────────────────────────────────────────────────────────
export const darkColors = {
  primary: "#F5F5F5",
  background: "#0D0D0D",
  surface: "rgba(28, 28, 30, 0.8)",
  surfaceStrong: "rgba(28, 28, 30, 0.98)",
  border: "rgba(255, 255, 255, 0.09)",
  text: {
    primary: "#F2F2F7",
    secondary: "#8E8E93",
    tertiary: "#636366",
    inverse: "#0A0A0A",
  },
  accent: {
    green: "#34C759",
    greenMuted: "rgba(52, 199, 89, 0.15)",
    sage: "#869D7A",
    sageMuted: "rgba(134, 157, 122, 0.12)",
    red: "#FF453A",
    redMuted: "rgba(255, 69, 58, 0.15)",
    blue: "#0A84FF",
    blueMuted: "rgba(10, 132, 255, 0.15)",
    orange: "#FF9F0A",
    orangeMuted: "rgba(255, 159, 10, 0.15)",
  },
  glass: {
    background: "rgba(28, 28, 30, 0.75)",
    border: "rgba(255, 255, 255, 0.1)",
    shadow: "rgba(0, 0, 0, 0.3)",
  },
  statusBar: "light" as const,
  blurTint: "dark" as const,
} as const;

export type AppColors = typeof lightColors;
export type ThemePreference = "light" | "dark" | "system";

export function resolveColors(
  preference: ThemePreference,
  system: ColorSchemeName,
): AppColors {
  if (preference === "light") return lightColors;
  if (preference === "dark") return darkColors;
  return system === "dark" ? darkColors : lightColors;
}

// ─── Static tokens — theme-independent ───────────────────────────────────────
export const Typography = {
  largeTitle: { fontSize: 34, fontWeight: "700" as const, letterSpacing: -0.5 },
  title1: { fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.4 },
  title2: { fontSize: 22, fontWeight: "600" as const, letterSpacing: -0.3 },
  title3: { fontSize: 20, fontWeight: "600" as const, letterSpacing: -0.2 },
  headline: { fontSize: 17, fontWeight: "600" as const, letterSpacing: -0.2 },
  body: { fontSize: 17, fontWeight: "400" as const, letterSpacing: -0.2 },
  callout: { fontSize: 16, fontWeight: "400" as const, letterSpacing: -0.2 },
  subhead: { fontSize: 15, fontWeight: "400" as const, letterSpacing: -0.1 },
  footnote: { fontSize: 13, fontWeight: "400" as const, letterSpacing: 0 },
  caption: { fontSize: 12, fontWeight: "400" as const, letterSpacing: 0.1 },
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

// Keep Colors export so existing imports don't break during migration
export { lightColors as Colors };
