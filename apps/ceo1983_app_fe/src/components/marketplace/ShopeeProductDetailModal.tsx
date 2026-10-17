import React, { useState, useMemo, useEffect } from "react";
import {
  Star,
  ShieldCheck,
  Building2,
  Phone,
  MessageSquare,
  Share2,
  Store,
  Heart,
  FileText,
  X,
  CheckCircle2,
  Send,
  ThumbsUp,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  calculateRatingStats,
  type ProductReviewItem,
} from "./ShopeeRatingHelpers";
import { formatDisplayDate } from "@/lib/date-format";
import { fetchNestApi } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { MobilePagination } from "@/components/common/MobilePagination";

interface ShopeeProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onOpenQuote: (product: any) => void;
  onMessageSeller?: (product: any) => void;
  onViewStore?: (companyName: string) => void;
  isInterested?: boolean;
  onToggleInterest?: () => void;
}

export function ShopeeProductDetailModal({
  isOpen,
  onClose,
  product,
  onOpenQuote,
  onMessageSeller,
  onViewStore,
  isInterested = false,
  onToggleInterest,
}: ShopeeProductDetailModalProps) {
  if (!isOpen || !product) return null;

  const { user } = useAuth();
  const [reviews, setReviews] = useState<ProductReviewItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [activeFilterStar, setActiveFilterStar] = useState<number | "all" | "has_comment" | "has_image">("all");
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Form review input
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewerName, setNewReviewerName] = useState(user?.name || "");
  const [newReviewerRole, setNewReviewerRole] = useState(user?.title || "Hội viên CLB CEO 1983");
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const companyName = product.company || product.sellerName || "CLB Doanh Nhân CEO 1983";
  const productId = String(product.id || product._id || "");

  // Load REAL reviews from PostgreSQL database
  useEffect(() => {
    if (!productId && !companyName) return;
    setLoadingReviews(true);
    const query = new URLSearchParams();
    if (productId) query.set("productId", productId);
    if (companyName) query.set("companyName", companyName);

    fetchNestApi<any[]>(`/reviews?${query.toString()}`)
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped: ProductReviewItem[] = data.map((d: any) => ({
            id: String(d.id),
            productId: String(d.productId || d.product_id || productId),
            sellerId: d.sellerId || d.seller_id,
            companyName: d.companyName || d.company_name || companyName,
            userName: d.reviewerName || d.reviewer_name || "Hội viên CLB",
            userRole: d.reviewerRole || d.reviewer_role || "Lãnh đạo Doanh nghiệp",
            userAvatar: d.reviewerAvatar || d.reviewer_avatar || "",
            rating: Number(d.rating) || 5,
            createdAt: d.createdAt ? formatDisplayDate(d.createdAt) : "Vừa xong",
            comment: d.comment || "",
            productVariant: product.name || "Dịch vụ B2B",
            images: Array.isArray(d.images) ? d.images : [],
            likesCount: d.likesCount || 0,
          }));
          setReviews(mapped);
        } else {
          setReviews([]);
        }
      })
      .catch((err) => {
        console.warn("Could not load real reviews:", err);
      })
      .finally(() => {
        setLoadingReviews(false);
      });
  }, [productId, companyName]);

  // All product images
  const images = useMemo(() => {
    const list: string[] = [];
    if (product.imageUrl) list.push(product.imageUrl);
    if (product.imageUrls && Array.isArray(product.imageUrls)) {
      product.imageUrls.forEach((u: string) => {
        if (u && !list.includes(u)) list.push(u);
      });
    }
    if (list.length === 0) {
      list.push("https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80");
    }
    return list;
  }, [product]);

  // Rating stats cho sản phẩm từ dữ liệu thật
  const productRatingStats = useMemo(() => {
    return calculateRatingStats(reviews, { productId });
  }, [reviews, productId]);

  // Rating stats cho toàn công ty từ dữ liệu thật
  const companyRatingStats = useMemo(() => {
    return calculateRatingStats(reviews, { companyName });
  }, [reviews, companyName]);

  // Filtered reviews
  const displayedReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (activeFilterStar === "all") return true;
      if (activeFilterStar === "has_comment") return Boolean(r.comment?.trim());
      if (activeFilterStar === "has_image") return Boolean(r.images && r.images.length > 0);
      return Number(r.rating) === activeFilterStar;
    });
  }, [reviews, activeFilterStar]);

  // Reviews Pagination
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPageSize, setReviewPageSize] = useState(4);
  const totalReviewPages = Math.max(1, Math.ceil(displayedReviews.length / reviewPageSize));

  useEffect(() => {
    setReviewPage(1);
  }, [activeFilterStar]);

  const paginatedReviews = useMemo(() => {
    const start = (reviewPage - 1) * reviewPageSize;
    return displayedReviews.slice(start, start + reviewPageSize);
  }, [displayedReviews, reviewPage, reviewPageSize]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      const payload = {
        productId,
        sellerId: product.sellerId || product.seller_id || undefined,
        companyName,
        reviewerName: newReviewerName.trim() || user?.name || "Hội viên CLB CEO 1983",
        reviewerRole: newReviewerRole.trim() || "Lãnh đạo Doanh nghiệp",
        reviewerAvatar: user?.avatar_url || undefined,
        rating: newRating,
        comment: newComment.trim(),
        images: [],
      };

      const res = await fetchNestApi<any>("/reviews", {
        method: "POST",
        body: payload,
      });

      const newRevItem: ProductReviewItem = {
        id: String(res?.id || `rev-${Date.now()}`),
        productId,
        companyName,
        userName: payload.reviewerName,
        userRole: payload.reviewerRole,
        userAvatar: payload.reviewerAvatar,
        rating: payload.rating,
        createdAt: "Vừa xong",
        comment: payload.comment,
        productVariant: product.name || "Dịch vụ B2B",
        images: [],
        likesCount: 0,
      };

      setReviews((prev) => [newRevItem, ...prev]);
      setNewComment("");
      setShowReviewForm(false);
      toast.success("Đã gửi đánh giá thành công và lưu vào cơ sở dữ liệu!");
    } catch (err: any) {
      toast.error(err?.message || "Không thể lưu đánh giá. Vui lòng thử lại!");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name || "Sản phẩm Doanh nghiệp CEO 1983",
      text: `${product.name || ""} - ${companyName}`,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Đã sao chép liên kết chia sẻ sản phẩm!");
      } catch {
        toast.info("Đã sao chép liên kết");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#003B95] text-white shadow-xs">
              VBA MALL
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[240px] sm:max-w-md">
              {product.category || "Sản Phẩm & Dịch Vụ Hội Viên"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShare}
              className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
              title="Chia sẻ sản phẩm"
            >
              <Share2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 [scrollbar-width:thin]">
          {/* Top Section: Gallery + Product Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                <img
                  src={images[activeImageIdx] || images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                {/* Product Image */}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative size-14 shrink-0 rounded-xl overflow-hidden border-2 transition ${
                        activeImageIdx === idx
                          ? "border-[#003B95] ring-2 ring-[#003B95]/30"
                          : "border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta Info */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-bold border border-emerald-500/20">
                    Bảo chứng CLB
                  </span>
                  <span className="text-xs text-slate-400">Mã SP: CEO-{String(product.id).substring(0, 6)}</span>
                </div>

                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                  {product.name || product.title}
                </h2>

                {/* Rating Bar (Stars + Rating Count + Sold Count) */}
                <div className="flex items-center gap-3 text-xs divide-x divide-slate-200 dark:divide-slate-700 pt-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <span className="underline underline-offset-4">{productRatingStats.average}</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`size-3.5 ${
                            s <= Math.round(productRatingStats.average)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pl-3 text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white font-bold">{productRatingStats.totalReviews}</strong>{" "}
                    <span className="text-slate-400">Đánh giá</span>
                  </div>

                  <div className="pl-3 text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {product.views ? Math.floor(product.views * 1.5) : 120}+
                    </strong>{" "}
                    <span className="text-slate-400">Đã kết nối</span>
                  </div>
                </div>

                {/* Price Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <div className="text-[11px] font-medium text-slate-400">Giá ưu đãi đặc quyền Hội viên:</div>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-xl sm:text-2xl font-black text-[#003B95] dark:text-blue-400">
                      {typeof product.price === "number"
                        ? `${product.price.toLocaleString("vi-VN")} đ`
                        : product.memberPrice || product.price || "Báo giá VIP"}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        {typeof product.originalPrice === "number"
                          ? `${product.originalPrice.toLocaleString("vi-VN")} đ`
                          : product.originalPrice}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#003B95] dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      ƯU ĐÃI NỘI BỘ
                    </span>
                  </div>
                  <div className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                    <ShieldCheck className="size-3.5" />
                    <span>Cam kết giá tốt nhất thị trường trong hệ sinh thái CEO 1983</span>
                  </div>
                </div>

                {/* Description snippet */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {product.description ||
                    "Giải pháp chất lượng cao cung cấp bởi doanh nghiệp hội viên CLB CEO 1983, hướng tới tăng trưởng đột phá và kết nối thương mại bền vững."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onToggleInterest}
                  className={`size-11 rounded-2xl border flex items-center justify-center transition cursor-pointer shrink-0 ${
                    isInterested
                      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-600"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500"
                  }`}
                  title={isInterested ? "Bỏ quan tâm" : "Lưu vào giỏ quan tâm"}
                >
                  <Heart className={`size-5 ${isInterested ? "fill-rose-600" : ""}`} />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="size-11 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 hover:text-[#003B95] dark:text-slate-300 flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
                  title="Chia sẻ sản phẩm"
                >
                  <Share2 className="size-5" />
                </button>

                {onMessageSeller && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onMessageSeller(product);
                    }}
                    className="h-11 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-200 dark:border-slate-700"
                    title="Nhắn tin hỏi shop về sản phẩm này"
                  >
                    <MessageSquare className="size-4 text-[#003B95] dark:text-blue-400" />
                    <span>Chat Ngay</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onOpenQuote(product)}
                  className="flex-1 h-11 px-4 rounded-2xl bg-[#003B95] hover:bg-[#002d73] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 active:scale-98 transition cursor-pointer"
                >
                  <FileText className="size-4" />
                  <span>Nhận Báo Giá VIP Ngay</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── BỐ CỤC THÔNG TIN SHOP / CÔNG TY ── */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
              {/* Left: Avatar + Info */}
              <div className="flex items-center gap-3.5">
                <div className="relative size-14 sm:size-16 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border-2 border-[#003B95] p-1 shadow-md shrink-0">
                  <img
                    src={product.imageUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop&q=80"}
                    alt={companyName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[#003B95] text-white rounded-full p-0.5 border border-white">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      {companyName}
                    </h3>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-black bg-[#003B95] text-white">
                      MALL
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Đại diện: <strong className="text-slate-700 dark:text-slate-200">{product.sellerName || "Hội viên"}</strong>
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="size-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    <span>Sẵn sàng kết nối</span>
                  </div>
                </div>
              </div>

              {/* Right: Quick actions for Shop */}
              <div className="flex items-center gap-2 shrink-0">
                {onViewStore && (
                  <button
                    type="button"
                    onClick={() => onViewStore(companyName)}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Store className="size-3.5 text-[#003B95]" />
                    <span>Xem Gian Hàng</span>
                  </button>
                )}
              </div>
            </div>

            {/* Shop Statistics Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px]">Đánh Giá Công Ty:</span>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-black">{companyRatingStats.average} / 5.0</span>
                </div>
                <div className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
                  {companyRatingStats.totalReviews > 0
                    ? `${companyRatingStats.percentage}% hài lòng (${companyRatingStats.totalReviews} lượt)`
                    : "Chưa có đánh giá"}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px]">Sản Phẩm & Dịch Vụ:</span>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  Doanh nghiệp Hội viên
                </div>
                <div className="text-[10.5px] text-slate-400">Đã kiểm duyệt B2B</div>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px]">Tỉ Lệ Phản Hồi:</span>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  100%
                </div>
                <div className="text-[10.5px] text-slate-400">Trong ngày</div>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px]">Hệ Thống CEO 1983:</span>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  Hội viên Chính thức
                </div>
                <div className="text-[10.5px] text-blue-600 dark:text-blue-400 font-semibold">Bảo chứng kết nối</div>
              </div>
            </div>
          </div>

          {/* ── BỐ CỤC ĐÁNH GIÁ SẢN PHẨM REAL DATABASE ── */}
          <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span>ĐÁNH GIÁ SẢN PHẨM</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Dữ liệu đánh giá thực tế từ các lãnh đạo doanh nghiệp trong CLB CEO 1983</p>
              </div>

              <button
                type="button"
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#003B95] dark:text-blue-400 border border-slate-200 dark:border-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <span>{showReviewForm ? "Đóng Form" : "Viết Đánh Giá"}</span>
              </button>
            </div>

            {/* Star Overview Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center gap-6">
              {/* Score Left */}
              <div className="text-center md:text-left shrink-0 space-y-1">
                <div className="flex items-baseline justify-center md:justify-start gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{productRatingStats.average}</span>
                  <span className="text-sm font-semibold text-slate-500">trên 5</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`size-4 ${
                        s <= Math.round(productRatingStats.average)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 dark:text-slate-600"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {productRatingStats.totalReviews > 0
                    ? `${productRatingStats.percentage}% đánh giá tích cực`
                    : "Chưa có đánh giá nào"}
                </div>
              </div>

              {/* Rating Filters Buttons */}
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {[
                  { key: "all", label: `Tất Cả (${productRatingStats.totalReviews})` },
                  { key: 5, label: `5 Sao (${productRatingStats.starBreakdown[5].count})` },
                  { key: 4, label: `4 Sao (${productRatingStats.starBreakdown[4].count})` },
                  { key: 3, label: `3 Sao (${productRatingStats.starBreakdown[3].count})` },
                  { key: 2, label: `2 Sao (${productRatingStats.starBreakdown[2].count})` },
                  { key: 1, label: `1 Sao (${productRatingStats.starBreakdown[1].count})` },
                  { key: "has_comment", label: `Có Bình Luận (${productRatingStats.withCommentsCount})` },
                  { key: "has_image", label: `Có Hình Ảnh (${productRatingStats.withImagesCount})` },
                ].map((item) => (
                  <button
                    key={String(item.key)}
                    type="button"
                    onClick={() => setActiveFilterStar(item.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      activeFilterStar === item.key
                        ? "bg-[#003B95] text-white border-[#003B95] shadow-xs"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Write Review if toggled */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Gửi nhận xét đánh giá thực tế (Lưu trực tiếp vào CSDL)</h4>
                
                {/* Rating selection */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Mức độ hài lòng:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewRating(s)}
                        className="p-1 hover:scale-110 transition cursor-pointer"
                      >
                        <Star
                          className={`size-5 ${
                            s <= newRating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {newRating === 5 ? "Tuyệt vời" : newRating === 4 ? "Tốt" : newRating === 3 ? "Bình thường" : "Chưa tốt"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={newReviewerName}
                    onChange={(e) => setNewReviewerName(e.target.value)}
                    placeholder="Họ tên của bạn (VD: Trần Văn B)"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                  <input
                    type="text"
                    value={newReviewerRole}
                    onChange={(e) => setNewReviewerRole(e.target.value)}
                    placeholder="Chức vụ / Doanh nghiệp (VD: GĐ Phúc Thịnh)"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm thực tế của bạn khi sử dụng sản phẩm / dịch vụ này cho các hội viên khác tham khảo..."
                  className="w-full p-3 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none resize-none"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002d73] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Đang lưu CSDL...</span>
                      </>
                    ) : (
                      <>
                        <Send className="size-3.5" />
                        <span>Gửi Đánh Giá</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4 pt-2 divide-y divide-slate-100 dark:divide-slate-800">
              {loadingReviews ? (
                <div className="text-center py-8 text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin text-[#003B95]" />
                  <span>Đang tải đánh giá từ cơ sở dữ liệu...</span>
                </div>
              ) : displayedReviews.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                  <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(true)}
                    className="text-[#003B95] hover:underline font-bold text-xs"
                  >
                    Hãy là hội viên đầu tiên gửi đánh giá!
                  </button>
                </div>
              ) : (
                <>
                  {paginatedReviews.map((rev) => (
                    <div key={rev.id} className="pt-4 first:pt-0 space-y-2.5">
                      {/* User info + Stars */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                            alt={rev.userName}
                            className="size-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {rev.userName}
                              </span>
                              <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/40">
                                Hội viên
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {rev.userRole || "Doanh nghiệp CEO 1983"}
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-400 shrink-0">{rev.createdAt}</span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`size-3.5 ${
                              s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"
                            }`}
                          />
                        ))}
                        {rev.productVariant && (
                          <span className="text-[11px] text-slate-400 ml-2">
                            Phân loại: <span className="text-slate-600 dark:text-slate-300">{rev.productVariant}</span>
                          </span>
                        )}
                      </div>

                      {/* Comment Body */}
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                        {rev.comment}
                      </p>

                      {/* Review Images if any */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex gap-2 pt-1">
                          {rev.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt=""
                              className="size-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                            />
                          ))}
                        </div>
                      )}

                      {/* Like button */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                        <ThumbsUp className="size-3" />
                        <span>Hữu ích ({rev.likesCount || 0})</span>
                      </div>
                    </div>
                  ))}

                  {totalReviewPages > 1 && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <MobilePagination
                        currentPage={reviewPage}
                        totalPages={totalReviewPages}
                        totalItems={displayedReviews.length}
                        pageSize={reviewPageSize}
                        onPageChange={setReviewPage}
                        itemLabel="nhận xét"
                        compact={true}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Fixed Bar */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Building2 className="size-4 text-[#003B95]" />
            <span className="truncate max-w-[200px] sm:max-w-xs">{companyName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-xs"
            >
              <Share2 className="size-3.5" />
              <span>Chia Sẻ</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenQuote(product);
              }}
              className="px-5 py-2 rounded-xl bg-[#003B95] hover:bg-[#002d73] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="size-3.5" />
              <span>Yêu Cầu Báo Giá VIP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
