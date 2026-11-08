import { describe, it, expect, vi, beforeEach } from "vitest";

export interface FastInstallHandlerOptions {
  isStandalone: boolean;
  deferredPrompt?: {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  } | null;
  onSuccess: (msg: string) => void;
  dispatchEvent: (event: CustomEvent) => void;
}

export async function executeFastInstall(
  options: FastInstallHandlerOptions
): Promise<"already_installed" | "prompt_accepted" | "fallback_guide_opened"> {
  // 1. Nếu đã chạy dạng App độc lập (Standalone PWA hoặc Native Capacitor)
  if (options.isStandalone) {
    options.onSuccess(
      "Ứng dụng CEO 1983 đã được cài đặt và đang chạy sẵn sàng trên thiết bị của bạn!"
    );
    return "already_installed";
  }

  // 2. Nếu có deferredPrompt từ trình duyệt Chrome / Android
  if (options.deferredPrompt && typeof options.deferredPrompt.prompt === "function") {
    try {
      await options.deferredPrompt.prompt();
      const choice = await options.deferredPrompt.userChoice;
      if (choice?.outcome === "accepted") {
        options.onSuccess("Ứng dụng đang được tự động cài đặt lên màn hình chính!");
        return "prompt_accepted";
      }
    } catch {
      // Fallback to guide
    }
  }

  // 3. Fallback: Mở modal hướng dẫn cài đặt iOS & Android
  options.dispatchEvent(new CustomEvent("open-install-prompt"));
  options.dispatchEvent(new CustomEvent("open-ios-install-guide"));
  return "fallback_guide_opened";
}

describe("PWA 1-Click Fast Install Handler", () => {
  let onSuccessMock: any;
  let dispatchEventMock: any;

  beforeEach(() => {
    onSuccessMock = vi.fn();
    dispatchEventMock = vi.fn();
  });

  it("should detect already installed standalone app", async () => {
    const res = await executeFastInstall({
      isStandalone: true,
      onSuccess: onSuccessMock,
      dispatchEvent: dispatchEventMock,
    });

    expect(res).toBe("already_installed");
    expect(onSuccessMock).toHaveBeenCalledWith(
      expect.stringContaining("Ứng dụng CEO 1983 đã được cài đặt")
    );
    expect(dispatchEventMock).not.toHaveBeenCalled();
  });

  it("should trigger browser prompt when deferredPrompt is available", async () => {
    const promptMock = vi.fn().mockResolvedValue(undefined);
    const deferredPrompt = {
      prompt: promptMock,
      userChoice: Promise.resolve({ outcome: "accepted" as const }),
    };

    const res = await executeFastInstall({
      isStandalone: false,
      deferredPrompt,
      onSuccess: onSuccessMock,
      dispatchEvent: dispatchEventMock,
    });

    expect(res).toBe("prompt_accepted");
    expect(promptMock).toHaveBeenCalled();
    expect(onSuccessMock).toHaveBeenCalledWith(
      expect.stringContaining("tự động cài đặt")
    );
    expect(dispatchEventMock).not.toHaveBeenCalled();
  });

  it("should dispatch guide events for iOS Safari and devices without prompt API", async () => {
    const res = await executeFastInstall({
      isStandalone: false,
      deferredPrompt: null,
      onSuccess: onSuccessMock,
      dispatchEvent: dispatchEventMock,
    });

    expect(res).toBe("fallback_guide_opened");
    expect(dispatchEventMock).toHaveBeenCalledTimes(2);
  });
});

