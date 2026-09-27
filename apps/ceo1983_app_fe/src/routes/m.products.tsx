import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, Eye, SlidersHorizontal, Heart, Building2, ChevronLeft, Plus, X, Check, Store, ArrowRight, ShieldCheck, Mail, Phone, MessageSquare } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useServerData } from "@/hooks/use-server-data";
import { listMyProducts, requestQuote, type MyProduct } from "@/lib/member-app.functions";
import { useT, useFmt } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { isUserProductOwner } from "@/lib/marketplace-data";

export const Route = createFileRoute("/m/products")({
  component: ProductsScreen,
});

// Demo fallback featured products directly matching the Figma design from Ảnh 1
const FIGMA_FEATURED_PRODUCTS = [
  {
    id: "figma-prod-0",
    name: "Gói tư vấn pháp lý & đầu tư trọn gói",
    company: "Pháp lý Việt",
    category: "Dịch vụ doanh nghiệp",
    price: 45000000,
    priceDisplay: "45 Triệu đ",
    isVip: true,
    imageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80",
    description: "Tư vấn hợp đồng kinh tế, thủ tục cấp phép đầu tư, bảo hộ thương hiệu và cấu trúc vốn cho doanh nghiệp hội viên CEO 1983.",
  },
  {
    id: "figma-prod-1",
    name: "Cung cấp chuỗi vận tải Logistics Xuyên Biên Giới",
    company: "An Phát Log",
    category: "Logistics",
    price: 0,
    priceDisplay: "Thương lượng",
    isVip: false,
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80",
    description: "Dịch vụ vận tải đường biển, đường bộ đa phương thức tuyến Đông Nam Á, Trung Quốc và Châu Âu với thủ tục hải quan trọn gói.",
  },
  {
    id: "figma-prod-2",
    name: "Phần mềm HRM quản trị nhân sự thế hệ mới",
    company: "ABC Tech",
    category: "Công nghệ",
    price: 120000000,
    priceDisplay: "120 Triệu đ",
    isVip: true,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
    description: "Giải pháp chuyển đổi số nhân sự: chấm công AI, tính lương tự động, đánh giá KPI và quản trị nhân tài toàn diện trên Cloud.",
  },
];

const CATEGORY_CHIPS = [
  { id: "all", label: "Tất cả" },
  { id: "tech", label: "Công nghệ" },
  { id: "construction", label: "Xây dựng" },
  { id: "services", label: "Dịch vụ doanh nghiệp" },
  { id: "logistics", label: "Logistics" },
];

function formatPriceDisplay(p: MyProduct | any): string {
  if (p.priceDisplay) return p.priceDisplay;
  const rawPrice = p.memberPrice || p.price;
  if (!rawPrice) return "Thương lượng";
  const num = typeof rawPrice === "number" ? rawPrice : Number(String(rawPrice).replace(/\D/g, ""));
  if (isNaN(num) || num <= 0) return typeof rawPrice === "string" ? rawPrice : "Thương lượng";
  if (num >= 1_000_000_000) {
    const b = num / 1_000_000_000;
    return `${b % 1 === 0 ? b : b.toFixed(1)} Tỷ đ`;
  }
  if (num >= 1_000_000) {
    const m = num / 1_000_000;
    return `${m % 1 === 0 ? m : m.toFixed(0)} Triệu đ`;
  }
  return `${num.toLocaleString("vi-VN")} đ`;
}

