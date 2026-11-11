// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MailTemplateManager } from "../components/documents/MailTemplateManager";
import { fetchNestApi } from "@/lib/api-client";
import { toast } from "sonner";

vi.mock("@/lib/api-client", () => ({ fetchNestApi: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("CRM template ZBS dispatch", () => {
  const api = vi.mocked(fetchNestApi);

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    api.mockReset();
    api.mockResolvedValue({ success: true });
  });
  afterEach(cleanup);

  function openZaloChannel() {
    render(<MailTemplateManager />);
    fireEvent.click(screen.getByRole("button", { name: /Zalo OA/ }));
    fireEvent.change(screen.getByPlaceholderText("SĐT Zalo nhận test..."), {
      target: { value: "0912345678" },
    });
  }

  it("sends the chosen CRM template and entered phone with server-side token resolution", async () => {
    localStorage.setItem("vba_zalo_access_token", "stale-browser-token");
    openZaloChannel();
    fireEvent.click(screen.getByText("Thư Cảm Ơn & Chào Mừng Hội Viên Mới Gia Nhập"));
    fireEvent.click(screen.getByRole("button", { name: "Bắn Thông Báo Ngay" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledOnce());
    expect(api).toHaveBeenCalledOnce();
    const [endpoint, options] = api.mock.calls[0];
    const body = JSON.parse(options?.body as string);
    expect(endpoint).toBe("/zalo/send-zns");
    expect(body).toMatchObject({ templateCode: "NEW_MEMBER_THANKS", phone: "0912345678" });
    expect(body.templateData.full_name).toBeTruthy();
    expect(body).not.toHaveProperty("accessToken");
    expect(body).not.toHaveProperty("message");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("does not report success when Zalo rejects the template", async () => {
    api.mockResolvedValue({ success: false, message: "Template not approved" });
    openZaloChannel();
    fireEvent.click(screen.getByRole("button", { name: "Bắn Thông Báo Ngay" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Template not approved"));
    expect(toast.success).not.toHaveBeenCalled();
    expect(JSON.parse(api.mock.calls[0][1]?.body as string).templateData).not.toHaveProperty("vietqr_url");
  });

  it("reports an HTTP/configuration failure without a success message", async () => {
    api.mockRejectedValue(new Error("Chưa cấu hình template_id ZBS"));
    openZaloChannel();
    fireEvent.click(screen.getByRole("button", { name: "Bắn Thông Báo Ngay" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Chưa cấu hình template_id ZBS"));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("still sends ZBS when email fails in both-channel mode and reports the partial result", async () => {
    api.mockImplementation(async (endpoint) => endpoint === "/mail/send-test"
      ? { ok: false, message: "Email unavailable" }
      : { success: true });
    render(<MailTemplateManager />);
    fireEvent.click(screen.getByRole("button", { name: "Bắn Thông Báo Ngay" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Đã gửi qua ZBS")));
    expect(api.mock.calls.map(([endpoint]) => endpoint)).toEqual(["/mail/send-test", "/zalo/send-zns"]);
    expect(toast.success).not.toHaveBeenCalled();
  });
});
