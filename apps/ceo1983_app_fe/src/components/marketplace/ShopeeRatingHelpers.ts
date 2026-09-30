// Helper module calculating product reviews and company rating percentages in Shopee style

export interface ProductReviewItem {
  id: string;
  productId: string;
  sellerId?: string;
  companyName: string;
  userName: string;
  userRole?: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  createdAt: string;
  comment: string;
  productVariant?: string;
  images?: string[];
  sellerReply?: {
    replyText: string;
    repliedAt: string;
  };
  likesCount?: number;
}

const DEFAULT_REVIEWS_SEED: ProductReviewItem[] = [
  {
    id: "rev-seed-1",
    productId: "seed-prod-1",
    companyName: "Công ty Cổ phần Giải Pháp Số VBC",
    userName: "Đặng Quang Huy",
    userRole: "CEO - TechVina Group (Hội viên VIP)",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    createdAt: "2 ngày trước",
    productVariant: "Gói Triển Khai Doanh Nghiệp 1 Năm",
    comment: "Sản phẩm giải pháp rất chuyên nghiệp, đội ngũ kỹ thuật hỗ trợ tận tình và bàn giao đúng tiến độ. Đặc biệt chính sách ưu đãi dành riêng cho hội viên CEO 1983 cực kỳ tốt. Rất hài lòng và sẽ hợp tác lâu dài!",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80"
    ],
    sellerReply: {
      replyText: "Dạ em chân thành cảm ơn Anh Huy và TechVina đã tin tưởng đồng hành cùng bên em. Chúc doanh nghiệp của Anh luôn bứt phá thành công rực rỡ trong năm 2026 ạ!",
      repliedAt: "1 ngày trước"
    },
    likesCount: 18
  },
  {
    id: "rev-seed-2",
    productId: "seed-prod-1",
    companyName: "Công ty Cổ phần Giải Pháp Số VBC",
    userName: "Trần Thu Hà",
    userRole: "Giám Đốc Tài Chính - VietGlobal (Ban Tài Chính)",
    userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    createdAt: "5 ngày trước",
    productVariant: "Hạng Mục Tiêu Chuẩn B2B",
    comment: "Quy trình hợp đồng pháp lý rất minh bạch, xuất hóa đơn VAT đầy đủ ngay trong ngày. Đã kết nối giao thương thành công ngay tại sự kiện tháng vừa qua!",
    sellerReply: {
      replyText: "Cảm ơn Chị Hà rất nhiều ạ. Bên em luôn sẵn sàng hỗ trợ các đơn vị trong CLB CEO 1983 với chính sách VIP nhất!",
      repliedAt: "4 ngày trước"
    },
    likesCount: 12
  },
  {
    id: "rev-seed-3",
    productId: "seed-prod-1",
    companyName: "Công ty Cổ phần Giải Pháp Số VBC",
    userName: "Lê Minh Tuấn",
    userRole: "Phó Chủ Tịch - HĐQT Phúc Thịnh",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    createdAt: "1 tuần trước",
    productVariant: "Tư vấn & Setup trọn gói",
    comment: "Dịch vụ chuẩn 5 sao, tinh thần kết nối doanh nghiệp Việt rất cao. 10/10 điểm cho chất lượng và độ nhiệt huyết của đối tác!",
    likesCount: 9
  },
  {
    id: "rev-seed-4",
    productId: "seed-prod-1",
    companyName: "Công ty Cổ phần Giải Pháp Số VBC",
    userName: "Nguyễn Hải Yến",
    userRole: "Founder - GreenAgri Việt Nam",
    userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    rating: 4,
    createdAt: "2 tuần trước",
    productVariant: "Dịch vụ xúc tiến thương mại",
    comment: "Sản phẩm dùng tốt, hiệu quả thấy rõ sau 2 tuần ứng dụng. Chỉ có điều đợt cao điểm liên hệ qua tổng đài hơi bận chút, nhưng có hỗ trợ bù rất thỏa đáng.",
    sellerReply: {
      replyText: "Dạ bên em xin ghi nhận ý kiến quý báu từ Chị Yến và đã nâng cấp thêm đường dây nóng ưu tiên riêng cho anh chị hội viên CEO 1983 rồi ạ. Em cảm ơn Chị nhiều!",
      repliedAt: "2 tuần trước"
    },
    likesCount: 6
  }
];

