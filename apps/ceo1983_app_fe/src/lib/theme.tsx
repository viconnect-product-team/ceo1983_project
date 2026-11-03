import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  applyCeo1983ColorTheme,
  getActiveCeo1983ColorThemeId,
  COLOR_THEME_EVENT,
  type Ceo1983ColorThemeId
} from "./ceo1983-color-theme";

export type Theme = "light" | "dark";

const STORAGE_KEY = "vba.theme";

type ThemeCtx = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  /** Cycles light → dark → light */
  toggle: () => void;
  colorTheme: Ceo1983ColorThemeId;
  setColorTheme: (ct: Ceo1983ColorThemeId) => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.remove("hc");
  root.dataset.theme = theme;
  root.style.colorScheme = theme === "light" ? "light" : "dark";

  // Re-apply CEO 1983 Color theme variables so dark/light mode switches preserve custom brand colors
  applyCeo1983ColorTheme(getActiveCeo1983ColorThemeId());
}

function readInitial(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    /* ignore */
  }
  return "dark";
}

const ORDER: Theme[] = ["light", "dark"];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [colorTheme, setColorThemeState] = useState<Ceo1983ColorThemeId>("royal-gold");

  useEffect(() => {
    const initial = readInitial();
    const initialColor = getActiveCeo1983ColorThemeId();
    setThemeState(initial);
    setColorThemeState(initialColor);
    applyTheme(initial);
    applyCeo1983ColorTheme(initialColor);

    const handleColorChanged = (e: any) => {
      if (e.detail && e.detail.id) {
        setColorThemeState(e.detail.id);
      }
    };
    window.addEventListener(COLOR_THEME_EVENT, handleColorChanged);
    return () => window.removeEventListener(COLOR_THEME_EVENT, handleColorChanged);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  };

  const setColorTheme = (ct: Ceo1983ColorThemeId) => {
    setColorThemeState(ct);
    applyCeo1983ColorTheme(ct);
  };

  const toggle = () => setTheme(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle, colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
