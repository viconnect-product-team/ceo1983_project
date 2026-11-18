import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  applyCeo1983ColorTheme,
  getActiveCeo1983ColorThemeId,
  COLOR_THEME_EVENT,
  type Ceo1983ColorThemeId
} from "./ceo1983-color-theme";

export type Theme = "light" | "dark";

const STORAGE_KEY = "vba.theme";
const CRM_THEME_KEY = "vba.crm_theme";

function isAssociationApp(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/association");
}

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

  // Hỗ trợ chuyển đổi Theme sáng / tối cho toàn bộ hệ thống (cả Web CRM và Mobile App CEO 1983)
  // Khi ở Theme tối, background luôn là màu đen thuần (#000000) theo quy chuẩn thương hiệu
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
    root.dataset.theme = "dark";
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
    root.dataset.theme = "light";
    root.style.colorScheme = "light";
  }

  // Re-apply CEO 1983 Color theme variables so brand colors remain vibrant
  applyCeo1983ColorTheme(getActiveCeo1983ColorThemeId());
}

function readInitial(): Theme {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(CRM_THEME_KEY);
      if (stored === "dark" || stored === "light") return stored;
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
      localStorage.setItem(CRM_THEME_KEY, t);
      localStorage.setItem("theme", t);
    } catch {
      /* ignore */
    }
  };

  const setColorTheme = (ct: Ceo1983ColorThemeId) => {
    setColorThemeState(ct);
    applyCeo1983ColorTheme(ct);
  };

  const toggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

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
