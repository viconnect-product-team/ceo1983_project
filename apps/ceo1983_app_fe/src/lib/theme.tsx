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

function applyTheme(_theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  // Gỡ bỏ hoàn toàn class dark - Chuẩn hóa 100% theme sáng (Light Theme)
  root.classList.remove("dark");
  root.classList.remove("hc");
  root.classList.add("light");
  root.dataset.theme = "light";
  root.style.colorScheme = "light";

  // Re-apply CEO 1983 Color theme variables so brand colors remain vibrant on Light Theme
  applyCeo1983ColorTheme(getActiveCeo1983ColorThemeId());
}

function readInitial(): Theme {
  if (typeof window !== "undefined") {
    try {
      // Dọn dẹp key cũ nếu từng lưu dark mode
      localStorage.setItem(STORAGE_KEY, "light");
    } catch {
      /* ignore */
    }
  }
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [colorTheme, setColorThemeState] = useState<Ceo1983ColorThemeId>("royal-gold");

  useEffect(() => {
    const initial = readInitial();
    const initialColor = getActiveCeo1983ColorThemeId();
    setThemeState("light");
    setColorThemeState(initialColor);
    applyTheme("light");
    applyCeo1983ColorTheme(initialColor);

    const handleColorChanged = (e: any) => {
      if (e.detail && e.detail.id) {
        setColorThemeState(e.detail.id);
      }
    };
    window.addEventListener(COLOR_THEME_EVENT, handleColorChanged);
    return () => window.removeEventListener(COLOR_THEME_EVENT, handleColorChanged);
  }, []);

  const setTheme = (_t: Theme) => {
    setThemeState("light");
    applyTheme("light");
    try {
      localStorage.setItem(STORAGE_KEY, "light");
    } catch {
      /* ignore */
    }
  };

  const setColorTheme = (ct: Ceo1983ColorThemeId) => {
    setColorThemeState(ct);
    applyCeo1983ColorTheme(ct);
  };

  const toggle = () => setTheme("light");

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
