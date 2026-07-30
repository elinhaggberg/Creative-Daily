import { getThemePref, setThemePref } from "./storage.js";

export const THEMES = [
  { id: "playful", label: "Playful" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

// Same five swatches, same order, as the other Make It Local apps, so
// switching between them feels like the same design system throughout.
export const PLAYFUL_SWATCHES = [
  { id: "lipstick", label: "Lipstick", accent: "#ee4c9b", accentText: "#ffffff" },
  { id: "grapefruit", label: "Grapefruit", accent: "#f2542d", accentText: "#ffffff" },
  { id: "sunshine", label: "Sunshine", accent: "#f5b942", accentText: "#241c1c" },
  { id: "lilac", label: "Lilac", accent: "#b9a6ff", accentText: "#241c1c" },
  { id: "midnight", label: "Midnight", accent: "#3b2352", accentText: "#ffffff" },
];

const THEME_BG = { dark: "#0b0d0f", light: "#f6f7f9", playful: "#f7f0e4" };

// Playful (warm paper, like a sketchbook page) is the default look.
const DEFAULT_PREF = { mode: "playful", playfulAccent: "lilac" };

export function getTheme() {
  return { ...DEFAULT_PREF, ...getThemePref() };
}

export function setTheme(pref) {
  setThemePref(pref);
  applyTheme();
}

export function applyTheme() {
  const pref = getTheme();
  const root = document.documentElement;
  root.dataset.theme = pref.mode;

  if (pref.mode === "playful") {
    const swatch = PLAYFUL_SWATCHES.find((s) => s.id === pref.playfulAccent) || PLAYFUL_SWATCHES[0];
    root.style.setProperty("--accent", swatch.accent);
    root.style.setProperty("--accent-text", swatch.accentText);
  } else {
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-text");
  }

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) themeColorMeta.setAttribute("content", THEME_BG[pref.mode] || THEME_BG.playful);
}