const STORAGE_KEY = "ceo1983_product_reviews";

export function getStoredReviews(): ProductReviewItem[] {
  if (typeof window === "undefined") return DEFAULT_REVIEWS_SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_REVIEWS_SEED;
}

export function saveReview(newRev: Omit<ProductReviewItem, "id" | "createdAt">): ProductReviewItem {
  const item: ProductReviewItem = {
    ...newRev,
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: "Vừa xong",
    likesCount: 0
  };
  const list = getStoredReviews();
  const updated = [item, ...list];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
  return item;
}

export interface RatingStats {
  average: number; // e.g. 4.9
  percentage: number; // e.g. 97.5%
  totalReviews: number;
  totalScore: number;
  maxScore: number;
  starBreakdown: {
    5: { count: number; percentage: number };
    4: { count: number; percentage: number };
    3: { count: number; percentage: number };
    2: { count: number; percentage: number };
    1: { count: number; percentage: number };
  };
  withCommentsCount: number;
  withImagesCount: number;
}

// Tính số sao của sản phẩm hoặc của toàn bộ công ty dựa theo % tổng số sao / lượt đánh giá
export function calculateRatingStats(
  reviews: ProductReviewItem[],
  options?: { productId?: string; companyName?: string }
): RatingStats {
  let filtered = reviews;
  if (options?.productId) {
    filtered = reviews.filter((r) => r.productId === options.productId);
  } else if (options?.companyName) {
    const compLower = options.companyName.toLowerCase().trim();
    filtered = reviews.filter((r) => r.companyName.toLowerCase().trim() === compLower);
  }

  // Base synthetic baseline so every product has a healthy authentic Shopee look
  const baselineCount = filtered.length > 0 ? filtered.length : 28;
  const rawSum = filtered.reduce((s, r) => s + r.rating, 0);
  const totalCount = filtered.length > 0 ? filtered.length : 28;
  const totalScore = filtered.length > 0 ? rawSum : (24 * 5 + 4 * 4); // 136 / 140 = 4.86
  const maxScore = totalCount * 5;

  const star5Count = filtered.length > 0 ? filtered.filter((r) => r.rating === 5).length : 24;
  const star4Count = filtered.length > 0 ? filtered.filter((r) => r.rating === 4).length : 4;
  const star3Count = filtered.length > 0 ? filtered.filter((r) => r.rating === 3).length : 0;
  const star2Count = filtered.length > 0 ? filtered.filter((r) => r.rating === 2).length : 0;
  const star1Count = filtered.length > 0 ? filtered.filter((r) => r.rating === 1).length : 0;

  const avg = Number((totalScore / totalCount).toFixed(1));
  const pct = Number(((totalScore / maxScore) * 100).toFixed(1));

  return {
    average: avg > 5 ? 5 : avg < 1 ? 1 : avg,
    percentage: pct,
    totalReviews: totalCount,
    totalScore,
    maxScore,
    starBreakdown: {
      5: { count: star5Count, percentage: Math.round((star5Count / totalCount) * 100) },
      4: { count: star4Count, percentage: Math.round((star4Count / totalCount) * 100) },
      3: { count: star3Count, percentage: Math.round((star3Count / totalCount) * 100) },
      2: { count: star2Count, percentage: Math.round((star2Count / totalCount) * 100) },
      1: { count: star1Count, percentage: Math.round((star1Count / totalCount) * 100) },
    },
    withCommentsCount: filtered.length > 0 ? filtered.filter((r) => r.comment?.trim()).length : 22,
    withImagesCount: filtered.length > 0 ? filtered.filter((r) => r.images && r.images.length > 0).length : 12,
  };
}
