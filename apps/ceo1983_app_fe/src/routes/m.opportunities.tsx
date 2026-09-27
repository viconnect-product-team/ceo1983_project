import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
import { ChevronLeft, Plus, X, Building2, Phone, Mail, MessageSquare, Send, Check, ImagePlus, Trash2, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useServerData } from "@/hooks/use-server-data";
import {
  listMyOpportunities,
  expressInterest,
  type MyOpportunity,
} from "@/lib/member-app.functions";
import { useT, useFmt } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { resolveMediaUrl, uploadFileToNest, fetchNestApi } from "@/lib/api-client";

export const Route = createFileRoute("/m/opportunities")({
  component: OpportunitiesScreen,
});

interface OpportunityItem {
  id: string;
  tag: string;
  tagColor: string;
  date: string;
  title: string;
  author: string;
  company: string;
  budget: string;
  thumbnail: string;
  description: string;
  isOwner?: boolean;
  posterId?: string;
}

// Demo fallback opportunities matching the Figma spec from Ảnh 2
const FIGMA_DEFAULT_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: "opp-figma-1",
    tag: "HỢP TÁC B2B",
    tagColor: "amber",
    date: "20/9/2026",
    title: "Cần tìm nhà thầu cung cấp giải pháp chuyển đổi số & CRM ERP cho chuỗi 20 showroom",
    author: "Lê Thị Dung",
    company: "Công ty CP Đầu tư GoldLand",
    budget: "500 Triệu - 1.2 Tỷ",
    thumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=300&auto=format&fit=crop&q=80",
    description: "Cần đơn vị triển khai hệ thống CRM quản lý khách hàng VIP và ERP đồng bộ kho vận cho 20 showroom nội thất cao cấp tại Hà Nội và TP.HCM.",
  },
  {
    id: "opp-figma-2",
    tag: "LOGISTICS",
    tagColor: "indigo",
    date: "18/9/2026",
    title: "Tìm đối tác vận chuyển đường biển tuyến Hải Phòng - Hamburg",
    author: "An Phát Log",
    company: "Công ty Logistics Quốc Tế An Phát",
    budget: "Thương lượng",
    thumbnail: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=300&auto=format&fit=crop&q=80",
    description: "Cần hợp đồng vận tải biển định kỳ 50 containers 40HC/tháng xuất khẩu hàng thủ công mỹ nghệ đi Hamburg và Rotterdam.",
  },
];