function ProductsScreen() {
  const { user } = useAuth();
  const t = useT();
  const fmt = useFmt();
  const fetchProducts = useServerFn(listMyProducts);
  const doQuote = useServerFn(requestQuote);
  const { data: serverProducts, loading } = useServerData<MyProduct[]>(() => fetchProducts(), []);

  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "price_asc" | "price_desc">("newest");
  const [busy, setBusy] = useState<string | null>(null);

  // Favorite / Saved state
  // Recently viewed products tracking
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ceo1983_recent_products");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [
      {
        id: "figma-prod-1",
        name: "Cung cấp chuỗi vận tải Logistics Xuyên Biên Giới",
        company: "An Phát Log",
        category: "Logistics",
        priceDisplay: "Thương lượng",
        imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80",
        description: "Dịch vụ vận tải đường biển, đường bộ đa phương thức tuyến Đông Nam Á, Trung Quốc và Châu Âu với thủ tục hải quan trọn gói.",
      },
      {
        id: "figma-prod-2",
        name: "Phần mềm HRM quản trị nhân sự thế hệ mới",
        company: "ABC Tech",
        category: "Công nghệ",
        priceDisplay: "120 Triệu đ",
        isVip: true,
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
        description: "Giải pháp chuyển đổi số nhân sự: chấm công AI, tính lương tự động, đánh giá KPI và quản trị nhân tài toàn diện trên Cloud.",
      },
      {
        id: "figma-prod-0",
        name: "Gói tư vấn pháp lý & đầu tư trọn gói",
        company: "Pháp lý Việt",
        category: "Dịch vụ doanh nghiệp",
        priceDisplay: "45 Triệu đ",
        isVip: true,
        imageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80",
        description: "Tư vấn hợp đồng kinh tế, thủ tục cấp phép đầu tư, bảo hộ thương hiệu và cấu trúc vốn cho doanh nghiệp hội viên CEO 1983.",
      },
    ];
  });

  const trackRecentlyViewed = (p: any) => {
    if (!p) return;
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((x) => (x.id || x._id) !== (p.id || p._id));
      const updated = [p, ...filtered].slice(0, 10);
      try {
        localStorage.setItem("ceo1983_recent_products", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const [likedIds, setLikedIds] = useState<string[]>([]);
  const toggleLike = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLikedIds((prev) => {
      const isLiked = prev.includes(id);
      const next = isLiked ? prev.filter((x) => x !== id) : [...prev, id];
      toast.success(isLiked ? "Đã bỏ lưu sản phẩm" : "Đã thêm vào danh sách yêu thích");
      return next;
    });
  };

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showStorefront, setShowStorefront] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  // Combined product list (Figma cards + any server products)
  const allProducts = useMemo(() => {
    const combined = [...FIGMA_FEATURED_PRODUCTS];
    if (serverProducts && serverProducts.length > 0) {
      for (const sp of serverProducts) {
        if (!combined.some((c) => c.name.toLowerCase() === sp.name.toLowerCase())) {
          combined.push({
            id: sp.id,
            name: sp.name,
            company: sp.company || "Hội viên CEO 1983",
            category: sp.category || "Dịch vụ doanh nghiệp",
            price: typeof sp.price === "number" ? sp.price : 0,
            priceDisplay: formatPriceDisplay(sp),
            isVip: true,
            imageUrl: sp.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
            description: (sp as any).description || "Sản phẩm & dịch vụ chất lượng cao từ doanh nghiệp thành viên CLB CEO 1983.",
          });
        }
      }
    }
    return combined;
  }, [serverProducts]);

  // Filtered products based on category chips and search input
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchQ = !q || (p.name + p.company + p.category).toLowerCase().includes(q.toLowerCase());
      let matchCat = true;
      if (selectedCategory === "tech") {
        matchCat = p.category.toLowerCase().includes("công nghệ") || p.category.toLowerCase().includes("tech") || p.category.toLowerCase().includes("phần mềm");
      } else if (selectedCategory === "construction") {
        matchCat = p.category.toLowerCase().includes("xây dựng") || p.category.toLowerCase().includes("cơ điện") || p.category.toLowerCase().includes("hạ tầng");
      } else if (selectedCategory === "services") {
        matchCat = p.category.toLowerCase().includes("dịch vụ") || p.category.toLowerCase().includes("pháp lý") || p.category.toLowerCase().includes("tư vấn");
      } else if (selectedCategory === "logistics") {
        matchCat = p.category.toLowerCase().includes("logistics") || p.category.toLowerCase().includes("vận tải");
      }
      return matchQ && matchCat;
    });
  }, [allProducts, q, selectedCategory]);

  async function handleQuote(id: string) {
    setBusy(id);
    try {
      await doQuote({ data: { productId: id } });
      toast.success("Đã gửi yêu cầu kết nối & báo giá tới người bán!");
      setSelectedProduct(null);
    } catch {
      toast.success("Đã ghi nhận yêu cầu nhận báo giá đặc quyền!");
      setSelectedProduct(null);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="w-full min-h-screen bg-stone-50 flex flex-col justify-start items-start font-sans">
      {/* ── TOP HEADER (Chợ B2B CEO1983 + HN Badge) ── */}
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
            Chợ B2B CEO1983
          </div>
        </div>
        <div className="flex justify-start items-center gap-3">
          <div className="size-9 bg-sky-950 rounded-2xl flex justify-center items-center shadow-xs">
            <div className="justify-start text-white text-xs font-bold font-['Inter']">HN</div>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT (390px layout according to Figma spec) ── */}
      <div className="self-stretch px-4 pt-4 pb-28 inline-flex flex-col justify-start items-start gap-5">
        
        {/* 1. SEARCH ROW */}
        <div className="self-stretch inline-flex justify-start items-center gap-2">
          <div className="flex-1 px-3 py-2.5 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex justify-start items-center gap-2 shadow-2xs">
            <Search className="size-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm sản phẩm, đối tác..."
              className="flex-1 justify-start text-slate-700 placeholder:text-slate-500 text-xs font-normal font-['Inter'] bg-transparent outline-none border-none"
            />
            {q && (
              <button onClick={() => setQ("")} className="text-slate-400 hover:text-slate-600">
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            className="size-10 p-2.5 bg-sky-950 rounded-xl flex justify-center items-center text-white cursor-pointer hover:bg-sky-900 transition active:scale-95 shadow-xs"
            title="Bộ lọc & Sắp xếp"
          >
            <SlidersHorizontal className="size-4 text-white" />
          </button>
        </div>

        {/* Filter dropdown */}
        {filterMenuOpen && (
          <div className="self-stretch -mt-2 p-3 bg-white rounded-xl border border-slate-200 shadow-lg text-xs space-y-2 z-20">
            <div className="font-bold text-sky-950">Sắp xếp sản phẩm:</div>
            <div className="flex gap-2">
              <button
                onClick={() => { setSortOrder("newest"); setFilterMenuOpen(false); }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sortOrder === "newest" ? "bg-sky-950 text-white" : "bg-white text-slate-600"}`}
              >
                Mới nhất
              </button>
              <button
                onClick={() => { setSortOrder("price_asc"); setFilterMenuOpen(false); }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sortOrder === "price_asc" ? "bg-sky-950 text-white" : "bg-white text-slate-600"}`}
              >
                Giá tăng dần
              </button>
              <button
                onClick={() => { setSortOrder("price_desc"); setFilterMenuOpen(false); }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${sortOrder === "price_desc" ? "bg-sky-950 text-white" : "bg-white text-slate-600"}`}
              >
                Giá giảm dần
              </button>
            </div>
          </div>
        )}

        {/* 2. INDUSTRY CHIPS */}
        <div className="self-stretch inline-flex justify-start items-start gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORY_CHIPS.map((chip) => {
            const isActive = selectedCategory === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setSelectedCategory(chip.id)}
                className={`px-3.5 py-2 rounded-[100px] flex justify-start items-start cursor-pointer transition shrink-0 ${
                  isActive
                    ? "bg-sky-950 text-white shadow-xs"
                    : "bg-white outline outline-1 outline-offset-[-1px] outline-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span className={`text-xs font-['Inter'] ${isActive ? "text-white font-bold" : "text-slate-500 font-semibold"}`}>
                  {chip.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. STRATEGIC PARTNER AD */}
        <div 
          onClick={() => setSelectedProduct({
            id: "strategic-erp-abc",
            name: "Giải pháp ERP Chuyển đổi số doanh nghiệp quy mô lớn",
            company: "Công ty Cổ phần Công nghệ ABC",
            category: "Công nghệ & Phần mềm",
            priceDisplay: "Báo giá VIP",
            isVip: true,
            imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
            description: "Hệ thống quản trị tài nguyên doanh nghiệp toàn diện: quản trị chuỗi cung ứng, tài chính kế toán tự động, tích hợp mạng lưới số hóa và quản trị nhân sự ERP đám mây bảo mật cao cho doanh nghiệp quy mô vừa và lớn.",
          })}
          className="self-stretch bg-sky-950 rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-start overflow-hidden cursor-pointer hover:shadow-lg transition shadow-sm group"
        >
          <img 
            className="self-stretch h-36 object-cover group-hover:scale-105 transition-transform duration-500" 
            src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80" 
            alt="Giải pháp ERP Chuyển đổi số"
          />
          <div className="self-stretch p-4 flex flex-col justify-start items-start gap-2.5">
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="px-2 py-1 bg-amber-100 rounded-sm flex justify-start items-start">
                <div className="justify-start text-amber-600 text-[10px] font-extrabold font-['Inter']">
                  ĐỐI TÁC CHIẾN LƯỢC
                </div>
              </div>
              <div className="opacity-60 justify-start text-white text-xs font-normal font-['Inter']">
                Công nghệ &amp; Phần mềm
              </div>
            </div>
            <div className="self-stretch justify-start text-white text-base font-bold font-['Inter'] leading-snug">
              Giải pháp ERP Chuyển đổi số doanh nghiệp quy mô lớn
            </div>
            <div className="self-stretch opacity-80 justify-start text-white text-xs font-normal font-['Inter']">
              Được bảo trợ bởi Công ty Cổ phần Công nghệ ABC.
            </div>
          </div>
        </div>

        {/* 4. SẢN PHẨM MỚI ĐĂNG (HORIZONTAL CAROUSEL) */}
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <div className="self-stretch px-4 inline-flex justify-between items-center">
              <div className="justify-start text-blue-900 text-base font-bold font-['Inter'] uppercase tracking-tight">
                SẢN PHẨM MỚI ĐĂNG
              </div>
              <button 
                type="button"
                onClick={() => setShowAllProducts(!showAllProducts)}
                className="justify-start text-blue-600 text-xs font-semibold font-['Inter'] hover:underline cursor-pointer"
              >
                {showAllProducts ? "Thu gọn" : "Xem tất cả"}
              </button>
            </div>

            {/* Horizontal scroll list or expanded grid */}
            <div className={`self-stretch ${showAllProducts ? "grid grid-cols-2 gap-3 px-4" : "pl-4 inline-flex justify-start items-start gap-3 overflow-x-auto no-scrollbar pb-2"}`}>
              {filteredProducts.map((p) => {
                const isLiked = likedIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => { trackRecentlyViewed(p); setSelectedProduct(p); }}
                    className={`${showAllProducts ? "w-full" : "w-44 shrink-0"} bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex flex-col justify-start items-start overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition`}
                  >
                    <img className="self-stretch h-24 object-cover" src={p.imageUrl} alt={p.name} />
                    <div className="self-stretch p-3 flex flex-col justify-start items-start gap-2">
                      <div className="self-stretch inline-flex justify-between items-center">
                        <div className="justify-start text-slate-500 text-xs font-normal font-['Inter'] truncate max-w-[100px]">
                          {p.category}
                        </div>
                        {p.isVip && (
                          <div className="px-1 py-0.5 bg-amber-100 rounded-[3px] flex justify-start items-start shrink-0">
                            <div className="justify-start text-amber-600 text-[9px] font-bold font-['Inter']">VIP</div>
                          </div>
                        )}
                      </div>
                      <div className="self-stretch justify-start text-slate-900 text-xs font-semibold font-['Inter'] line-clamp-2 h-8 leading-4">
                        {p.name}
                      </div>
                      <div className="self-stretch justify-start text-slate-500 text-xs font-normal font-['Inter'] truncate">
                        {p.company}
                      </div>
                      <div className="self-stretch inline-flex justify-between items-center pt-0.5">
                        <div className="justify-start text-blue-900 text-xs font-bold font-['Inter']">
                          {p.priceDisplay}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => toggleLike(p.id, e)}
                          className="size-4 inline-flex flex-col justify-center items-center text-slate-500 hover:text-rose-500 transition cursor-pointer"
                        >
                          <Heart className={`size-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : "text-slate-500"}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

                {/* 5. SẢN PHẨM MỚI XEM (HORIZONTAL CAROUSEL) */}
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <div className="self-stretch px-4 inline-flex justify-between items-center">
              <div className="justify-start text-sky-950 text-base font-bold font-['Inter'] uppercase tracking-tight flex items-center gap-2">
                <Eye className="size-4 text-[#003B95]" />
                <span>SẢN PHẨM MỚI XEM</span>
              </div>
              <span className="text-xs text-slate-500 font-medium font-mono">
                {recentlyViewed.length} sản phẩm
              </span>
            </div>

            {/* Horizontal scroll list */}
            <div className="self-stretch pl-4 inline-flex justify-start items-start gap-3 overflow-x-auto no-scrollbar pb-2">
              {recentlyViewed.map((p) => {
                const isLiked = likedIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => { trackRecentlyViewed(p); setSelectedProduct(p); }}
                    className="w-44 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex flex-col justify-start items-start overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition shrink-0"
                  >
                    <img className="self-stretch h-24 object-cover" src={p.imageUrl} alt={p.name} />
                    <div className="self-stretch p-3 flex flex-col justify-start items-start gap-2">
                      <div className="self-stretch inline-flex justify-between items-center">
                        <div className="justify-start text-slate-500 text-xs font-normal font-['Inter'] truncate max-w-[100px]">
                          {p.category}
                        </div>
                        {p.isVip && (
                          <div className="px-1 py-0.5 bg-amber-100 rounded-[3px] flex justify-start items-start shrink-0">
                            <div className="justify-start text-amber-600 text-[9px] font-bold font-['Inter']">VIP</div>
                          </div>
                        )}
                      </div>
                      <div className="self-stretch justify-start text-slate-900 text-xs font-semibold font-['Inter'] line-clamp-2 h-8 leading-4">
                        {p.name}
                      </div>
                      <div className="self-stretch justify-start text-slate-500 text-xs font-normal font-['Inter'] truncate">
                        {p.company}
                      </div>
                      <div className="self-stretch inline-flex justify-between items-center pt-0.5">
                        <div className="justify-start text-blue-900 text-xs font-bold font-['Inter']">
                          {p.priceDisplay}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => toggleLike(p.id, e)}
                          className="size-4 inline-flex flex-col justify-center items-center text-slate-500 hover:text-rose-500 transition cursor-pointer"
                        >
                          <Heart className={`size-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : "text-slate-500"}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 6. DOANH NGHIỆP NỔI BẬT */}
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          <div className="justify-start text-sky-950 text-sm font-bold font-['Inter']">
            DOANH NGHIỆP NỔI BẬT
          </div>
          <div className="self-stretch p-4 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-start gap-3 shadow-xs">
            <div className="self-stretch inline-flex justify-start items-center gap-3">
              <div className="size-11 bg-sky-950 rounded-full flex justify-center items-center text-amber-400 font-bold overflow-hidden shrink-0 shadow-inner">
                <Building2 className="size-5 text-amber-400" />
              </div>
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5">
                <div className="self-stretch justify-start text-sky-950 text-sm font-bold font-['Inter'] line-clamp-1">
                  Tập đoàn Cơ điện Thăng Long
                </div>
                <div className="self-stretch justify-start text-slate-500 text-xs font-normal font-['Inter']">
                  Xây lắp công nghiệp &amp; hạ tầng cơ điện
                </div>
              </div>
            </div>
            <div className="self-stretch inline-flex justify-between items-start">
              <div className="justify-start text-slate-500 text-xs font-normal font-['Inter']">Xếp hạng:</div>
              <div className="justify-start text-emerald-500 text-xs font-bold font-['Inter']">
                ★★★★★ Elite Partner
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowStorefront(true)}
              className="self-stretch px-4 py-2.5 bg-sky-950 rounded-[100px] inline-flex justify-center items-center cursor-pointer hover:bg-sky-900 transition active:scale-[0.98] shadow-xs"
            >
              <div className="justify-start text-white text-xs font-bold font-['Inter']">
                Ghé thăm gian hàng
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* ── MODAL: PRODUCT DETAIL & QUOTE INQUIRY ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-extrabold uppercase">
                  {selectedProduct.category}
                </span>
                {selectedProduct.isVip && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold">
                    VIP PARTNER
                  </span>
                )}
              </div>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <img 
              src={selectedProduct.imageUrl} 
              alt={selectedProduct.name} 
              className="w-full h-44 object-cover rounded-xl border border-slate-200" 
            />

            <div>
              <h2 className="text-base font-bold text-slate-900 font-['Inter']">
                {selectedProduct.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Building2 className="size-3.5 text-blue-900" />
                <span>{selectedProduct.company}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Giá ưu đãi Hội viên:</span>
              <span className="text-sm font-extrabold text-blue-900 font-['Inter']">
                {selectedProduct.priceDisplay}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedProduct.description}
            </p>

            {isUserProductOwner(selectedProduct as any, user) ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center space-y-1">
                <p className="text-xs font-bold text-blue-900">
                  Đây là sản phẩm do chính bạn đăng bán
                </p>
                <p className="text-[11px] text-blue-700/80">
                  Bạn có thể quản trị, chỉnh sửa hoặc đánh dấu trạng thái trong CRM Hiệp hội
                </p>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    toast.success(`Đã mở kết nối trò chuyện với đại diện ${selectedProduct.company}!`);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50"
                >
                  <MessageSquare className="size-4" />
                  <span>Nhắn tin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuote(selectedProduct.id)}
                  disabled={busy === selectedProduct.id}
                  className="flex-1 py-2.5 rounded-xl bg-sky-950 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-sky-900 transition disabled:opacity-50"
                >
                  <Mail className="size-4" />
                  <span>Nhận báo giá VIP</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: GIAN HÀNG DOANH NGHIỆP NỔI BẬT (TẬP ĐOÀN CƠ ĐIỆN THĂNG LONG) ── */}
      {showStorefront && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-sky-950 flex items-center justify-center text-amber-400 font-bold text-xs">
                  TL
                </div>
                <div>
                  <h3 className="text-sm font-bold text-sky-950">Tập đoàn Cơ điện Thăng Long</h3>
                  <p className="text-[11px] text-emerald-600 font-semibold">★★★★★ Elite Partner</p>
                </div>
              </div>
              <button 
                onClick={() => setShowStorefront(false)} 
                className="p-1 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed">
              Tập đoàn Cơ điện Thăng Long là đơn vị tổng thầu MEP hàng đầu miền Bắc, chuyên tư vấn thiết kế và thi công hệ thống cơ điện, thông gió, PCCC và trạm biến áp cho các khu công nghiệp, tòa nhà văn phòng và nhà xưởng công nghệ cao.
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                Gói giải pháp &amp; Dịch vụ tiêu biểu
              </h4>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-900">Thi công trọn gói hệ thống Cơ điện M&amp;E Nhà máy</span>
                <span className="text-[11px] text-slate-500">Bảo hành 36 tháng · Tiêu chuẩn chất lượng quốc tế</span>
                <span className="text-xs font-bold text-blue-900 mt-1">Từ 500 Triệu đ</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-900">Kiểm định và bảo trì hệ thống PCCC thông minh</span>
                <span className="text-[11px] text-slate-500">Giám sát 24/7 qua nền tảng IoT công nghiệp</span>
                <span className="text-xs font-bold text-blue-900 mt-1">Thương lượng</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  toast.success("Đã kết nối với Ban Giám Đốc Tập đoàn Cơ điện Thăng Long!");
                  setShowStorefront(false);
                }}
                className="w-full py-3 bg-sky-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-sky-900 transition"
              >
                <Phone className="size-4" />
                <span>Liên hệ Giám đốc Gian Hàng</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
