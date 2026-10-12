import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Eye,
  Calendar,
  User,
  FileText,
  Loader2,
  Plus,
  ExternalLink,
  Link as LinkIcon,
  ImagePlus,
  X,
  Share2,
  Sparkles,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listNews, getMyMember, type NewsItem, type MyMember } from "@/lib/member-app.functions";
import { resolveMediaUrl, uploadFileToNest } from "@/lib/api-client";
import { useT, useFmt } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type NewsSearch = {
  tab?: string;
};

export const Route = createFileRoute("/association/news")({
  validateSearch: (search: Record<string, unknown>): NewsSearch => {
    return { tab: typeof search.tab === "string" ? search.tab : undefined };
  },
  component: NewsScreen,
});

export default function NewsScreen() {
  const t = useT();
  const fmt = useFmt();
  const { user } = useAuth();

  const fetchMyMemberFn = useServerFn(getMyMember);
  const { data: member } = useServerData<MyMember | null>(() => fetchMyMemberFn(), null);

  const [selectedNews, setSelectedNews] = useState<(NewsItem & { url?: string }) | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);

  // Form states for creating / sharing a new article (Requirement 6)
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState("Tin doanh nghiệp");
  const [postUrl, setPostUrl] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [posting, setPosting] = useState(false);

  // Local articles state combined with server news
  const [localNews, setLocalNews] = useState<Array<NewsItem & { url?: string }>>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("vba_member_shared_news");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const fetchNews = useServerFn(listNews);
  const { data: serverNews = [], loading: newsLoading } = useServerData<NewsItem[]>(() => fetchNews(), []);

  // Merge local shared news and server news
  const allNews = [
    ...localNews,
    ...serverNews.filter((sn) => !localNews.some((ln) => ln.id === sn.id)),
  ];

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadFileToNest(file, `news_${Date.now()}.jpg`);
      setPostImage(uploadedUrl);
      toast.success("Đã tải ảnh lên thành công!");
    } catch {
      toast.error("Không thể tải ảnh. Vui lòng thử lại!");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài viết!");
      return;
    }
    if (!postContent.trim() && !postUrl.trim()) {
      toast.error("Vui lòng nhập nội dung hoặc đính kèm liên kết bài viết!");
      return;
    }

    setPosting(true);
    const authorName = member?.name || (user as any)?.name || (user as any)?.user_metadata?.full_name || "Hội viên CLB CEO 1983";
    const newArticle: NewsItem & { url?: string } = {
      id: `shared-news-${Date.now()}`,
      title: postTitle.trim(),
      category: postCategory,
      excerpt: postContent.trim() || (postUrl.trim() ? `Bài viết chia sẻ: ${postUrl.trim()}` : "Chia sẻ từ hội viên"),
      author: authorName,
      time: new Date().toISOString(),
      views: 1,
      image: postImage || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80",
      url: postUrl.trim() || undefined,
    };

    const updated = [newArticle, ...localNews];
    setLocalNews(updated);
    try {
      localStorage.setItem("vba_member_shared_news", JSON.stringify(updated));
    } catch {}

    toast.success("Đã đăng và chia sẻ bài viết thành công!");
    setPosting(false);
    setPostModalOpen(false);

    // Reset form
    setPostTitle("");
    setPostCategory("Tin doanh nghiệp");
    setPostUrl("");
    setPostContent("");
    setPostImage("");
  };

  return (
    <div className="vba-animate min-h-screen pb-16">
      <MemberHeader
        title="Tin tức CLB"
        back
      />

      {/* ── QUICK SHARE CALLOUT: Nền sáng cao cấp, không dùng nền tối ── */}
      <div className="px-4 pt-3">
        <div
          onClick={() => setPostModalOpen(true)}
          className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-50/50 via-blue-50/30 to-white dark:from-[#001D4A]/50 dark:to-[#002B70]/30 text-slate-900 dark:text-white shadow-xs hover:border-amber-400/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-amber-400/20 text-[#003B95] dark:text-amber-400 grid place-items-center shrink-0 border border-amber-400/40">
              <Share2 className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate">
                Chia sẻ tin tức hoặc bài viết doanh nghiệp
              </p>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                Đăng bài báo, link website hoặc thông tin hoạt động B2B
              </p>
            </div>
          </div>
          <span className="rounded-xl bg-[#003B95] hover:bg-[#002b6e] text-white text-[11px] font-bold px-3.5 py-1.5 shrink-0 shadow-xs transition active:scale-95">
            Đăng ngay
          </span>
        </div>
      </div>

      {/* ── DANH SÁCH BÀI VIẾT TIN TỨC CLB ── */}
      <div className="mt-3 space-y-3 px-4">
        {newsLoading && (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-[#003B95] dark:text-blue-400" />
            <p className="text-[13px]">{t("m.news.loading")}</p>
          </div>
        )}
        {!newsLoading && allNews.length === 0 && (
          <div className="py-20 text-center space-y-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6">
            <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">
              {t("m.news.empty")}
            </p>
          </div>
        )}
        {allNews.map((n: any) => (
          <article
            key={n.id}
            onClick={() => setSelectedNews(n)}
            className="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131a27] transition-all duration-200 hover:border-[#003B95]/40 hover:shadow-md active:scale-[0.99] cursor-pointer shadow-xs flex flex-row min-h-[140px]"
          >
            {/* 45% Image Column */}
            <div className="relative w-[45%] overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
              <img
                src={
                  resolveMediaUrl(n.image) ||
                  n.image ||
                  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80"
                }
                alt={n.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              {n.category && (
                <div className="absolute top-2 left-2">
                  <span className="inline-block rounded-md bg-[#003B95] px-2 py-0.5 text-[9.5px] font-bold text-white shadow-xs uppercase tracking-wider">
                    {n.category}
                  </span>
                </div>
              )}
              {n.url && (
                <div className="absolute bottom-2 left-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-black/70 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-blue-300 shadow-xs">
                    <LinkIcon className="h-2.5 w-2.5" />
                    Có liên kết
                  </span>
                </div>
              )}
            </div>

            {/* 55% Content Column */}
            <div className="w-[55%] p-3 sm:p-3.5 flex flex-col justify-between">
              <div>
                <h2 className="text-[13px] sm:text-[14px] font-bold leading-snug text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#003B95] dark:group-hover:text-blue-400 transition-colors">
                  {n.title}
                </h2>
                {n.excerpt && (
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {n.excerpt}
                  </p>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between text-[10.5px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                <span className="truncate max-w-[85px]">{fmt.rel(n.time) || n.author}</span>
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                  <Eye className="h-3 w-3 text-[#003B95] dark:text-blue-400 stroke-[2]" /> {n.views || 1}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* ── MODAL ĐĂNG BÀI VIẾT / CHIA SẺ LINK (Requirement 6) ── */}
      {postModalOpen && (
        <Dialog open={postModalOpen} onOpenChange={setPostModalOpen}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-y-auto p-5 rounded-3xl !bg-white dark:!bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#003B95] dark:bg-blue-900/40 dark:text-blue-300 grid place-items-center">
                  <Share2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
                    Đăng &amp; Chia Sẻ Bài Viết
                  </DialogTitle>
                  <p className="text-[11px] text-slate-400">
                    Chia sẻ bài báo, tin tức công ty hoặc đường dẫn bài viết
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tiêu đề bài viết <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="VD: Doanh nghiệp thành viên ký kết hợp tác thương mại 2026..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Danh mục
                  </label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95]"
                  >
                    <option value="Tin doanh nghiệp">Tin doanh nghiệp</option>
                    <option value="Báo chí & Truyền thông">Báo chí &amp; Truyền thông</option>
                    <option value="Hoạt động CLB">Hoạt động CLB</option>
                    <option value="Giao thương B2B">Giao thương B2B</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Ảnh bìa (Tùy chọn)
                  </label>
                  <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 transition">
                    <ImagePlus className="h-4 w-4 text-[#003B95] dark:text-blue-400" />
                    <span>{uploadingImage ? "Đang tải..." : postImage ? "Đã chọn ảnh" : "Tải ảnh lên"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadImage}
                    />
                  </label>
                </div>
              </div>

              {/* Trường link chia sẻ bài viết */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Đường dẫn liên kết (Link bài viết / bài báo / video)
                </label>
                <div className="relative">
                  <LinkIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    placeholder="https://vnexpress.net/... hoặc https://facebook.com/..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95]"
                  />
                </div>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Hội viên có thể dán link bài viết từ báo chí, website công ty hoặc mạng xã hội.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nội dung tóm tắt / Lời bình
                </label>
                <textarea
                  rows={4}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Nhập nội dung tóm tắt hoặc điểm nổi bật của bài viết muốn chia sẻ đến cộng đồng CEO..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPostModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={posting || uploadingImage}
                  className="px-5 py-2.5 rounded-xl bg-[#003B95] hover:bg-[#002b6e] text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {posting ? "Đang đăng..." : "Đăng bài viết ngay"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── ARTICLE DETAIL MODAL ── */}
      {selectedNews && (
        <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[85vh] overflow-y-auto p-0 rounded-3xl !bg-white dark:!bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Modal Image Header */}
            {selectedNews.image && (
              <div className="relative h-44 sm:h-48 w-full overflow-hidden rounded-t-3xl bg-slate-900">
                <img
                  src={resolveMediaUrl(selectedNews.image) || selectedNews.image}
                  alt={selectedNews.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-black/20 to-transparent" />
                {selectedNews.category && (
                  <div className="absolute bottom-3 left-4">
                    <span className="inline-block rounded-full bg-[#003B95] text-white font-bold text-[10px] px-3 py-1 uppercase tracking-wider shadow-md">
                      {selectedNews.category}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="p-5 sm:p-6">
              <DialogTitle className="text-lg sm:text-xl font-extrabold leading-snug text-slate-900 dark:text-white text-left mb-2.5">
                {selectedNews.title}
              </DialogTitle>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                {selectedNews.author && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#003B95] dark:text-blue-400" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedNews.author}</span>
                  </div>
                )}
                {selectedNews.time && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#003B95] dark:text-blue-400" />
                    <span>{fmt.rel(selectedNews.time)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#003B95] dark:text-blue-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedNews.views || 1} lượt xem</span>
                </div>
              </div>

              <div className="space-y-3.5 text-[13.5px] leading-relaxed text-slate-700 dark:text-slate-300">
                <p className="font-medium text-slate-900 dark:text-white bg-blue-50/60 dark:bg-blue-950/30 p-3.5 rounded-2xl border border-blue-200/80 dark:border-blue-800/40 leading-relaxed">
                  {selectedNews.excerpt}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Hiệp hội doanh nhân CEO 1983 không ngừng đẩy mạnh các hoạt động xúc tiến kết nối
                  giao thương nội khối, xây dựng chuỗi cung ứng bền vững và lan tỏa giá trị kinh tế
                  thiết thực đến từng hội viên trong kỷ nguyên chuyển đổi số toàn diện.
                </p>

                {selectedNews.url && (
                  <a
                    href={selectedNews.url.startsWith("http") ? selectedNews.url : `https://${selectedNews.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex items-center justify-between p-3.5 rounded-2xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 text-[#003B95] dark:bg-blue-900/40 dark:text-blue-400 grid place-items-center shrink-0">
                        <LinkIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                          Mở liên kết bài viết gốc
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                          {selectedNews.url}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-[#003B95] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </a>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedNews(null)}
                  style={{ color: "#ffffff" }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] active:scale-95 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  Đóng bài viết
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
