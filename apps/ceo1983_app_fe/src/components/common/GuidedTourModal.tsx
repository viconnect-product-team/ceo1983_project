import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, ArrowRight, ArrowLeft, X, Check, ShieldCheck, HelpCircle } from "lucide-react";

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
  actionGesture?: string;
  touchPoint?: string;
  instruction?: string;
  systemResponse?: string;
  roleNote?: string;
  proTip?: string;
  icon?: string;
  position?: "top" | "bottom" | "auto";
}

interface GuidedTourModalProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  storageKey?: string;
  screenTitle?: string;
  onNavigateToScreen?: (route: string) => void;
}

export function GuidedTourModal({
  steps,
  isOpen,
  onClose,
  storageKey = "ceo1983_guided_tour_completed",
  screenTitle = "Chỉ dẫn thao tác ngân hàng",
}: GuidedTourModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 375,
    height: typeof window !== "undefined" ? window.innerHeight : 667,
  });

  const step = steps[currentStep];

  // Calculate and update target element bounding box
  const updateTargetRect = useCallback(() => {
    if (!step) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      // Scroll into view gently
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      }, 250);
    } else {
      setTargetRect(null);
    }
  }, [step]);

  useEffect(() => {
    if (!isOpen) return;
    updateTargetRect();

    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      updateTargetRect();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", updateTargetRect, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", updateTargetRect);
    };
  }, [isOpen, currentStep, updateTargetRect]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem(storageKey, "true");
    } catch {}
    onClose();
  };

  if (!isOpen || !step) return null;

  // Padding around highlighted target
  const padding = 6;
  const targetTop = targetRect ? Math.max(0, targetRect.top - padding) : 0;
  const targetLeft = targetRect ? Math.max(0, targetRect.left - padding) : 0;
  const targetWidth = targetRect ? targetRect.width + padding * 2 : 0;
  const targetHeight = targetRect ? targetRect.height + padding * 2 : 0;

  // Decide if tooltip should appear above or below the target
  const spaceBelow = windowDimensions.height - (targetTop + targetHeight);
  const isBottom = spaceBelow >= 260 || targetTop < 220;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto select-none transition-all duration-300">
      {/* Dark SVG Backdrop with spotlight cutout */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ width: "100vw", height: "100vh" }}
      >
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White reveals overlay */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cuts out the spotlight area */}
            {targetRect && (
              <rect
                x={targetLeft}
                y={targetTop}
                width={targetWidth}
                height={targetHeight}
                rx="16"
                ry="16"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.72)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Pulsing Clean Blue Halo around the highlighted element */}
      {targetRect && (
        <div
          className="absolute rounded-2xl pointer-events-none transition-all duration-300"
          style={{
            top: targetTop,
            left: targetLeft,
            width: targetWidth,
            height: targetHeight,
            boxShadow: "0 0 0 3px #D8B282, 0 0 24px rgba(216, 178, 130, 0.55)",
          }}
        >
          <div className="absolute inset-0 rounded-2xl border-2 border-[#D8B282] animate-ping opacity-60 pointer-events-none" />
        </div>
      )}

      {/* Coachmark Tooltip Box — adapts seamlessly to light & dark themes */}
      <div
        className="absolute left-3 right-3 max-w-[440px] mx-auto z-10 transition-all duration-300 ease-out"
        style={{
          top: targetRect
            ? isBottom
              ? Math.min(windowDimensions.height - 290, targetTop + targetHeight + 12)
              : Math.max(16, targetTop - 270)
            : "30%",
        }}
      >
        <div className="rounded-3xl border-2 border-[#003B95]/40 bg-white/95 dark:bg-[#071228]/95 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_16px_50px_rgba(0,0,0,0.35)] text-slate-900 dark:text-white relative animate-scale-in">
          {/* Header Row: Screen title + Step counter badge + Close */}
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#19194D] to-[#003B95] text-white border border-blue-400/40 shadow-xs">
                BƯỚC {currentStep + 1} / {steps.length}
              </span>
              <span className="text-[11px] font-bold text-slate-600 dark:text-blue-200/90 truncate max-w-[190px]">
                {screenTitle}
              </span>
            </div>

            <button
              type="button"
              onClick={handleComplete}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Đóng hướng dẫn"
              title="Đóng chỉ dẫn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Action Gesture Badge */}
          <div className="space-y-1.5 mb-2.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[14.5px] font-black text-slate-900 dark:text-white flex items-center gap-1.5 leading-snug">
                {step.icon && <span className="text-base">{step.icon}</span>}
                <span>{step.title}</span>
              </h3>
            </div>

            {step.actionGesture && (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-500/10 dark:bg-blue-400/15 border border-blue-400/30 text-[11px] font-extrabold text-[#003B95] dark:text-blue-300">
                <span>{step.actionGesture}</span>
                {step.touchPoint && <span className="text-slate-500 dark:text-slate-400 font-normal">• {step.touchPoint}</span>}
              </div>
            )}

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
              {step.description}
            </p>
          </div>

          {/* Action Instruction / Pro Tip box */}
          {(step.instruction || step.proTip || step.roleNote) && (
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-white/10 p-2.5 mb-3 text-[11px] space-y-1.5">
              {step.instruction && (
                <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                  <span className="font-black text-[#003B95] dark:text-blue-400 shrink-0">👉 Thao tác:</span>
                  <span>{step.instruction}</span>
                </div>
              )}
              {step.systemResponse && (
                <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">⚡ Phản hồi:</span>
                  <span>{step.systemResponse}</span>
                </div>
              )}
              {step.roleNote && (
                <div className="flex items-start gap-1.5 text-blue-900 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/40 p-1.5 rounded-xl border border-blue-400/30">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#003B95] dark:text-blue-400" />
                  <span><strong>Phân quyền:</strong> {step.roleNote}</span>
                </div>
              )}
              {step.proTip && (
                <div className="flex items-start gap-1.5 text-blue-800 dark:text-sky-300">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#003B95] dark:text-sky-400" />
                  <span><strong>Mẹo CEO:</strong> {step.proTip}</span>
                </div>
              )}
            </div>
          )}

          {/* Progress dots & Actions Row */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            {/* Step Dots */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                    idx === currentStep
                      ? "w-6 bg-gradient-to-r from-[#003B95] to-[#2563EB]"
                      : "w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300"
                  }`}
                  title={`Bước ${idx + 1}`}
                />
              ))}
            </div>

            {/* Action Buttons: Pure CEO 1983 Blue Button */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Quay lại</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-[#003B95] hover:bg-[#002F77] text-white text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border border-blue-400/40"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Đã hiểu • Bắt đầu</span>
                  </>
                ) : (
                  <>
                    <span>Bước tiếp</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
