import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { relTime, fmtDate } from "./shared";
import { fetchNestApiFromServer } from "@/lib/api-client";

// ---------- News ----------
export type NewsItem = {
  id: string;
  title: string;
  category: string;
  author: string;
  excerpt: string;
  time: string;
  views: number;
  image?: string;
};

export const DEFAULT_CEO1983_NEWS: NewsItem[] = [
  {
    id: "ceo1983-news-01",
    title: "Hiệp hội CEO 1983 phát động chương trình Xúc tiến Thương mại & Kết nối Giao thương Toàn diện 2026",
    category: "Giao thương B2B",
    author: "Ban Thư ký & Ban Truyền thông",
    excerpt: "Chương trình trọng điểm quy tụ hơn 200+ doanh nghiệp hội viên cùng các phiên kết nối 1-1, ký kết thỏa thuận hợp tác thương mại đa ngành và mở rộng chuỗi cung ứng nội khối.",
    time: "2 giờ trước",
    views: 428,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "ceo1983-news-02",
    title: "Đại hội Hội viên thường niên CLB CEO 1983: Bầu cử Ban Chấp Hành nhiệm kỳ 2026 - 2029",
    category: "Hoạt động CLB",
    author: "Ban Chấp Hành CLB",
    excerpt: "Đánh giá kết quả hoạt động năm qua và thông qua nghị quyết nhiệm kỳ mới với nhiều chính sách hỗ trợ tăng trưởng doanh thu và bảo trợ thương hiệu cho hội viên.",
    time: "1 ngày trước",
    views: 315,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "ceo1983-news-03",
    title: "Chương trình Caravan Thiện nguyện 2026: Trao 200 suất học bổng cho học sinh nghèo vượt khó",
    category: "Thiện nguyện",
    author: "Ban Thiện nguyện",
    excerpt: "Hành trình lan tỏa yêu thương của cộng đồng doanh nhân tuổi Hợi 1983, mang hơi ấm và cơ hội học tập phát triển tài năng đến các điểm trường vùng cao.",
    time: "3 ngày trước",
    views: 289,
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "ceo1983-news-04",
    title: "Diễn đàn Kinh tế & Chuyển đổi số Doanh nghiệp: Tối ưu hóa chuỗi cung ứng bằng Trí tuệ Nhân tạo",
    category: "Tin doanh nghiệp",
    author: "Ban Xúc tiến Thương mại",
    excerpt: "Chuyên gia công nghệ hàng đầu chia sẻ giải pháp tự động hóa vận hành, quản trị khách hàng CRM và giải pháp phân tích dữ liệu chuyên sâu cho lãnh đạo CEO.",
    time: "5 ngày trước",
    views: 512,
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "ceo1983-news-05",
    title: "Giải Golf Doanh nhân CEO 1983 Championship: Giao lưu thể thao & kết nối đối tác chiến lược",
    category: "Hoạt động CLB",
    author: "Ban Thể thao & Sự kiện",
    excerpt: "Sân chơi thể thao đẳng cấp kết hợp dạ tiệc Gala vinh danh các tay golf xuất sắc và tạo điều kiện xúc tiến các thương vụ đầu tư quy mô lớn.",
    time: "1 tuần trước",
    views: 376,
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "ceo1983-news-06",
    title: "Doanh nghiệp thành viên CEO 1983 ra mắt dòng sản phẩm tiêu chuẩn xuất khẩu sang thị trường Châu Âu",
    category: "Tin doanh nghiệp",
    author: "Ban Truyền thông",
    excerpt: "Khẳng định chất lượng sản phẩm thương hiệu Việt trên bản đồ quốc tế, mở ra cơ hội hợp tác phân phối độc quyền và gia công liên kết cho các hội viên CLB.",
    time: "2 tuần trước",
    views: 640,
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80",
  },
];

const DEFAULT_NEWS_IMAGES = [
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80",
];

