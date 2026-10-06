import { useState, useEffect, useCallback, useRef } from "react";
import { APP_SCREEN_TOURS, type ScreenGuideItem, type TourStepItem } from "./appTourRegistry";

export const CEO_START_TOUR_EVENT = "ceo1983:start-tour";
export const CEO_STOP_TOUR_EVENT = "ceo1983:stop-tour";
export const CEO_STEP_TOUR_EVENT = "ceo1983:step-tour";

export function getTourById(id: string): ScreenGuideItem | undefined {
  return APP_SCREEN_TOURS.find((t) => t.id === id);
}

export function startTourGlobally(tourId: string, initialStep = 0) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(CEO_START_TOUR_EVENT, {
      detail: { tourId, stepIndex: initialStep },
    }),
  );
}

export function stopTourGlobally() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CEO_STOP_TOUR_EVENT));
}

/**
 * Hook quản lý trạng thái Lộ trình Chỉ dẫn Lái Màn hình bằng Giọng nói (Voice GPS Tour Guide)
 */
export function useVoiceGpsTour() {
  const [activeTour, setActiveTour] = useState<ScreenGuideItem | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Hàm phát âm thanh Text-to-Speech tiếng Việt (Web Speech API)
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === "undefined" || !synthRef.current || isVoiceMuted) {
        if (onEnd) onEnd();
        return;
      }

      try {
        synthRef.current.cancel();

        const cleanText = text
          .replace(/[*_#`]/g, "")
          .replace(/https?:\/\/\S+/g, "")
          .trim();

        if (!cleanText) {
          if (onEnd) onEnd();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "vi-VN";
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        // Ưu tiên chọn giọng đọc tiếng Việt nếu trình duyệt hỗ trợ
        const voices = synthRef.current.getVoices();
        const viVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().includes("vi") ||
            v.lang.toLowerCase().includes("vietnamese"),
        );
        if (viVoice) {
          utterance.voice = viVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          if (onEnd) onEnd();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          if (onEnd) onEnd();
        };

        synthRef.current.speak(utterance);
      } catch (err) {
        console.warn("[VoiceGpsTour] TTS error:", err);
        setIsSpeaking(false);
        if (onEnd) onEnd();
      }
    },
    [isVoiceMuted],
  );

  // Dừng đọc ngay lập tức
  const cancelSpeech = useCallback(() => {
    if (typeof window !== "undefined" && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Lấy bước hiện tại
  const currentStep: TourStepItem | null =
    activeTour && activeTour.steps[currentStepIndex]
      ? activeTour.steps[currentStepIndex]
      : null;

  // Tính toán vị trí phần tử mục tiêu (Spotlight Target)
  const measureTarget = useCallback(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }

    if (typeof document === "undefined") return;

    const el = document.getElementById(currentStep.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      // Cuộn êm màn hình tới phần tử đó nếu nằm ngoài khung nhìn
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  // Cập nhật vị trí khi đổi bước hoặc resize
  useEffect(() => {
    measureTarget();
    const handleResize = () => measureTarget();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [measureTarget]);

  // Tự động phát giọng đọc khi chuyển bước
  useEffect(() => {
    if (!activeTour || !currentStep) return;

    // Giọng đọc dẫn đường GPS: Đọc rõ thứ tự bước + hành động thao tác + chỉ dẫn
    const stepNumber = currentStepIndex + 1;
    const totalSteps = activeTour.steps.length;
    const narration = `Bước ${stepNumber} trên ${totalSteps}: ${currentStep.title}. ${currentStep.instruction}`;

    speakText(narration);
  }, [activeTour, currentStepIndex, currentStep, speakText]);

  // Chuyển sang bước kế tiếp
  const nextStep = useCallback(() => {
    if (!activeTour) return;
    if (currentStepIndex < activeTour.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Đã hoàn tất toàn bộ lộ trình
      speakText(
        `Chúc mừng Quý hội viên đã hoàn tất chỉ dẫn thao tác ${activeTour.title}! Chúc Quý anh chị có trải nghiệm kết nối tuyệt vời.`,
        () => {
          setActiveTour(null);
          setCurrentStepIndex(0);
        },
      );
    }
  }, [activeTour, currentStepIndex, speakText]);

  // Quay lại bước trước
  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  // Bắt đầu một Tour
  const startTour = useCallback((tourId: string, initialStep = 0) => {
    const tour = getTourById(tourId);
    if (!tour) return;
    setActiveTour(tour);
    setCurrentStepIndex(Math.max(0, Math.min(initialStep, tour.steps.length - 1)));
  }, []);

  // Dừng và thoát khỏi Tour
  const stopTour = useCallback(() => {
    cancelSpeech();
    setActiveTour(null);
    setCurrentStepIndex(0);
    setTargetRect(null);
  }, [cancelSpeech]);

  // Lắng nghe sự kiện toàn cục
  useEffect(() => {
    const onStart = (e: Event) => {
      const custom = e as CustomEvent<{ tourId: string; stepIndex?: number }>;
      if (custom.detail?.tourId) {
        startTour(custom.detail.tourId, custom.detail.stepIndex || 0);
      }
    };
    const onStop = () => stopTour();

    window.addEventListener(CEO_START_TOUR_EVENT, onStart);
    window.addEventListener(CEO_STOP_TOUR_EVENT, onStop);

    return () => {
      window.removeEventListener(CEO_START_TOUR_EVENT, onStart);
      window.removeEventListener(CEO_STOP_TOUR_EVENT, onStop);
    };
  }, [startTour, stopTour]);

  return {
    activeTour,
    currentStepIndex,
    currentStep,
    totalSteps: activeTour ? activeTour.steps.length : 0,
    isSpeaking,
    isVoiceMuted,
    targetRect,
    setIsVoiceMuted,
    startTour,
    nextStep,
    prevStep,
    stopTour,
    speakCurrentStep: () => {
      if (activeTour && currentStep) {
        speakText(`Bước ${currentStepIndex + 1}: ${currentStep.title}. ${currentStep.instruction}`);
      }
    },
  };
}
