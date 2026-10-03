import React, { useState, useEffect } from "react";
import { Star, MessageSquare, ThumbsUp, Send, CheckCircle2, ShieldCheck, User } from "lucide-react";
import { fetchNestApi } from "@/lib/api-client";
import { toast } from "sonner";

export interface ReviewItem {
  id: string;
  sellerId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  reviewType: string;
  createdAt: string;
}

export interface SellerReviewCardProps {
  sellerId: string;
  sellerName?: string;
  title?: string;
}

export function SellerReviewCard({
  sellerId,
  sellerName,
  title = "Đánh giá uy tín & Giao thương",
}: SellerReviewCardProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<{ count: number; avg: number }>({ count: 0, avg: 5 });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    if (!sellerId) return;
    try {
      setLoading(true);
      const res = await fetchNestApi(`/reviews?sellerId=${encodeURIComponent(sellerId)}`);
      if (res && res.reviews) {
        setReviews(res.reviews);
        setStats(res.stats || { count: res.reviews.length, avg: 5 });
      }
    } catch (err: any) {
      console.warn("Lỗi tải đánh giá đối tác:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [sellerId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    try {
      setSubmitting(true);
      await fetchNestApi("/reviews", {
        method: "POST",
        body: {
          sellerId,
          rating,
          comment: comment.trim(),
          reviewType: "service",
        },
      });
      toast.success("Cảm ơn bạn đã gửi đánh giá uy tín giao thương!");
      setComment("");
      setRating(5);
      setShowAddForm(false);
      await loadReviews();
    } catch (err: any) {
      toast.error(err?.message || "Không thể gửi đánh giá lúc này");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{stats.avg.toFixed(1)}</span>
            <span className="text-xs text-slate-400 font-normal">({stats.count} lượt đánh giá)</span>
          </div>
          {!showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition cursor-pointer"
            >
              + Viết đánh giá
            </button>
          )}
        </div>
      </div>

      {/* Add Review Form */}
      {showAddForm && (
        <form onSubmit={handleSubmitReview} className="p-4 my-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Đánh giá cho {sellerName || "đối tác"}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 text-amber-400 hover:scale-115 transition"
                >
                  <Star
                    className={`w-4 h-4 ${
                      s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm hợp tác, chất lượng sản phẩm dịch vụ hoặc độ uy tín..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-primary resize-none"
          />
          <div className="flex justify-end gap-2 mt-2.5">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      )}

      {/* Review List */}
      <div className="pt-3 divide-y divide-slate-100 dark:divide-slate-800">
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">Đang tải đánh giá uy tín...</div>
        ) : reviews.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 italic">
            Chưa có đánh giá nào cho đối tác này. Hãy là người đầu tiên để lại đánh giá uy tín!
          </div>
        ) : (
          reviews.slice(0, 5).map((rev) => (
            <div key={rev.id} className="py-3 first:pt-0 last:pb-0 text-xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                    {rev.reviewerName?.charAt(0) || "H"}
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {rev.reviewerName}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 pl-8 leading-relaxed">
                {rev.comment}
              </p>
              <div className="pl-8 mt-1 text-[10px] text-slate-400">
                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("vi-VN") : "Gần đây"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
