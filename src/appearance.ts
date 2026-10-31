export type Theme = "dark" | "light";
const THEME_KEY = "ctz.theme";
const FONT_KEY = "ctz.fontSize";

export const FONT_SIZES = [
  { label: "Pequeño", px: 14 },
  { label: "Normal", px: 16 },
  { label: "Grande", px: 18 },
  { label: "Muy grande", px: 20 },
];

const safeGet = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const safeSet = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* noop */
  }
};

export const getTheme = (): Theme => (safeGet(THEME_KEY) === "light" ? "light" : "dark");
export const getFontPx = (): number => {
  const n = Number(safeGet(FONT_KEY));
  return FONT_SIZES.some((f) => f.px === n) ? n : 16;
};

export function applyAppearance() {
  document.documentElement.setAttribute("data-theme", getTheme());
  document.documentElement.style.fontSize = `${getFontPx()}px`;
}
export function setTheme(t: Theme) {
  safeSet(THEME_KEY, t);
  applyAppearance();
}
export function setFontPx(px: number) {
  safeSet(FONT_KEY, String(px));
  applyAppearance();
}
