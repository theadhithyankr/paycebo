export type AppearancePreference = "system" | "light" | "dark";
export const APPEARANCE_KEY = "paycebo:appearance:v1";
export const lightPalette = {
  background: "#F4F5F1", surface: "#FFFFFF", elevated: "#E9EDE5", foreground: "#17221A",
  muted: "#5D675F", accent: "#86DB6E", line: "#D8DFD3", positive: "#257338", danger: "#A42E38",
  dark: "#0B1711", onDark: "#F6F8F3", darkMuted: "#C4D6C4", accentText: "#257338",
  dangerSurface: "#FCE9E9", contribution: "#E2EEDD", withdrawal: "#FCE9E9", heroEnd: "#284E33",
};
export type Palette = { [Key in keyof typeof lightPalette]: string };
export const darkPalette: Palette = {
  ...lightPalette, background: "#0B1711", surface: "#14271C", elevated: "#1E3326", foreground: "#F6F8F3",
  muted: "#BBCDBB", line: "#2D4934", positive: "#B0E69F", danger: "#FFB0B3", accentText: "#B0E69F",
  dangerSurface: "#3A1F26", contribution: "#223B27", withdrawal: "#3A1F26",
};
export function decodeAppearance(raw: string | null): AppearancePreference {
  if (raw === null) return "system";
  const value: unknown = JSON.parse(raw);
  if (value !== "system" && value !== "light" && value !== "dark") throw new Error("Your appearance preference couldn’t be read. Using your device theme.");
  return value;
}
export function resolveAppearance(preference: AppearancePreference, device: string | null | undefined): "light" | "dark" {
  return preference === "system" ? device === "dark" ? "dark" : "light" : preference;
}
export function paletteVariables(colors: Palette): Record<string, string> {
  return Object.fromEntries(Object.entries(colors).map(([key, value]) => ["--color-" + key.replace(/[A-Z]/g, (char) => "-" + char.toLowerCase()),
    [1, 3, 5].map((start) => parseInt(value.slice(start, start + 2), 16)).join(" ")]));
}