export const listNews = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }: any): Promise<NewsItem[]> => {
    try {
      const token = context?.token;
      const items = await fetchNestApiFromServer<any[]>("/content/news", token);
      const serverMapped: NewsItem[] = (items ?? []).map((n: any, idx: number) => ({
        id: n.id,
        title: n.title,
        category: n.category ?? "",
        author: n.author ?? "",
        excerpt: n.excerpt ?? "",
        time: relTime(n.time || n.created_at || n.createdAt),
        views: n.views ?? 0,
        image: n.image || n.thumbnail || n.cover_url || n.cover_image || DEFAULT_NEWS_IMAGES[idx % DEFAULT_NEWS_IMAGES.length],
      }));

      // Combine server news with curated defaults so there are always at least 5 rich articles
      const combined: NewsItem[] = [...serverMapped];
      for (const defItem of DEFAULT_CEO1983_NEWS) {
        if (!combined.some((item) => item.id === defItem.id || item.title === defItem.title)) {
          combined.push(defItem);
        }
      }
      return combined;
    } catch {
      return DEFAULT_CEO1983_NEWS;
    }
  });

export type LibraryDoc = {
  id: string;
  name: string;
  category: string;
  committee?: string;
  size: string;
  type: string;
  time: string;
  url?: string;
  description?: string;
  chapters?: string[];
  docScope?: "association" | "enterprise";
  enterpriseName?: string;
  enterpriseId?: string;
};

