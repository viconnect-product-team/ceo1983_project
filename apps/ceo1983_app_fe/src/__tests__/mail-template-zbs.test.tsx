// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MailTemplateManager } from "../components/documents/MailTemplateManager";
import { fetchNestApi } from "@/lib/api-client";
import { toast } from "sonner";
import type { ZbsConfiguration } from "@/hooks/useZbsTemplateConfigs";

vi.mock("@/lib/api-client", () => ({ fetchNestApi: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("CRM template ZBS dispatch", () => {
  const api = vi.mocked(fetchNestApi);
  let stored: Record<string, ZbsConfiguration>;
  let zbsResponse: { success: boolean; message?: string };
  let sendError: Error | undefined;
  let saveError: Error | undefined;
  let loadError: Error | undefined;
  let emailResponse: { ok: boolean; message?: string };
  const sentTemplateIds: string[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    api.mockReset();
    stored = {
      FEE_NOTICE_ANNUAL: {
        templateId: "fee-template-id",
        parameterMap: { ho_ten: "full_name" },
      },
      NEW_MEMBER_THANKS: {
        templateId: "welcome-template-id",
        parameterMap: { ho_ten: "full_name" },
      },
    };
    zbsResponse = { success: true };
    emailResponse = { ok: true };
    sendError = saveError = loadError = undefined;
    sentTemplateIds.length = 0;
    api.mockImplementation(async (endpoint, options) => {
      if (endpoint === "/zalo/template-configs") {
        if (loadError) throw loadError;
        return { ok: true, templates: structuredClone(stored) };
      }
      if (endpoint.startsWith("/zalo/template-configs/")) {
        if (saveError) throw saveError;
        const code = decodeURIComponent(endpoint.split("/").at(-1)!);
        const config = JSON.parse(options?.body as string);
        stored[code] = config;
        return { ok: true, config };
      }
      if (endpoint === "/mail/send-test") return emailResponse;
      if (sendError) throw sendError;
      const body = JSON.parse(options?.body as string);
      sentTemplateIds.push(stored[body.templateCode].templateId);
      return zbsResponse;
    });
  });
  afterEach(cleanup);

  async function openZaloChannel() {
    render(<MailTemplateManager />);
    fireEvent.click(screen.getByRole("button", { name: /Zalo OA/ }));
    fireEvent.change(screen.getByPlaceholderText("SĐT Zalo nhận test..."), {
      target: { value: "0912345678" },
    });
    await waitFor(() =>
      expect(
        screen
          .getByRole("button", { name: "Lưu cấu hình ZBS" })
          .matches(":disabled"),
      ).toBe(false),
    );
  }

  const writes = () =>
    api.mock.calls.filter(([, options]) => options?.method === "PUT");
  const deliveries = () =>
    api.mock.calls.filter(([endpoint]) => endpoint === "/zalo/send-zns");

  it("sends the chosen CRM template and entered phone with server-side token resolution", async () => {
    localStorage.setItem("vba_zalo_access_token", "stale-browser-token");
    await openZaloChannel();
    fireEvent.click(
      screen.getByText("Thư Cảm Ơn & Chào Mừng Hội Viên Mới Gia Nhập"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Bắn Thông Báo Ngay" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledOnce());
    expect(deliveries()).toHaveLength(1);
    const [endpoint, options] = deliveries()[0];
    const body = JSON.parse(options?.body as string);
    expect(endpoint).toBe("/zalo/send-zns");
    expect(body).toMatchObject({
      templateCode: "NEW_MEMBER_THANKS",
      phone: "0912345678",
    });
    expect(body.templateData.full_name).toBeTruthy();
    expect(body).not.toHaveProperty("accessToken");
    expect(body).not.toHaveProperty("message");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("does not report success when Zalo rejects the template", async () => {
    zbsResponse = { success: false, message: "Template not approved" };
    await openZaloChannel();
    fireEvent.click(screen.getByRole("button", { name: "Bắn Thông Báo Ngay" }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Template not approved"),
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(
      JSON.parse(deliveries()[0][1]?.body as string).templateData,
    ).not.toHaveProperty("vietqr_url");
  });

  it("reports an HTTP/configuration failure without a success message", async () => {
    sendError = new Error("Chưa cấu hình template_id ZBS");
    await openZaloChannel();
    fireEvent.click(screen.getByRole("button", { name: "Bắn Thông Báo Ngay" }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Chưa cấu hình template_id ZBS"),
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("still sends ZBS when email fails in both-channel mode and reports the partial result", async () => {
    emailResponse = { ok: false, message: "Email unavailable" };
    render(<MailTemplateManager />);
    await waitFor(() =>
      expect(
        screen
          .getByRole("button", { name: "Lưu cấu hình ZBS" })
          .matches(":disabled"),
      ).toBe(false),
    );
    fireEvent.click(screen.getByRole("button", { name: "Bắn Thông Báo Ngay" }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Đã gửi qua ZBS"),
      ),
    );
    expect(api.mock.calls.map(([endpoint]) => endpoint)).toEqual([
      "/zalo/template-configs",
      "/mail/send-test",
      "/zalo/send-zns",
    ]);
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("persists a different ID and mapping per case and reloads them after remount", async () => {
    await openZaloChannel();
    fireEvent.change(screen.getByLabelText("Template ID đã được Zalo duyệt"), {
      target: { value: "fee-new-id" },
    });
    fireEvent.change(screen.getByLabelText("Tên biến ZBS 1"), {
      target: { value: "ten_hoi_vien" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu cấu hình ZBS" }));
    await waitFor(() =>
      expect(stored.FEE_NOTICE_ANNUAL.templateId).toBe("fee-new-id"),
    );
    fireEvent.click(
      screen.getByText("Thư Cảm Ơn & Chào Mừng Hội Viên Mới Gia Nhập"),
    );
    fireEvent.change(screen.getByLabelText("Template ID đã được Zalo duyệt"), {
      target: { value: "welcome-new-id" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu cấu hình ZBS" }));
    await waitFor(() =>
      expect(stored.NEW_MEMBER_THANKS.templateId).toBe("welcome-new-id"),
    );
    expect(writes().map(([endpoint]) => endpoint)).toEqual([
      "/zalo/template-configs/FEE_NOTICE_ANNUAL",
      "/zalo/template-configs/NEW_MEMBER_THANKS",
    ]);
    expect(stored.FEE_NOTICE_ANNUAL.parameterMap).toEqual({
      ten_hoi_vien: "full_name",
    });
    cleanup();
    await openZaloChannel();
    expect(
      (
        screen.getByLabelText(
          "Template ID đã được Zalo duyệt",
        ) as HTMLInputElement
      ).value,
    ).toBe("fee-new-id");
    fireEvent.click(
      screen.getByText("Thư Cảm Ơn & Chào Mừng Hội Viên Mới Gia Nhập"),
    );
    expect(
      (
        screen.getByLabelText(
          "Template ID đã được Zalo duyệt",
        ) as HTMLInputElement
      ).value,
    ).toBe("welcome-new-id");
  });

  it("keeps unsaved drafts separate while switching between cases", async () => {
    await openZaloChannel();
    fireEvent.change(screen.getByLabelText("Template ID đã được Zalo duyệt"), {
      target: { value: "unsaved-fee" },
    });
    fireEvent.click(
      screen.getByText("Thư Cảm Ơn & Chào Mừng Hội Viên Mới Gia Nhập"),
    );
    expect(
      (
        screen.getByLabelText(
          "Template ID đã được Zalo duyệt",
        ) as HTMLInputElement
      ).value,
    ).toBe("welcome-template-id");
    fireEvent.click(
      screen.getByText("Thông Báo Nộp Hội Phí Niên Liễm Định Kỳ"),
    );
    expect(
      (
        screen.getByLabelText(
          "Template ID đã được Zalo duyệt",
        ) as HTMLInputElement
      ).value,
    ).toBe("unsaved-fee");
    expect(writes()).toHaveLength(0);
  });

  it("saves current edits before sending the chosen case to the entered phone", async () => {
    await openZaloChannel();
    fireEvent.change(screen.getByLabelText("Template ID đã được Zalo duyệt"), {
      target: { value: "fee-updated-before-send" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu và gửi thử ZBS" }));
    await waitFor(() => expect(deliveries()).toHaveLength(1));
    expect(api.mock.calls.map(([endpoint]) => endpoint)).toEqual([
      "/zalo/template-configs",
      "/zalo/template-configs/FEE_NOTICE_ANNUAL",
      "/zalo/send-zns",
    ]);
    expect(sentTemplateIds).toEqual(["fee-updated-before-send"]);
    expect(JSON.parse(deliveries()[0][1]?.body as string).phone).toBe(
      "0912345678",
    );
  });

  it("blocks an empty ID, duplicate mappings and missing CRM variables with inline errors", async () => {
    await openZaloChannel();
    fireEvent.change(screen.getByLabelText("Template ID đã được Zalo duyệt"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Thêm ánh xạ" }));
    fireEvent.change(screen.getByLabelText("Tên biến ZBS 2"), {
      target: { value: "ho_ten" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu và gửi thử ZBS" }));
    await waitFor(() =>
      expect(
        screen.getByText("Nhập Template ID đã được Zalo duyệt cho mẫu này."),
      ).toBeTruthy(),
    );
    expect(
      screen.getAllByText(
        "Tên biến ZBS bị trùng. Mỗi biến chỉ được ánh xạ một lần.",
      ),
    ).toHaveLength(2);
    expect(
      screen.getByText("Chọn một biến có trong mẫu CRM này."),
    ).toBeTruthy();
    expect(
      screen.getByText("Kiểm tra lại cấu hình trước khi lưu").parentElement,
    ).toBe(document.activeElement);
    expect(writes()).toHaveLength(0);
    expect(deliveries()).toHaveLength(0);
  });

  it("supports adding and removing mapping rows and excludes payment QR from choices", async () => {
    await openZaloChannel();
    fireEvent.click(screen.getByRole("button", { name: "Thêm ánh xạ" }));
    fireEvent.change(screen.getByLabelText("Tên biến ZBS 2"), {
      target: { value: "so_tien" },
    });
    fireEvent.change(screen.getByLabelText("Lấy giá trị từ biến CRM 2"), {
      target: { value: "fee_amount" },
    });
    expect(screen.getByText("Giá trị gửi thử: 15,000,000")).toBeTruthy();
    expect(screen.queryByRole("option", { name: /vietqr_url/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Xóa ánh xạ 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Lưu cấu hình ZBS" }));
    await waitFor(() =>
      expect(stored.FEE_NOTICE_ANNUAL.parameterMap).toEqual({
        so_tien: "fee_amount",
      }),
    );
  });

  it("retains the draft and prevents delivery if saving fails", async () => {
    saveError = new Error("Database unavailable");
    await openZaloChannel();
    fireEvent.change(screen.getByLabelText("Template ID đã được Zalo duyệt"), {
      target: { value: "keep-this-draft" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu và gửi thử ZBS" }));
    await waitFor(() =>
      expect(
        screen.getByText(/Chưa lưu được: Database unavailable/),
      ).toBeTruthy(),
    );
    expect(
      (
        screen.getByLabelText(
          "Template ID đã được Zalo duyệt",
        ) as HTMLInputElement
      ).value,
    ).toBe("keep-this-draft");
    expect(deliveries()).toHaveLength(0);
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("offers retry and blocks writes when configuration cannot load", async () => {
    loadError = new Error("Cannot load configuration");
    render(<MailTemplateManager />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Tải lại cấu hình" }),
      ).toBeTruthy(),
    );
    expect(
      screen
        .getByLabelText("Template ID đã được Zalo duyệt")
        .matches(":disabled"),
    ).toBe(true);
    loadError = undefined;
    fireEvent.click(screen.getByRole("button", { name: "Tải lại cấu hình" }));
    await waitFor(() =>
      expect(
        (
          screen.getByLabelText(
            "Template ID đã được Zalo duyệt",
          ) as HTMLInputElement
        ).value,
      ).toBe("fee-template-id"),
    );
    expect(writes()).toHaveLength(0);
  });

  it("requires a recipient before saving and sending a test", async () => {
    await openZaloChannel();
    fireEvent.change(screen.getByLabelText("Số điện thoại nhận ZBS thử"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu và gửi thử ZBS" }));
    expect(
      screen.getByText("Nhập số điện thoại nhận tin ZBS thử."),
    ).toBeTruthy();
    expect(screen.getByLabelText("Số điện thoại nhận ZBS thử")).toBe(
      document.activeElement,
    );
    expect(writes()).toHaveLength(0);
    expect(deliveries()).toHaveLength(0);
  });
});
