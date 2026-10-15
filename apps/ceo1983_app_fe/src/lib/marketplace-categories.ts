/**
 * Hệ thống Danh mục Marketplace Đồng nhất Toàn diện cho CLB CEO 1983 (Mobile App & CRM Web)
 * - Tự động trích xuất phân loại mới do người dùng nhập và hiển thị động lên thanh danh mục
 * - Đảm bảo phân loại dịch vụ, sản phẩm và các ngành nghề mới luôn đồng bộ tức thì
 */

export interface MarketplaceCategoryDef {
  id: string;
  label: string;
  aliases: string[];
}

export const STANDARD_MARKETPLACE_CATEGORIES: MarketplaceCategoryDef[] = [
  {
    id: "tech",
    label: "Công nghệ & Chuyển đổi số",
    aliases: ["cong nghe", "phan mem", "it", "tech", "technology", "software", "mk.cat.tech", "chuyen doi so", "so hoa"],
  },
  {
    id: "realestate",
    label: "Bất động sản & Xây dựng",
    aliases: ["bat dong san", "xay dung", "realestate", "property", "construction", "mk.cat.realestate", "kien truc", "noi that"],
  },
  {
    id: "manufacturing",
    label: "Sản xuất & Công nghiệp",
    aliases: ["san xuat", "cong nghiep", "manufacturing", "industry", "production", "che bien", "gia cong", "co khi"],
  },
  {
    id: "services",
    label: "Dịch vụ & Tư vấn doanh nghiệp",
    aliases: ["dich vu", "tu van", "service", "services", "consult", "consulting", "mk.cat.service", "mk.cat.consult", "phap ly", "marketing", "truyen thong"],
  },
  {
    id: "finance",
    label: "Tài chính & Đầu tư",
    aliases: ["tai chinh", "dau tu", "finance", "investment", "banking", "bao hiem", "chung khoan", "ke toan", "kiem toan"],
  },
  {
    id: "retail",
    label: "Thương mại & Tiêu dùng",
    aliases: ["thuong mai", "ban le", "retail", "consumer", "fmcg", "commerce", "trade", "mk.cat.product", "hang tieu dung", "thoi trang"],
  },
  {
    id: "logistics",
    label: "Logistics & Vận tải",
    aliases: ["logistics", "van tai", "kho van", "giao nhan", "supply chain", "xuat nhap khau"],
  },
  {
    id: "education",
    label: "Giáo dục & Đào tạo",
    aliases: ["giao duc", "dao tao", "education", "training", "khoa hoc", "huan luyen"],
  },
  {
    id: "healthcare",
    label: "Y tế & Sức khỏe",
    aliases: ["y te", "suc khoe", "health", "healthcare", "duoc pham", "tham my", "spa"],
  },
];

export function normalizeCategoryText(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/&/g, "va")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Trích xuất danh sách danh mục động từ sản phẩm thực tế kết hợp danh mục chuẩn.
 * Khi có bất kỳ sản phẩm nào có phân loại mới (VD: Dịch vụ pháp lý, Nông sản...), phân loại đó sẽ lập tức xuất hiện trên giao diện.
 */
export function getDynamicMarketplaceCategories(products: Array<{ category?: string }>): string[] {
  const result: string[] = STANDARD_MARKETPLACE_CATEGORIES.map((c) => c.label);
  const seen = new Set<string>(result.map((l) => normalizeCategoryText(l)));

  if (Array.isArray(products)) {
    for (const p of products) {
      const raw = p?.category?.trim();
      if (!raw) continue;
      
      // Nếu là mã dịch i18n kiểu mk.cat.tech
      let displayLabel = raw;
      if (raw.startsWith("mk.cat.")) {
        const foundStd = STANDARD_MARKETPLACE_CATEGORIES.find((s) => s.aliases.includes(raw));
        if (foundStd) {
          displayLabel = foundStd.label;
        }
      }

      const norm = normalizeCategoryText(displayLabel);
      if (!norm || seen.has(norm)) continue;

      // Kiểm tra có trùng alias với danh mục chuẩn nào không
      const matched = STANDARD_MARKETPLACE_CATEGORIES.some((c) => {
        return c.aliases.some((a) => normalizeCategoryText(a) === norm) || normalizeCategoryText(c.label) === norm;
      });

      if (!matched) {
        seen.add(norm);
        result.push(displayLabel);
      }
    }
  }

  return result;
}

/**
 * Kiểm tra sản phẩm có khớp với danh mục lọc hay không.
 */
export function matchProductCategory(productCategory: string | undefined | null, filter: string): boolean {
  if (!filter || filter === "all") return true;
  if (!productCategory) return false;

  const pNorm = normalizeCategoryText(productCategory);
  const fNorm = normalizeCategoryText(filter);
  if (pNorm === fNorm || pNorm.includes(fNorm) || fNorm.includes(pNorm)) return true;

  // Kiểm tra qua nhóm danh mục chuẩn và alias
  for (const std of STANDARD_MARKETPLACE_CATEGORIES) {
    const isStdFilter =
      normalizeCategoryText(std.id) === fNorm ||
      normalizeCategoryText(std.label) === fNorm ||
      std.aliases.some((a) => normalizeCategoryText(a) === fNorm);

    if (isStdFilter) {
      const matchesProduct =
        normalizeCategoryText(std.label) === pNorm ||
        std.aliases.some((a) => normalizeCategoryText(a) === pNorm || pNorm.includes(normalizeCategoryText(a)));
      if (matchesProduct) return true;
    }
  }

  return false;
}
