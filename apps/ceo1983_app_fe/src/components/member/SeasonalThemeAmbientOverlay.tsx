import { useState, useEffect, useMemo } from "react";
import {
  getEffectiveThemeOption,
  isEventThemeEnabled,
  type EventThemeType,
  type EffectType,
  syncThemeFromBackend,
} from "./SeasonalEventHeader";

/**
 * SeasonalThemeAmbientOverlay
 * Hiệu ứng hoạt ảnh hạt rơi toàn màn hình (Tuyết rơi, Hoa đào rơi, Lồng đèn, Pháo hoa, Ánh sao lấp lánh)
 * Đồng bộ thời gian thực từ Cổng Quản Trị CRM vào toàn bộ App Mobile CEO 1983.
 * Đảm bảo pointer-events-none để không chặn cảm ứng bấm/chạm/lướt.
 */
export function SeasonalThemeAmbientOverlay() {
  const [enabled, setEnabled] = useState(() => isEventThemeEnabled());
  const [theme, setTheme] = useState(() => getEffectiveThemeOption());

  useEffect(() => {
    // Tự động đồng bộ theme mới nhất từ CRM backend khi nạp App
    void syncThemeFromBackend();

    const handleThemeChange = () => {
      const isEn = isEventThemeEnabled();
      setEnabled(isEn);
      setTheme(getEffectiveThemeOption());
    };

    window.addEventListener("vba-event-theme-changed", handleThemeChange);
    window.addEventListener("ceo1983-theme-changed", handleThemeChange);
    window.addEventListener("storage", handleThemeChange);

    return () => {
      window.removeEventListener("vba-event-theme-changed", handleThemeChange);
      window.removeEventListener("ceo1983-theme-changed", handleThemeChange);
      window.removeEventListener("storage", handleThemeChange);
    };
  }, []);

  const activeEffect: EffectType = useMemo(() => {
    if (!enabled || !theme || theme.id === "none" || theme.id === "classic") {
      return "none";
    }
    if (theme.effectType && theme.effectType !== "none") {
      return theme.effectType;
    }
    if (theme.id === "christmas") return "snow";
    if (theme.id === "tet") return "flowers";
    if (theme.id === "mid-autumn") return "lanterns";
    if (theme.id === "national-day") return "fireworks";
    if (
      theme.id === "ceo1983-royal-gold" ||
      theme.id === "ceo1983-obsidian-gold" ||
      theme.id === "ceo1983-ruby-gold" ||
      theme.id === "ceo1983-birthday"
    ) {
      return "sparkles";
    }
    return "none";
  }, [enabled, theme]);

  if (activeEffect === "none") return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden select-none"
      aria-hidden="true"
    >
      <style>{`
        @keyframes vba-fall-snow {
          0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
          15% { opacity: 0.85; }
          85% { opacity: 0.85; }
          100% { transform: translateY(105vh) translateX(35px) rotate(360deg); opacity: 0; }
        }
        @keyframes vba-fall-flower {
          0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
          20% { opacity: 0.9; }
          50% { transform: translateY(50vh) translateX(-25px) rotate(180deg); }
          80% { opacity: 0.9; }
          100% { transform: translateY(105vh) translateX(25px) rotate(360deg); opacity: 0; }
        }
        @keyframes vba-float-lantern {
          0% { transform: translateY(105vh) translateX(0) rotate(-5deg); opacity: 0; }
          15% { opacity: 0.85; }
          50% { transform: translateY(50vh) translateX(20px) rotate(5deg); }
          85% { opacity: 0.85; }
          100% { transform: translateY(-30px) translateX(-15px) rotate(-5deg); opacity: 0; }
        }
        @keyframes vba-sparkle-pulse {
          0%, 100% { transform: scale(0.6); opacity: 0.2; }
          50% { transform: scale(1.2); opacity: 0.95; filter: drop-shadow(0 0 6px rgba(245,158,11,0.9)); }
        }
        @keyframes vba-firework-burst {
          0% { transform: scale(0.2); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 10px rgba(239,68,68,0.9)); }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>

      {/* 1. HIỆU ỨNG TUYẾT RƠI (CHRISTMAS / NOEL) */}
      {activeEffect === "snow" && (
        <div className="size-full relative">
          {[...Array(16)].map((_, i) => (
            <span
              key={i}
              className="absolute text-sm text-cyan-100/80 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
              style={{
                left: `${(i * 6.25 + 3) % 96}%`,
                top: `-20px`,
                animation: `vba-fall-snow ${5 + (i % 5)}s linear infinite`,
                animationDelay: `${(i * 0.45) % 6}s`,
                fontSize: `${10 + (i % 8)}px`,
              }}
            >
              ❄️
            </span>
          ))}
        </div>
      )}

      {/* 2. HIỆU ỨNG HOA ĐÀO / HOA MAI RƠI (TẾT NGUYÊN ĐÁN) */}
      {activeEffect === "flowers" && (
        <div className="size-full relative">
          {[...Array(14)].map((_, i) => (
            <span
              key={i}
              className="absolute text-sm drop-shadow-[0_0_6px_rgba(244,114,182,0.6)]"
              style={{
                left: `${(i * 7.1 + 2) % 95}%`,
                top: `-20px`,
                animation: `vba-fall-flower ${6 + (i % 4)}s ease-in-out infinite`,
                animationDelay: `${(i * 0.5) % 5}s`,
                fontSize: `${11 + (i % 7)}px`,
              }}
            >
              {i % 3 === 0 ? "🌸" : i % 3 === 1 ? "🌺" : "🌼"}
            </span>
          ))}
        </div>
      )}

      {/* 3. HIỆU ỨNG LỒNG ĐÈN / TRĂNG RẰM BAY LƯỢN (TRUNG THU) */}
      {activeEffect === "lanterns" && (
        <div className="size-full relative">
          {[...Array(10)].map((_, i) => (
            <span
              key={i}
              className="absolute drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]"
              style={{
                left: `${(i * 10 + 4) % 92}%`,
                bottom: `-30px`,
                animation: `vba-float-lantern ${9 + (i % 5)}s ease-in-out infinite`,
                animationDelay: `${(i * 0.9) % 7}s`,
                fontSize: `${14 + (i % 6)}px`,
              }}
            >
              {i % 4 === 0 ? "🏮" : i % 4 === 1 ? "🌕" : i % 4 === 2 ? "⭐" : "🥮"}
            </span>
          ))}
        </div>
      )}

      {/* 4. HIỆU ỨNG ÁNH SAO LẤP LÁNH SANG TRỌNG (GALA / ROYAL / SINH NHẬT) */}
      {activeEffect === "sparkles" && (
        <div className="size-full relative">
          {[
            { left: "10%", top: "8%" },
            { left: "82%", top: "12%" },
            { left: "25%", top: "28%" },
            { left: "75%", top: "35%" },
            { left: "15%", top: "52%" },
            { left: "88%", top: "60%" },
            { left: "30%", top: "78%" },
            { left: "70%", top: "85%" },
          ].map((pos, i) => (
            <span
              key={i}
              className="absolute text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
              style={{
                left: pos.left,
                top: pos.top,
                animation: `vba-sparkle-pulse ${2.2 + (i % 3) * 0.6}s ease-in-out infinite`,
                animationDelay: `${i * 0.35}s`,
                fontSize: `${13 + (i % 5)}px`,
              }}
            >
              {i % 2 === 0 ? "✨" : "⭐"}
            </span>
          ))}
        </div>
      )}

      {/* 5. HIỆU ỨNG PHÁO HOA NỔ MỪNG NGÀY HỘI (QUỐC KHÁNH / SỰ KIỆN LỚN) */}
      {activeEffect === "fireworks" && (
        <div className="size-full relative">
          {[
            { left: "18%", top: "10%" },
            { left: "80%", top: "14%" },
            { left: "45%", top: "22%" },
          ].map((pos, i) => (
            <span
              key={i}
              className="absolute text-2xl"
              style={{
                left: pos.left,
                top: pos.top,
                animation: `vba-firework-burst 2.8s ease-out infinite`,
                animationDelay: `${i * 0.9}s`,
              }}
            >
              {i % 2 === 0 ? "🎆" : "🎇"}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

