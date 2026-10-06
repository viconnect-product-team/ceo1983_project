import React from "react";
import {
  Compass,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { useVoiceGpsTour } from "@/lib/tours/voice-gps-controller";

/**
 * Google Maps-Style Turn-by-Turn Spotlight & Voice HUD Overlay
 * Hiển thị vệt sáng Spotlight vào nút mục tiêu và thanh chỉ dẫn HUD nổi
 */
export function VoiceGpsHudOverlay() {
  const {
    activeTour,
    currentStepIndex,
    currentStep,
    totalSteps,
    isSpeaking,
    isVoiceMuted,
    targetRect,
    setIsVoiceMuted,
    nextStep,
    prevStep,
    stopTour,
    speakCurrentStep,
  } = useVoiceGpsTour();

  if (!activeTour || !currentStep) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none select-none">
      {/* 1. VÙNG TỐI SPOTLIGHT NỔI BẬT PHẦN TỬ MỤC TIÊU */}
      {targetRect && (
        <div
          style={{
            top: `${Math.max(0, targetRect.top - 8)}px`,
            left: `${Math.max(0, targetRect.left - 8)}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
          }}
          className="absolute rounded-xl ring-4 ring-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.7)] animate-pulse pointer-events-auto transition-all duration-300 z-10"
        >
          {/* Con trỏ nhấp nháy chỉ đúng vị trí */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-bold px-3 py-1 rounded-full text-xs shadow-lg flex items-center gap-1.5 animate-bounce whitespace-nowrap">
            <span>{currentStep.actionGesture || "👆 Chạm vào đây"}</span>
          </div>
        </div>
      )}

      {/* 2. THANH ĐIỀU HƯỚNG HUD DẠNG GOOGLE MAPS TẠI ĐÁY MÀN HÌNH */}
      <div className="absolute bottom-4 left-3 right-3 md:left-1/2 md:-translate-x-1/2 md:w-[540px] pointer-events-auto transition-all duration-300">
        <div className="rounded-2xl border border-amber-500/40 bg-slate-950/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-4 text-white overflow-hidden relative">
          {/* Dải gradient vàng kim trang trọng */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600" />

          {/* HÀNG TIÊU ĐỀ LỘ TRÌNH */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                    Chỉ dẫn Lái Màn hình GPS
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-bold">
                    Bước {currentStepIndex + 1}/{totalSteps}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-100 truncate">
                  {activeTour.title}
                </h4>
              </div>
            </div>

            {/* Nút thoát chỉ dẫn */}
            <button
              onClick={stopTour}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center text-slate-400 transition-colors shrink-0"
              title="Dừng chỉ dẫn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* NỘI DUNG CHỈ DẪN BƯỚC HIỆN TẠI */}
          <div className="py-3 space-y-2">
            <div className="flex items-start gap-2.5">
              <span className="text-xl shrink-0 mt-0.5">{currentStep.icon || "👉"}</span>
              <div className="space-y-1 min-w-0">
                <div className="text-sm font-semibold text-amber-200">
                  {currentStep.title}
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {currentStep.instruction}
                </p>
                {currentStep.touchPoint && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <span className="font-medium text-amber-400/90">Điểm chạm:</span>
                    <span className="truncate">{currentStep.touchPoint}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mẹo doanh nhân */}
            {currentStep.proTip && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 text-[11px] text-amber-300 flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">
                  <strong>Mẹo VIP:</strong> {currentStep.proTip}
                </span>
              </div>
            )}
          </div>

          {/* THANH ĐIỀU KHIỂN & NÚT BƯỚC TIẾP */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {/* Nút Tắt/Bật giọng nói */}
              <button
                onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                  isVoiceMuted
                    ? "bg-rose-500/20 text-rose-300"
                    : "bg-white/10 text-slate-200 hover:bg-white/20"
                }`}
                title={isVoiceMuted ? "Bật giọng đọc" : "Tắt giọng đọc"}
              >
                {isVoiceMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2
                    className={`w-4 h-4 ${isSpeaking ? "text-amber-400 animate-pulse" : ""}`}
                  />
                )}
              </button>

              {/* Nút Đọc lại giọng nói */}
              <button
                onClick={speakCurrentStep}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                title="Đọc lại lời chỉ dẫn"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Nút Bước trước */}
              <button
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold text-slate-200 flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </button>

              {/* Nút Bước tiếp theo / Hoàn thành */}
              <button
                onClick={nextStep}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-xs font-bold shadow-md flex items-center gap-1.5 transition-all transform active:scale-95"
              >
                <span>{isLastStep ? "Hoàn tất" : "Bước tiếp"}</span>
                {isLastStep ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
