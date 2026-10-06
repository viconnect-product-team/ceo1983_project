import React, { useState, useRef, useEffect, type ReactNode } from "react";
import {
  RotateCw,
  ArrowDown,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Hand,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { toast } from "sonner";

export interface PullToRefreshProps {
  children: ReactNode;
  onRefresh?: () => Promise<void> | void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
  enableSwipeNav?: boolean;
  enableReachability?: boolean;
  enableThumbHub?: boolean;
  pathname?: string;
}

/**
 * Dynamic One-Handed Ergonomics & Pull-To-Refresh System.
 * 1. Pull-to-refresh vật lý đàn hồi & rung haptic xúc giác.
 * 2. Cử chỉ vuốt ngang chuyển tab linh hoạt với visual indicators động theo lực kéo.
 * 3. Vuốt mép trái (Edge Swipe Back) quay lại tức thời.
 * 4. Chế độ Reachability (Hạ nửa màn hình 35%) đưa mọi nút trên đỉnh vào tầm ngón tay cái.
 * 5. Phím trợ năng ngón tay cái (Ergonomic Thumb Hub) hỗ trợ thao tác nhanh: Quay lại, Hạ màn hình, Đầu trang, Làm mới.
 */
export function PullToRefresh({
  children,
  onRefresh,
  onSwipeLeft,
  onSwipeRight,
  className = "",
  enableSwipeNav = false,
  enableReachability = true,
  enableThumbHub = true,
  pathname,
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pull to refresh states
  const [pullY, setPullY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  // Horizontal Swipe states (chỉ active khi enableSwipeNav được bật thủ công)
  const [swipeDistanceX, setSwipeDistanceX] = useState(0);
  const [isSwipingX, setIsSwipingX] = useState(false);

  // Dynamic Reachability Mode (Hạ màn hình kiểu iOS)
  const [isReachabilityActive, setIsReachabilityActive] = useState(false);

  // Gesture tracking refs
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const isAtTopRef = useRef(true);
  const gestureDirectionRef = useRef<"vertical" | "horizontal" | null>(null);
  const isInsideHorizontalContainerRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const PULL_THRESHOLD = 65; // px kéo xuống để kích hoạt reload
  const MAX_PULL = 90;

  // Haptic feedback
  const triggerHaptic = (ms = 15) => {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(ms);
      }
    } catch {}
  };

  // Scroll to top
  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      triggerHaptic(10);
    }
  };

  // Lắng nghe sự kiện scroll to top toàn cục (khi bấm tabbar active)
  useEffect(() => {
    const handleScrollToTop = () => scrollToTop();
    window.addEventListener("vba:scroll_to_top", handleScrollToTop);
    return () => window.removeEventListener("vba:scroll_to_top", handleScrollToTop);
  }, []);

  // Toggle Reachability
  const toggleReachability = () => {
    setIsReachabilityActive((prev) => {
      const next = !prev;
      triggerHaptic(next ? 25 : 15);
      if (next) {
        toast.info("Đã kích hoạt chế độ Một tay (Hạ màn hình)");
      }
      return next;
    });
  };

  useEffect(() => {
    const handler = () => toggleReachability();
    window.addEventListener("vba:toggle_reachability", handler);
    return () => window.removeEventListener("vba:toggle_reachability", handler);
  }, []);

  // Auto dismiss reachability after 10s of inactivity
  useEffect(() => {
    if (!isReachabilityActive) return;
    const t = setTimeout(() => setIsReachabilityActive(false), 10000);
    return () => clearTimeout(t);
  }, [isReachabilityActive]);

  // Cleanup RAF
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Instantly reset scroll to top on tab / route switch to prevent scroll jumps
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [pathname]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    const container = containerRef.current;
    if (!container) return;

    isAtTopRef.current = container.scrollTop <= 0;
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    startTimeRef.current = Date.now();
    gestureDirectionRef.current = null;
    setIsSwipingX(false);
    setSwipeDistanceX(0);

    // Kiểm tra xem vị trí chạm có thuộc vùng cuộn ngang (carousels, danh sách pills, tabs...) không
    const target = e.target as HTMLElement | null;
    const isHoriz = Boolean(
      target?.closest(
        '[data-horizontal-scroll], [class*="overflow-x"], .no-scrollbar, [role="tablist"], [data-radix-scroll-area-viewport], input, textarea, select, button'
      )
    );
    isInsideHorizontalContainerRef.current = isHoriz;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    const container = containerRef.current;
    if (!container) return;

    // Nếu không ở đỉnh trang và không đang kéo thì bỏ qua xử lý để trình duyệt cuộn mượt mà nhất
    if (!isAtTopRef.current && !isPulling) return;

    const touch = e.touches[0];
    const diffX = touch.clientX - startXRef.current;
    const diffY = touch.clientY - startYRef.current;

    // Xác định hướng cử chỉ: Kéo dọc khi ở đỉnh trang
    if (!gestureDirectionRef.current) {
      if (Math.abs(diffY) > 8 && Math.abs(diffY) > Math.abs(diffX) * 1.2) {
        gestureDirectionRef.current = "vertical";
      } else if (Math.abs(diffX) > 15) {
        gestureDirectionRef.current = "horizontal";
      }
    }

    // ── GESTURE DỌC: PULL TO REFRESH CHUẨN NATIVE MOMO ──
    if (gestureDirectionRef.current === "vertical" && isAtTopRef.current && diffY > 0) {
      const damped = Math.min(diffY * 0.4, MAX_PULL);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setPullY(damped);
        setIsPulling(true);
      });

      if (damped >= PULL_THRESHOLD && pullY < PULL_THRESHOLD) {
        triggerHaptic(15);
      }
    }

    // ── GESTURE NGANG ──
    if (
      enableSwipeNav &&
      gestureDirectionRef.current === "horizontal" &&
      !isInsideHorizontalContainerRef.current &&
      Math.abs(diffY) < 25
    ) {
      setIsSwipingX(true);
      setSwipeDistanceX(diffX);
    }
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (isRefreshing) return;
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - startXRef.current;
    const diffY = touch.clientY - startYRef.current;
    const duration = Date.now() - startTimeRef.current;

    setIsSwipingX(false);
    setSwipeDistanceX(0);

    // ── 1. CỬ CHỈ NGANG: CHỈ XỬ LÝ KHI NGƯỜI DÙNG BẬT EXPLICIT FLAG enableSwipeNav ──
    if (
      enableSwipeNav &&
      gestureDirectionRef.current === "horizontal" &&
      !isInsideHorizontalContainerRef.current &&
      Math.abs(diffY) < 35
    ) {
      const isQuickSwipe = duration < 250 && Math.abs(diffX) > 90 && Math.abs(diffY) < 20;
      const isDistanceSwipe = Math.abs(diffX) > 130;

      if (isQuickSwipe || isDistanceSwipe) {
        // Vuốt sang trái (Swipe Left -> Tab tiếp)
        if (diffX < -130 || (isQuickSwipe && diffX < -90)) {
          triggerHaptic(12);
          if (onSwipeLeft) {
            onSwipeLeft();
          } else {
            window.dispatchEvent(new CustomEvent("vba:swipe_next_tab"));
          }
          return;
        }

        // Vuốt sang phải (Swipe Right -> Tab trước)
        if (diffX > 130 || (isQuickSwipe && diffX > 90)) {
          triggerHaptic(12);
          if (onSwipeRight) {
            onSwipeRight();
          } else {
            window.dispatchEvent(new CustomEvent("vba:swipe_prev_tab"));
          }
          return;
        }
      }
    }

    // Dismiss reachability khi đang hạ màn hình và vuốt ngược lên
    if (enableReachability && isReachabilityActive && diffY < -20) {
      setIsReachabilityActive(false);
      triggerHaptic(15);
      return;
    }

    // ── 2. XỬ LÝ KÉO DỌC: PULL TO REFRESH ──
    if (isPulling) {
      setIsPulling(false);
      if (pullY >= PULL_THRESHOLD) {
        setIsRefreshing(true);
        setPullY(52);
        triggerHaptic(25);

        try {
          if (onRefresh) {
            await onRefresh();
          } else {
            window.dispatchEvent(new Event("vba:refresh_data"));
            await new Promise((res) => setTimeout(res, 700));
          }
          setRefreshSuccess(true);
          triggerHaptic(20);
          toast.success("Đã làm mới dữ liệu!");
        } catch {
          toast.error("Không thể làm mới dữ liệu.");
        } finally {
          setTimeout(() => {
            setIsRefreshing(false);
            setRefreshSuccess(false);
            setPullY(0);
          }, 350);
        }
      } else {
        setPullY(0);
      }
    }
  };

  const progressPct = Math.min(100, Math.round((pullY / PULL_THRESHOLD) * 100));

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      {/* ── REACHABILITY OVERLAY (VÙNG TRÊN KHI HẠ MÀN HÌNH) ── */}
      {isReachabilityActive && (
        <div
          onClick={() => setIsReachabilityActive(false)}
          className="absolute inset-x-0 top-0 h-[35vh] z-40 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center cursor-pointer transition-opacity animate-in fade-in"
        >
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md shadow-md border border-white/20">
            <Minimize2 className="h-3.5 w-3.5" />
            <span>Chạm vùng này để đẩy màn hình lên</span>
          </div>
        </div>
      )}

      {/* ── PULL-TO-REFRESH INDICATOR CHUẨN NATIVE MOMO ── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-2 z-30 flex items-center justify-center transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${pullY > 0 ? pullY - 48 : -64}px)`,
          opacity: pullY > 8 || isRefreshing ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-2 rounded-full border border-amber-500/35 bg-white/95 dark:bg-[#0A1A3A]/95 px-3.5 py-1.5 shadow-xl backdrop-blur-xl transition-all">
          {refreshSuccess ? (
            <>
              <div className="grid h-4.5 w-4.5 place-items-center rounded-full bg-emerald-500 text-white shadow-xs">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                Đã cập nhật
              </span>
            </>
          ) : isRefreshing ? (
            <>
              <RotateCw className="h-4 w-4 animate-spin text-[#003B95] dark:text-amber-400" />
              <span className="text-[11px] font-bold text-[#003B95] dark:text-amber-400">
                Đang làm mới...
              </span>
            </>
          ) : (
            <>
              <div
                className="grid h-4.5 w-4.5 place-items-center rounded-full bg-amber-500/15 text-amber-500 transition-transform duration-100"
                style={{
                  transform: `rotate(${pullY >= PULL_THRESHOLD ? 180 : (pullY / PULL_THRESHOLD) * 180}deg)`,
                }}
              >
                <ArrowDown className="h-3 w-3" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                {pullY >= PULL_THRESHOLD ? "Thả để cập nhật" : `Kéo để làm mới (${progressPct}%)`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── NỘI DUNG CHÍNH (ÁP DỤNG MOMENTUM SCROLLING & REACHABILITY) ── */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`h-full w-full overflow-y-auto overscroll-contain smooth-scroll-touch select-none-touch transition-transform ${className}`}
        style={{
          transform: isReachabilityActive
            ? "translate3d(0, 35vh, 0)"
            : pullY > 0
            ? `translate3d(0, ${pullY * 0.75}px, 0)`
            : "translate3d(0, 0, 0)",
          willChange: isPulling ? "transform" : "auto",
          transitionDuration: isReachabilityActive ? "300ms" : isPulling ? "0ms" : "240ms",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