export const DEFAULT_CEO1983_DOCS: LibraryDoc[] = [
  {
    id: "doc-1",
    name: "Điều lệ hoạt động CLB Doanh Nhân CEO 1983 (Ban hành 2026)",
    category: "Pháp lý & Điều lệ",
    committee: "Ban Điều Hành",
    size: "3.2 MB",
    type: "PDF",
    time: "15/08/2026",
    description: "Văn bản pháp lý nền tảng quy định tôn chỉ, mục đích, cơ cấu điều hành và quyền lợi cốt lõi của các thành viên CLB Doanh Nhân CEO 1983.",
    chapters: [
      "Chương I: Tôn chỉ, mục đích và tư cách pháp nhân",
      "Chương II: Tiêu chuẩn, quyền lợi và nghĩa vụ hội viên",
      "Chương III: Tổ chức bộ máy Ban Thường Trực và Ban Chấp Hành",
      "Chương IV: Quản lý tài chính, quỹ tương trợ và xúc tiến thương mại",
    ],
  },
  {
    id: "doc-2",
    name: "Quy chế kết nối giao thương B2B & Xúc tiến thương mại nội khối",
    category: "Quy chế nội bộ",
    committee: "Ban Xúc Tiến",
    size: "2.4 MB",
    type: "PDF",
    time: "02/09/2026",
    description: "Quy chuẩn văn hóa trao đổi cơ hội kinh doanh, giới thiệu sản phẩm và bảo vệ quyền lợi hội viên trong các giao dịch hợp tác đầu tư.",
    chapters: [
      "Điều 1: Nguyên tắc ưu tiên kết nối và giao dịch nội khối",
      "Điều 2: Tiêu chuẩn xác thực sản phẩm, dịch vụ niêm yết",
      "Điều 3: Cơ chế phản hồi, đánh giá tín nhiệm đối tác",
      "Điều 4: Thẩm định hợp đồng và giải quyết tranh chấp",
    ],
  },
  {
    id: "doc-3",
    name: "Mẫu hợp đồng hợp tác giao thương B2B & Thỏa thuận bảo mật thông tin NDA",
    category: "Hợp đồng & Văn bản mẫu",
    committee: "Ban Thư Ký",
    size: "1.2 MB",
    type: "DOCX",
    time: "05/09/2026",
    description: "Biểu mẫu pháp lý chuẩn chỉnh do Ban Thư ký & Ban Pháp chế thẩm định, hỗ trợ hội viên ký kết hợp tác thương mại an toàn tuyệt đối.",
  },
  {
    id: "doc-4",
    name: "Bảng theo dõi thu chi & Quỹ tương trợ hội viên năm 2026",
    category: "Báo cáo tài chính",
    committee: "Ban Tài Chính",
    size: "950 KB",
    type: "XLSX",
    time: "10/09/2026",
    description: "Báo cáo minh bạch thu chi hội phí niên liễm, các khoản tài trợ và phân bổ quỹ thiện nguyện xã hội của CLB.",
  },
  {
    id: "doc-5",
    name: "Kế hoạch chiến dịch truyền thông & Nhận diện thương hiệu CLB CEO 1983",
    category: "Truyền thông & Sự kiện",
    committee: "Ban Truyền Thông",
    size: "14.2 MB",
    type: "PPTX",
    time: "12/09/2026",
    description: "Slide thuyết trình tổng thể định hướng truyền thông đa kênh, quảng bá hình ảnh doanh nghiệp hội viên trên báo chí và mạng xã hội.",
  },
  {
    id: "doc-6",
    name: "Quy trình kết nạp & Thẩm định hồ sơ hội viên mới",
    category: "Quy chế nội bộ",
    committee: "Ban Thành Viên",
    size: "820 KB",
    type: "DOCX",
    time: "18/09/2026",
    description: "Quy chuẩn các bước tiếp nhận hồ sơ, thẩm định doanh nghiệp và quy trình cấp thẻ hội viên VIP CEO 1983.",
  },
  {
    id: "doc-7",
    name: "Kế hoạch chương trình từ thiện Mái Ấm Yêu Thương 2026",
    category: "Thiện nguyện & Xã hội",
    committee: "Ban Thiện Nguyện",
    size: "2.1 MB",
    type: "PDF",
    time: "20/09/2026",
    description: "Kế hoạch chi tiết hành trình cứu trợ, trao học bổng và xây trường vùng cao do CLB Doanh Nhân CEO 1983 khởi xướng.",
  },
  {
    id: "doc-8",
    name: "Sổ tay hướng dẫn sử dụng ứng dụng CEO 1983 & Thẻ VIP NFC",
    category: "Hướng dẫn & Cẩm nang",
    committee: "Biểu mẫu chung",
    size: "4.8 MB",
    type: "PDF",
    time: "22/09/2026",
    description: "Cẩm nang hướng dẫn chạm thẻ thông minh trao đổi danh thiếp, quét mã QR sự kiện, đăng tải sản phẩm và trao đổi cơ hội kinh doanh.",
  },
  {
    id: "doc-9",
    name: "Hồ sơ năng lực liên minh doanh nghiệp CEO 1983 - Profile 2026",
    category: "Hồ sơ doanh nghiệp",
    committee: "Ban Điều Hành",
    size: "8.5 MB",
    type: "PDF",
    time: "25/09/2026",
    description: "Tập hợp năng lực sản xuất, giải pháp công nghệ, tiềm lực tài chính và mạng lưới đối tác của hơn 100 doanh nghiệp tiêu biểu trong CLB.",
  },
];

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }: any): Promise<LibraryDoc[]> => {
    try {
      const token = context?.token;
      const res = await fetchNestApiFromServer<any[]>("/documents", token);
      if (Array.isArray(res) && res.length > 0) {
        return res.map((d: any) => ({
          id: d.id,
          name: d.name || d.title,
          category: d.category ?? "Tài liệu",
          committee: d.committee || d.department || "Biểu mẫu chung",
          size: d.size ?? "2.4 MB",
          type: (d.type || "PDF").toUpperCase(),
          time: fmtDate(d.uploadedAt || d.uploaded_at) ?? "10/08/2026",
          description: d.description || d.summary,
          url: d.url || d.fileUrl || d.file_url || d.filePath || d.file_path || "",
          chapters: d.chapters,
          docScope: d.docScope || (d.enterpriseName ? "enterprise" : "association"),
          enterpriseName: d.enterpriseName || d.enterprise_name,
          enterpriseId: d.enterpriseId || d.enterprise_id,
        }));
      }
    } catch {
      // ignore
    }
    return DEFAULT_CEO1983_DOCS;
  });

// ---------- Perks / Tiện ích ----------
export type Perk = {
  id: string;
  title: string;
  category: string;
  partner: string;
  summary: string;
  description: string;
  discount: string;
  icon: string;
  link: string;
  validUntil: string | null;
};

function mapPerk(p: any): Perk {
  return {
    id: p.id,
    title: p.title,
    category: p.category ?? "",
    partner: p.partner ?? "",
    summary: p.summary ?? "",
    description: p.description ?? "",
    discount: p.discount ?? "",
    icon: p.icon ?? "Gift",
    link: p.link ?? "",
    validUntil: fmtDate(p.validUntil || p.valid_until),
  };
}

export const listPerks = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }: any): Promise<Perk[]> => {
    try {
      const token = context?.token;
      const items = await fetchNestApiFromServer<any[]>("/content/perks", token);
      return (items ?? []).map((r: any) => mapPerk(r));
    } catch {
      return [];
    }
  });

export const getPerk = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(64) }).parse(d))
  .handler(async ({ data, context }: any): Promise<Perk | null> => {
    try {
      const token = context?.token;
      const row = await fetchNestApiFromServer<any>("/content/perks/" + data.id, token);
      return row ? mapPerk(row) : null;
    } catch {
      return null;
    }
  });
