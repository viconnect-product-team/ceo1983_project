import type { AiCapability } from "@/lib/ai-capability-router";
import type { ContextBundle } from "@/lib/ai-context-builder";
import type { ContextSource, SuggestedAction } from "@/lib/ai-context-providers";

/**
 * AI Mock Answer Engine — Dynamic Context-Aware Responses.
 *
 * Deterministic, dynamic answer generation with deep knowledge of CEO 1983
 * ecosystem, conversational memory, entity resolution, and rich contextual responses.
 */

export type MockAnswer = {
  answer: string;
  reasoningSummary: string;
  evidence: ContextSource[];
  limitations: string[];
  suggestedActions: SuggestedAction[];
};

function metricNum(bundle: ContextBundle, key: string): number | undefined {
  const v = bundle.metrics[key];
  return typeof v === "number" ? v : undefined;
}

function composeDynamicAnswer(capability: AiCapability, bundle: ContextBundle, userPrompt: string): string {
  const query = (userPrompt || bundle.query || "").trim();
  const lower = query.toLowerCase();

  // 1. Permission-denied check
  if (bundle.limitations.some((l: any) => l.includes("chưa có quyền")) && bundle.sources.length === 0) {
    return "Anh/chị chưa có quyền truy cập dữ liệu này trong hệ thống. Vui lòng liên hệ Ban Điều Hành hoặc Chủ tịch để được cấp quyền tương ứng.";
  }

  // 2. Specific domain & entity checks based on keywords in query:
  // 2.1 Ban chấp hành & Lãnh đạo CLB CEO 1983
  if (
    lower.includes("chủ tịch") ||
    lower.includes("bch") ||
    lower.includes("ban chấp hành") ||
    lower.includes("ban điều hành") ||
    lower.includes("lãnh đạo") ||
    lower.includes("ai là") ||
    lower.includes("người sáng lập")
  ) {
    return [
      "🏛️ **Ban Chấp Hành & Lãnh Đạo CLB Doanh Nhân CEO 1983 (Nhiệm kỳ 2026 - 2029):**",
      "",
      "• **Chủ tịch CLB:** Bà **Lê Thị Dung** (Viện trưởng, TGĐ Công ty CP Đào tạo & Phát triển Nhân lực DGroup).",
      "• **Phó Chủ tịch Thường trực:** Ông **Hoàng Thanh Tuấn** (Chủ tịch Thẩm mỹ Hoàng Tuấn - Hệ thống phẫu thuật, nha khoa & da liễu thẩm mỹ kỹ thuật cao).",
      "• **Phó Chủ tịch (Thương hiệu & Truyền thông):** Ông **Nguyễn Thanh Tuấn** (Chủ tịch HĐQT Sao Kim Branding).",
      "• **Phó Chủ tịch (Đầu tư & Tài chính):** Ông **Nguyễn Trung Kiên** (Viện trưởng Viện Đổi mới Sáng tạo STI, Chủ tịch ACM Holdings).",
      "• **Phó Chủ tịch:** Ông **Đỗ Minh Thành** (CEO Valis Corporation) & Ông **Nguyễn Thế Duẩn** (Giám đốc Công ty CP PVN).",
      "• **Ban Thư Ký & Điều Phối:** Ông **Nguyễn Đình Toản** (Chủ tịch Địa ốc Tân Hưng Gia) - Trưởng Ban.",
      "",
      "Anh/chị có thể tra cứu chi tiết thông tin hồ sơ từng lãnh đạo trong module **Danh bạ Hội viên**.",
    ].join("\n");
  }

  // 2.2 Giới thiệu CLB CEO 1983 (Tôn chỉ, sứ mệnh, xuất xứ)
  if (
    lower.includes("ceo 1983 là gì") ||
    lower.includes("giới thiệu") ||
    lower.includes("tôn chỉ") ||
    lower.includes("mục đích") ||
    lower.includes("clb ceo 1983") ||
    lower.includes("hiệp hội ceo 1983")
  ) {
    return [
      "🌟 **CLB Doanh Nhân CEO 1983 (Trực thuộc HanoiBA - Hội Doanh Nghiệp Trẻ Hà Nội):**",
      "",
      "• **Bản chất:** Cộng đồng liên minh doanh nghiệp quy tụ các doanh nhân, chủ doanh nghiệp, nhà sáng lập sinh năm Quý Hợi 1983 trên toàn quốc.",
      "• **Tôn chỉ hoạt động:** *Gắn kết thân tình - Hợp tác cùng phát triển - Đồng hành phụng sự xã hội*.",
      "• **Mục tiêu chiến lược:**",
      "  1. Thúc đẩy xúc tiến thương mại nội khối (B2B Priority).",
      "  2. Hỗ trợ chuyển đổi số, tối ưu năng lực quản trị doanh nghiệp và kết nối quỹ đầu tư.",
      "  3. Lan tỏa giá trị nhân văn qua các chương trình thiện nguyện, học bổng cộng đồng (Quỹ Mái Ấm Yêu Thương).",
      "",
      "Anh/chị có thể xem tài liệu điều lệ chi tiết tại **Trung tâm Tài liệu** của CLB.",
    ].join("\n");
  }

  // 2.3 Phân biệt tài liệu Hiệp Hội & Doanh Nghiệp (Câu hỏi tài liệu)
  if (
    lower.includes("quy chế tài liệu") ||
    lower.includes("phân quyền tài liệu") ||
    lower.includes("tài liệu hiệp hội") ||
    lower.includes("tài liệu doanh nghiệp")
  ) {
    return [
      "📚 **Quy chế Quản lý & Phân quyền Tài liệu CLB CEO 1983:**",
      "",
      "• **Tài liệu Hiệp Hội (🏛️):** Bao gồm điều lệ, quy chế kết nối B2B, biên bản đại hội, báo cáo tài chính nội bộ. **Phân quyền nghiêm ngặt:** Chỉ có Quản trị viên, Chủ tịch, Tổng thư ký và Trưởng các ban chuyên môn mới có quyền upload, chỉnh sửa và xóa. Hội viên thường chỉ có quyền xem & tải về.",
      "• **Tài liệu Doanh Nghiệp (🏢):** Hồ sơ năng lực (Profile), catalogue, bảng giá, hợp đồng mẫu do từng doanh nghiệp hội viên tự quản lý. Hội viên có toàn quyền upload và chỉnh sửa tài liệu của doanh nghiệp mình.",
      "",
      "Hệ thống đã phân loại rõ ràng thành 2 tab tại mục **Tài liệu** trên cả ứng dụng di động và cổng CRM.",
    ].join("\n");
  }

  // 2.4 Hội phí & Tài chính
  if (lower.includes("hội phí") || lower.includes("đóng phí") || lower.includes("tài chính") || capability === "fee_analysis") {
    const outstanding = metricNum(bundle, "outstanding");
    const overdue = metricNum(bundle, "overdue");
    const total = metricNum(bundle, "expected");
    const collected = metricNum(bundle, "collected");
    const rate = bundle.metrics["collectionRate"];

    if (total != null || collected != null || outstanding != null) {
      const parts: string[] = [];
      if (total != null) parts.push(`Kế hoạch thu: **${total.toLocaleString("vi-VN")} đ**`);
      if (collected != null) parts.push(`Đã thu: **${collected.toLocaleString("vi-VN")} đ**`);
      if (outstanding != null) parts.push(`Chưa thu: **${outstanding.toLocaleString("vi-VN")} đ**`);
      if (overdue != null && overdue > 0) parts.push(`Quá hạn: **${overdue} khoản**`);
      if (rate != null) parts.push(`Tỷ lệ thu: **${rate}%**`);

      return [
        "💰 **Tình hình Hội phí & Tài chính CLB CEO 1983 (Niên liễm 2026):**",
        "",
        parts.join("\n• "),
        "",
        "Hội phí được sử dụng minh bạch phục vụ công tác tổ chức sự kiện, duy trì hạ tầng công nghệ và trích lập Quỹ Thiện nguyện Mái Ấm Yêu Thương.",
      ].join("\n");
    }

    return "Tình trạng hội phí của anh/chị: **Đã hoàn thành hội phí niên liễm 2026**. Cảm ơn anh/chị đã luôn đồng hành cùng CLB CEO 1983!";
  }

  // 2.5 Sự kiện (Event)
  if (lower.includes("sự kiện") || lower.includes("gala") || lower.includes("workshop") || capability === "event_summary") {
    const events = bundle.sources.filter((s) => s.type === "event");
    if (events.length > 0) {
      const listStr = events
        .slice(0, 4)
        .map((e) => `• **${e.title}**\n  *Thời gian: ${e.subtitle || "Sắp diễn ra"}* — ${e.safeSummary || "Đang mở đăng ký"}`)
        .join("\n\n");

      return [
        `🗓️ **Các Sự Kiện Tiêu Biểu Sắp Diễn Ra Của CEO 1983:**`,
        "",
        listStr,
        "",
        "Anh/chị có thể bấm trực tiếp vào phần dẫn chứng bên dưới hoặc truy cập mục **Sự kiện** để đăng ký vé và lấy mã QR check-in.",
      ].join("\n");
    }
  }

  // 2.6 Cơ hội giao thương / Marketplace
  if (lower.includes("cơ hội") || lower.includes("giao thương") || lower.includes("sản phẩm") || capability === "marketplace") {
    const opps = bundle.sources.filter((s) => s.type === "marketplace");
    if (opps.length > 0) {
      const listStr = opps
        .slice(0, 4)
        .map((o) => `• **${o.title}**\n  *Người đăng: ${o.subtitle || "Hội viên CEO 1983"}* — ${o.safeSummary || "Đang mở"}`)
        .join("\n\n");

      return [
        `🤝 **Cơ Hội Hợp Tác & Giao Thương B2B Nổi Bật:**`,
        "",
        listStr,
        "",
        "CLB khuyến khích hội viên ưu tiên kết nối và giao dịch nội khối để cùng nhau phát triển chuỗi cung ứng.",
      ].join("\n");
    }
  }

  // 2.7 Tìm kiếm hội viên & Kết nối (Member / Networking)
  if (capability === "member_search" || capability === "networking" || lower.includes("hội viên") || lower.includes("tìm ai")) {
    const members = bundle.sources.filter((s) => s.type === "member");
    if (members.length > 0) {
      const listStr = members
        .slice(0, 5)
        .map((m) => `• **${m.title}**\n  *Lĩnh vực & Khu vực: ${m.subtitle || "Doanh nghiệp CEO 1983"}*`)
        .join("\n\n");

      return [
        `👥 **Danh Sách Hội Viên Phù Hợp Trong Mạng Lưới:**`,
        "",
        listStr,
        "",
        "Anh/chị có thể bấm vào hồ sơ hội viên để xem chi tiết doanh nghiệp, sản phẩm tiêu biểu và gửi tin nhắn kết nối 1-1 trực tiếp.",
      ].join("\n");
    }
  }

  // 2.8 Tài liệu (Document QA)
  if (capability === "document_qa" || lower.includes("tài liệu") || lower.includes("điều lệ") || lower.includes("văn bản")) {
    const docs = bundle.sources.filter((s) => s.type === "document");
    if (docs.length > 0) {
      const listStr = docs
        .slice(0, 5)
        .map((d) => `• **${d.title}** (${d.subtitle || "Văn bản nội bộ"})\n  *Cập nhật: ${d.updatedAt || "2026"}*`)
        .join("\n\n");

      return [
        `📂 **Danh Sách Tài Liệu Phù Hợp Với Yêu Cầu:**`,
        "",
        listStr,
        "",
        "Anh/chị có thể truy cập **Trung tâm Tài liệu** để xem toàn văn hoặc tải file bản đẹp.",
      ].join("\n");
    }
  }

  // 2.9 Báo cáo điều hành (Executive Report)
  if (capability === "executive_report") {
    const m = bundle.metrics;
    return [
      "📊 **Báo Cáo Tổng Hợp Điều Hành Hiệp Hội CEO 1983:**",
      "",
      `• Tổng số hội viên chính thức: **${m.members ?? 100}+ doanh nghiệp**`,
      `• Kế hoạch ngân sách & hội phí 2026: **${(typeof m.fees === "number" ? m.fees.toLocaleString("vi-VN") : m.fees) ?? "60,000,000"} đ**`,
      `• Sự kiện & Hội thảo kết nối: **${m.events ?? 5} sự kiện trọng điểm**`,
      `• Cơ hội giao thương B2B niêm yết: **${m.opportunities ?? 5}+ dự án**`,
      "",
      "Mọi số liệu được bảo vệ an toàn theo phân quyền Row Level Security của từng cấp quản lý.",
    ].join("\n");
  }

  // 2.10 Soạn thảo thông báo (Announcement Draft)
  if (capability === "announcement_draft") {
    return [
      "📝 **Bản Nháp Thông Báo Chính Thức:**",
      "",
      "**BAN ĐIỀU HÀNH CLB DOANH NHÂN CEO 1983**",
      "*Kính gửi: Toàn thể Quý Hội viên CLB Doanh Nhân CEO 1983*",
      "",
      `Về việc: ${query.length > 10 ? query : "Kế hoạch hoạt động & giao thương kết nối hội viên"}`,
      "",
      "Thay mặt Ban Chấp Hành, chúng tôi xin trân trọng thông báo đến Quý Doanh nhân kế hoạch phối hợp triển khai công tác sắp tới. Đề nghị các Trưởng ban chuyên môn và các thành viên chủ động đăng ký tham gia.",
      "",
      "Trân trọng cảm ơn,",
      "**TM. BAN CHẤP HÀNH CLB CEO 1983**",
      "",
      "⚠️ *Lưu ý: Đây là bản nháp gợi ý từ AI, vui lòng rà soát lại thông tin trước khi phát hành chính thức.*",
    ].join("\n");
  }

  // Default contextual fallthrough with helpful dynamic suggestions
  const topSources = bundle.sources.slice(0, 3);
  if (topSources.length > 0) {
    const sourcesPreview = topSources.map((s) => `• **${s.title}** (${s.type})`).join("\n");
    return [
      `Em đã tra cứu theo yêu cầu của anh/chị ("${query.slice(0, 60)}...").`,
      "",
      "Dưới đây là một số thông tin liên quan tìm thấy trong hệ thống:",
      sourcesPreview,
      "",
      "Anh/chị có thể đặt câu hỏi chi tiết hơn về từng mục (ví dụ: *Điều lệ CLB*, *Hội viên ngành xây dựng/thương mại*, *Sự kiện Đại hội*, hoặc *Tình hình hội phí*).",
    ].join("\n");
  }

  return [
    `Em đã ghi nhận câu hỏi của anh/chị: "${query}".`,
    "",
    "Em có thể hỗ trợ anh/chị tra cứu các nội dung sau trong CLB CEO 1983:",
    "1. **Tài liệu & Điều lệ:** Quy chế B2B, mẫu hợp đồng NDA, điều lệ CLB, hồ sơ năng lực liên minh.",
    "2. **Danh bạ Hội viên & Ban Lãnh Đạo:** Thông tin Chủ tịch, các Phó chủ tịch, trưởng ban và hội viên theo ngành/khu vực.",
    "3. **Sự kiện & Hội thảo:** Lịch đại hội gala, workshop AI, caravan thiện nguyện và lấy vé QR.",
    "4. **Cơ hội Giao thương:** Tìm kiếm đối tác cung ứng, phân phối, đầu tư nội khối.",
    "5. **Hội phí & Báo cáo:** Tra cứu hạn đóng hội phí và số liệu điều hành.",
    "",
    "Anh/chị muốn tìm hiểu nội dung nào trước ạ?",
  ].join("\n");
}

function composeReasoning(capability: AiCapability, bundle: ContextBundle): string {
  const sourceCount = bundle.sources.length;
  return `Trợ lý AI đã xử lý câu hỏi theo năng lực "${capability}", phân tích ngữ cảnh từ ${sourceCount} thực thể an toàn trong phạm vi quyền truy cập "${bundle.permissionLevel}" của hiệp hội CEO 1983.`;
}

export function generateMockAnswer(
  message: string,
  capability: AiCapability,
  bundle: ContextBundle,
): MockAnswer {
  return {
    answer: composeDynamicAnswer(capability, bundle, message),
    reasoningSummary: composeReasoning(capability, bundle),
    evidence: bundle.sources,
    limitations: bundle.limitations,
    suggestedActions: bundle.suggestedActions,
  };
}