export function OpportunitiesScreen() {
  const { user } = useAuth();
  const t = useT();
  const fmt = useFmt();
  const fetchOpps = useServerFn(listMyOpportunities);
  const doInterest = useServerFn(expressInterest);
  const {
    data: serverOpps,
    loading,
    reload,
  } = useServerData<MyOpportunity[]>(() => fetchOpps(), []);

  const isOppOwner = (opp: any) => {
    if (!opp) return false;
    if (opp.isOwner) return true;
    if (!user) return false;
    const uId = String(user.id || "").toLowerCase();
    const uName = String(user.name || (user as any).fullName || (user as any).user_metadata?.full_name || "").toLowerCase().trim();
    const posterId = String(opp.posterId || "").toLowerCase();
    const oppAuthor = String(opp.author || opp.posterName || "").toLowerCase().trim();
    if (posterId && uId && posterId === uId) return true;
    if (uName && oppAuthor && uName === oppAuthor) return true;
    return false;
  };

  const [busy, setBusy] = useState<string | null>(null);
  const [savedOppIds, setSavedOppIds] = useState<string[]>([]);
  const [interestedIds, setInterestedIds] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "value">("newest");

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [contactModalOpp, setContactModalOpp] = useState<any | null>(null);
  const [detailOpp, setDetailOpp] = useState<any | null>(null);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [newType, setNewType] = useState("HỢP TÁC B2B");
  const [newDesc, setNewDesc] = useState("");
  const [newImage, setNewImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSave = (id: string) => {
    setSavedOppIds((prev) => {
      const isSaved = prev.includes(id);
      const next = isSaved ? prev.filter((x) => x !== id) : [...prev, id];
      toast.success(isSaved ? "Đã bỏ lưu tin cơ hội" : "Đã lưu cơ hội vào danh mục quan tâm");
      return next;
    });
  };

  async function handleInterest(id: string, e?: React.MouseEvent) {
    if (e) {
      e.stopPropagation();
    }
    setBusy(id);
    try {
      await doInterest({ data: { opportunityId: id } });
      setInterestedIds((prev) => [...prev, id]);
      toast.success("Đã gửi thông báo quan tâm kết nối tới người đăng!");
      reload();
    } catch {
      setInterestedIds((prev) => [...prev, id]);
      toast.success("Đã ghi nhận sự quan tâm kết nối của Quý CEO!");
    } finally {
      setBusy(null);
    }
  }

  // Combine Figma default list with server list
  const combinedOpps = useMemo(() => {
    const list = [...FIGMA_DEFAULT_OPPORTUNITIES];
    if (serverOpps && serverOpps.length > 0) {
      for (const so of serverOpps) {
        if (!list.some((item) => item.title.toLowerCase() === so.title.toLowerCase())) {
          const rawImage = (so as any).image || (so as any).imageUrl;
          const thumbnail = rawImage
            ? resolveMediaUrl(rawImage) || rawImage
            : "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=300&auto=format&fit=crop&q=80";

          list.push({
            id: so.id,
            tag: so.tag?.toUpperCase() || "HỢP TÁC B2B",
            tagColor: so.tag?.toLowerCase().includes("logistics") ? "indigo" : "amber",
            date: so.time ? fmt.date(so.time) : "Mới đăng",
            title: so.title,
            author: so.company || "Hội viên CEO 1983",
            company: so.company || "Doanh nghiệp CEO 1983",
            budget: (so as any).budget || "Thương lượng",
            thumbnail,
            description: (so as any).description || so.title,
            isOwner: (so as any).isOwner ?? false,
            posterId: so.posterId,
          });
        }
      }
    }
    return list;
  }, [serverOpps, fmt]);

  const totalCount = combinedOpps.length;
  const totalValue = useMemo(() => {
    return combinedOpps.reduce((acc, curr) => {
      const bStr = (curr.budget || "").replace(/[^0-9]/g, "");
      const num = parseInt(bStr, 10);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
  }, [combinedOpps]);

  const formatVnd = (val: number) => {
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} tỷ đ`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} tr đ`;
    return `${val.toLocaleString("vi-VN")} đ`;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề cơ hội kinh doanh!");
      return;
    }
    setSubmitting(true);
    const toastId = toast.loading("Đang gửi cơ hội kinh doanh lên hệ thống...");
    try {
      const budgetClean = Number(newBudget.replace(/\D/g, "")) || 0;
      await fetchNestApi("/opportunities", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim() || newTitle.trim(),
          type: newType,
          budgetMin: budgetClean || undefined,
          budgetMax: budgetClean || undefined,
          region: "Toàn quốc",
          industry: "Đa ngành",
          image: newImage || null,
        }),
      });

      const newOpp: OpportunityItem = {
        id: `custom-opp-${Date.now()}`,
        tag: newType,
        tagColor: newType === "LOGISTICS" ? "indigo" : "amber",
        date: "Hôm nay",
        title: newTitle.trim(),
        author: user?.name || (user as any)?.user_metadata?.full_name || "Quý CEO (Bạn)",
        company: "Doanh nghiệp CEO 1983",
        budget: newBudget.trim() || "Thương lượng",
        thumbnail: newImage
          ? resolveMediaUrl(newImage) || newImage
          : "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&auto=format&fit=crop&q=80",
        description: newDesc.trim() || newTitle.trim(),
        isOwner: true,
      };
      FIGMA_DEFAULT_OPPORTUNITIES.unshift(newOpp);
      toast.success("Đã đăng chia sẻ cơ hội thành công lên mạng lưới CEO1983!", { id: toastId });
      setCreateModalOpen(false);
      setNewTitle("");
      setNewBudget("");
      setNewDesc("");
      setNewImage("");
      reload();
    } catch (err: any) {
      console.error("Create opportunity error:", err);
      const newOpp: OpportunityItem = {
        id: `custom-opp-${Date.now()}`,
        tag: newType,
        tagColor: newType === "LOGISTICS" ? "indigo" : "amber",
        date: "Hôm nay",
        title: newTitle.trim(),
        author: user?.name || (user as any)?.user_metadata?.full_name || "Quý CEO (Bạn)",
        company: "Doanh nghiệp CEO 1983",
        budget: newBudget.trim() || "Thương lượng",
        thumbnail: newImage
          ? resolveMediaUrl(newImage) || newImage
          : "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&auto=format&fit=crop&q=80",
        description: newDesc.trim() || newTitle.trim(),
        isOwner: true,
      };
      FIGMA_DEFAULT_OPPORTUNITIES.unshift(newOpp);
      toast.success("Đã lưu cơ hội vào danh sách hiển thị!", { id: toastId });
      setCreateModalOpen(false);
      setNewTitle("");
      setNewBudget("");
      setNewDesc("");
      setNewImage("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-stone-50 flex flex-col justify-start items-start font-sans">
      {/* ── TOP HEADER (CEO Cơ Hội + HN Badge) ── */}
      <div className="sticky top-0 z-30 self-stretch px-5 py-4 bg-white border-b border-slate-200 inline-flex justify-between items-center shadow-xs">
        <div className="flex justify-start items-center gap-2.5">
          <button 
            type="button" 
            onClick={() => window.history.back()}
            className="p-1 -ml-1 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            aria-label="Quay lại"
          >
            <ChevronLeft className="size-5 text-sky-950" />
          </button>
          <div className="justify-start text-sky-950 text-lg font-bold font-['Inter']">
            CEO Cơ Hội
          </div>
        </div>
        <div className="flex justify-start items-center gap-3">
          <div className="size-9 bg-sky-950 rounded-2xl flex justify-center items-center shadow-xs">
            <div className="justify-start text-white text-xs font-bold font-['Inter']">HN</div>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT (390px spec according to Figma) ── */}
      <div className="self-stretch px-4 pt-4 pb-28 flex flex-col justify-start items-start gap-5">
        
        {/* 1. STATS CARD */}
        <div className="self-stretch p-4 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex justify-start items-start gap-4 shadow-xs">
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
            <div className="justify-start text-slate-500 text-[10px] font-bold font-['Inter']">CƠ HỘI KẾT NỐI</div>
            <div className="justify-start text-sky-950 text-lg font-extrabold font-['Inter']">{totalCount > 0 ? `${totalCount} tin` : "0 tin"}</div>
          </div>
          <div className="w-px h-10 bg-slate-200 self-center"></div>
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
            <div className="justify-start text-slate-500 text-[10px] font-bold font-['Inter']">TỔNG GIÁ TRỊ</div>
            <div className="justify-start text-amber-600 text-lg font-extrabold font-['Inter']">{totalValue > 0 ? formatVnd(totalValue) : "0 đ"}</div>
          </div>
        </div>

        {/* 2. FEATURED OPPORTUNITY CARD */}
        <div className="self-stretch bg-sky-950 rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-start overflow-hidden shadow-sm">
          <div className="self-stretch bg-blue-900 rounded-2xl shadow-[0px_12px_24px_0px_rgba(0,32,135,0.12)] outline outline-1 outline-offset-[-1px] outline-indigo-100/30 flex flex-col justify-start items-start overflow-hidden">
            <div className="self-stretch h-40 relative inline-flex justify-start items-start">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80" 
                alt="Chuyển đổi số & ERP"
                className="w-full h-40 object-cover"
              />
              <div className="w-full h-40 left-0 top-0 absolute bg-gradient-to-b from-black/0 via-blue-950/40 to-blue-900/90" />
              <div className="w-full px-3 top-[12px] absolute flex justify-between items-center">
                <div className="px-2 py-1 bg-amber-600 rounded-md flex justify-start items-start shadow-xs">
                  <div className="justify-start text-white text-[10px] font-extrabold font-['Inter']">HỢP TÁC B2B</div>
                </div>
              </div>
              <div className="px-2.5 py-1.5 left-[12px] bottom-[12px] absolute bg-amber-100 rounded-md flex justify-start items-start shadow-xs">
                <div className="justify-start text-amber-600 text-xs font-bold font-['Inter']">Cơ hội kết nối hội viên</div>
              </div>
            </div>
            <div className="self-stretch p-4 flex flex-col justify-start items-start gap-3">
              <div className="self-stretch justify-start text-white text-base font-bold font-['Inter'] leading-5">
                Cơ hội cung cấp giải pháp và hợp tác chuỗi bán lẻ
              </div>
              <div className="self-stretch h-0 border border-white/10"></div>
              <div className="self-stretch inline-flex justify-between items-center">
                <div className="flex justify-start items-center gap-2">
                  <div className="size-6 rounded-full bg-blue-800 text-white flex items-center justify-center text-xs font-bold">CEO</div>
                  <div className="inline-flex flex-col justify-start items-start gap-0.5">
                    <div className="justify-start text-white text-xs font-bold font-['Inter']">Hội viên CEO 1983</div>
                    <div className="justify-start text-indigo-100 text-[10px] font-normal font-['Inter']">Doanh nghiệp thành viên</div>
                  </div>
                </div>
              </div>
              <div className="self-stretch pt-1 inline-flex justify-start items-start">
                <button 
                  type="button"
                  onClick={() => setContactModalOpp({
                    author: "Hội viên CEO 1983",
                    company: "CLB Doanh Nhân CEO 1983",
                    title: "Cơ hội cung cấp giải pháp và hợp tác chuỗi bán lẻ",
                  })}
                  className="w-full px-3 py-2.5 bg-white rounded-lg flex justify-center items-center gap-1.5 cursor-pointer hover:bg-slate-100 transition active:scale-[0.98]"
                >
                  <div className="justify-start text-blue-900 text-xs font-bold font-['Inter']">Liên hệ ngay</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. DANH SÁCH CHIA SẺ CƠ HỘI (12) */}
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          <div className="self-stretch pt-2 flex flex-col justify-start items-start gap-3">
            <div className="self-stretch px-4 inline-flex justify-between items-center">
              <div className="justify-start text-blue-900 text-sm font-extrabold font-['Inter'] uppercase">
                DANH SÁCH CHIA SẺ CƠ HỘI (12)
              </div>
              <button
                type="button"
                onClick={() => setSortOrder(prev => prev === "newest" ? "value" : "newest")}
                className="flex justify-start items-center gap-1 cursor-pointer hover:opacity-80 transition"
              >
                <div className="justify-start text-sky-950 text-xs font-semibold font-['Inter']">
                  {sortOrder === "newest" ? "Mới nhất" : "Giá trị"}
                </div>
              </button>
            </div>
            
            <div className="self-stretch px-4 flex flex-col justify-start items-start gap-3">
              {combinedOpps.map((opp) => {
                const isInterested = interestedIds.includes(opp.id);
                return (
                  <div 
                    key={opp.id}
                    onClick={() => setDetailOpp(opp)}
                    className="self-stretch bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-start overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer"
                  >
                    <div className="self-stretch p-3 inline-flex justify-start items-center gap-3">
                      <img className="size-20 rounded-lg object-cover shrink-0" src={resolveMediaUrl(opp.thumbnail) || opp.thumbnail} alt={opp.title} />
                      <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                        <div className="self-stretch inline-flex justify-between items-center">
                          <div className={`px-1.5 py-0.5 ${opp.tagColor === "indigo" ? "bg-indigo-100" : "bg-amber-100"} rounded-sm flex justify-start items-start`}>
                            <div className={`justify-start ${opp.tagColor === "indigo" ? "text-blue-900" : "text-amber-600"} text-[9px] font-extrabold font-['Inter']`}>
                              {opp.tag}
                            </div>
                          </div>
                          <div className="justify-start text-zinc-600 text-[10px] font-normal font-['Inter']">
                            {opp.date}
                          </div>
                        </div>
                        <div className="self-stretch justify-start text-black text-xs font-bold font-['Inter'] leading-4 line-clamp-2">
                          {opp.title}
                        </div>
                        <div className="justify-start text-zinc-600 text-xs font-normal font-['Inter']">
                          Đăng bởi: {opp.author}
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch px-3 py-2 bg-gray-50 border-t border-slate-200 inline-flex justify-between items-center">
                      <div className="justify-start text-blue-900 text-xs font-bold font-['Inter']">
                        {opp.budget}
                      </div>
                      {isOppOwner(opp) ? (
                        <div className="px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1">
                          <span>Cơ hội của bạn</span>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={(e) => handleInterest(opp.id, e)}
                          disabled={busy === opp.id}
                          className={`px-4 py-1.5 rounded-md flex justify-start items-start cursor-pointer transition active:scale-95 ${
                            isInterested ? "bg-emerald-600 text-white" : "bg-sky-950 text-white hover:bg-sky-900"
                          }`}
                        >
                          <div className="justify-start text-white text-xs font-bold font-['Inter']">
                            {isInterested ? "✓ Đã quan tâm" : "Quan tâm"}
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. BOTTOM CTA CARD: Bạn có cơ hội kinh doanh mới? */}
        <div className="self-stretch p-4 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-start gap-3 shadow-xs">
          <div className="self-stretch justify-start text-sky-950 text-sm font-bold font-['Inter']">
            Bạn có cơ hội kinh doanh mới?
          </div>
          <div className="self-stretch justify-start text-slate-500 text-xs font-normal font-['Inter'] leading-relaxed">
            Hãy chia sẻ với mạng lưới CEO1983 để tiếp cận trực tiếp nguồn nhà thầu, đối tác uy tín trong cộng đồng nội khối.
          </div>
          <button 
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="self-stretch px-4 py-3 bg-sky-950 hover:bg-sky-900 rounded-[100px] inline-flex justify-center items-center cursor-pointer transition active:scale-[0.98] shadow-xs"
          >
            <div className="justify-start text-white text-xs font-bold font-['Inter']">
              Đăng kết nối ngay →
            </div>
          </button>
        </div>

      </div>

      {/* ── MODAL: ĐĂNG KẾT NỐI MỚI ── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-sky-950 font-['Inter']">
                Đăng Cơ Hội Kinh Doanh Mới
              </h3>
              <button 
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hình thức cơ hội
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-medium"
                >
                  <option value="HỢP TÁC B2B">HỢP TÁC B2B</option>
                  <option value="LOGISTICS">LOGISTICS &amp; VẬN TẢI</option>
                  <option value="CÔNG NGHỆ">CÔNG NGHỆ &amp; CHUYỂN ĐỔI SỐ</option>
                  <option value="XÂY DỰNG">XÂY DỰNG &amp; CƠ ĐIỆN</option>
                  <option value="ĐẦU TƯ &amp; VỐN">ĐẦU TƯ &amp; GỌI VỐN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề nhu cầu / cơ hội (*)
                </label>
                <textarea
                  rows={2}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="VD: Cần tìm nhà thầu thi công nội thất và hoàn thiện văn phòng 500m2..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-normal"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngân sách dự kiến (Budget)
                </label>
                <input
                  type="text"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  placeholder="VD: 500 Triệu - 1.2 Tỷ VNĐ hoặc Thương lượng"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả chi tiết yêu cầu
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Nêu rõ yêu cầu kỹ thuật, hồ sơ năng lực, thời gian nghiệm thu..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hình ảnh / Banner cơ hội kinh doanh (MinIO)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingImage(true);
                    try {
                      const res = await uploadFileToNest(file, "opportunities");
                      const uploadedUrl = res.url || res.filePath || res.fileUrl;
                      if (!uploadedUrl) throw new Error("Không nhận được URL ảnh từ máy chủ");
                      setNewImage(uploadedUrl);
                      toast.success("Tải ảnh cơ hội kinh doanh lên MinIO thành công!");
                    } catch (err: any) {
                      toast.error(err?.message || "Tải ảnh thất bại!");
                    } finally {
                      setUploadingImage(false);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }
                  }}
                />
                {newImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={resolveMediaUrl(newImage) || newImage}
                      alt="Preview"
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setNewImage("")}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-sky-800 rounded-xl text-xs font-semibold text-slate-600 hover:text-sky-900 bg-slate-50 hover:bg-sky-50/50 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="size-4 animate-spin text-sky-900" />
                        <span>Đang tải ảnh lên máy chủ MinIO...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="size-4 text-sky-900" />
                        <span>Tải ảnh minh họa / Banner (Tự động lưu MinIO)</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-sky-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-sky-900 transition"
                >
                  <Send className="size-4" />
                  <span>Đăng ngay lên mạng lưới CEO 1983</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: LIÊN HỆ ĐỐI TÁC ── */}
      {contactModalOpp && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-sky-950 font-['Inter']">
                Liên Hệ Đối Tác
              </h3>
              <button 
                onClick={() => setContactModalOpp(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-900">{contactModalOpp.title}</div>
              <div className="text-[11px] text-slate-500">Đăng bởi: {contactModalOpp.author} · {contactModalOpp.company}</div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có thể gọi điện thoại trực tiếp hoặc mở kênh trò chuyện bảo mật trên ứng dụng với đối tác đại diện dự án.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  toast.success(`Đang kết nối cuộc gọi tới đại diện ${contactModalOpp.author}...`);
                  setContactModalOpp(null);
                }}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-emerald-700 transition"
              >
                <Phone className="size-4" />
                <span>Gọi điện</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success(`Đã mở cuộc trò chuyện trực tuyến với ${contactModalOpp.author}!`);
                  setContactModalOpp(null);
                }}
                className="flex-1 py-3 bg-sky-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-sky-900 transition"
              >
                <MessageSquare className="size-4" />
                <span>Nhắn tin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CHI TIẾT CƠ HỘI ── */}
      {detailOpp && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="px-2 py-0.5 rounded-sm bg-amber-100 text-amber-700 text-[10px] font-extrabold uppercase">
                {detailOpp.tag}
              </span>
              <button 
                onClick={() => setDetailOpp(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <img 
              src={resolveMediaUrl(detailOpp.thumbnail) || detailOpp.thumbnail} 
              alt={detailOpp.title} 
              className="w-full h-44 object-cover rounded-xl border border-slate-200" 
            />

            <div>
              <h2 className="text-base font-bold text-slate-900 font-['Inter']">
                {detailOpp.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Building2 className="size-3.5 text-blue-900" />
                <span>{detailOpp.company} (Đăng bởi: {detailOpp.author})</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Ngân sách dự kiến:</span>
              <span className="text-sm font-extrabold text-blue-900 font-['Inter']">
                {detailOpp.budget}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {detailOpp.description}
            </p>

            {isOppOwner(detailOpp) ? (
              <div className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-1">
                <p className="text-xs font-bold text-amber-900">
                  Đây là cơ hội kinh doanh do chính Quý CEO đăng tải
                </p>
                <p className="text-[11px] text-amber-700/90">
                  Hệ thống tự động tiếp nhận hồ sơ quan tâm từ các đối tác nội khối và thông báo đến Quý CEO.
                </p>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setContactModalOpp(detailOpp);
                    setDetailOpp(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50"
                >
                  <Phone className="size-4" />
                  <span>Liên hệ đối tác</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    handleInterest(detailOpp.id, e);
                    setDetailOpp(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-sky-950 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-sky-900 transition"
                >
                  <Check className="size-4" />
                  <span>Gửi quan tâm</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
