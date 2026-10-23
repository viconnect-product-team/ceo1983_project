import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef, Component, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useServerData } from "@/hooks/use-server-data";
import { listMembers } from "@/lib/member-app.functions";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatThread } from "@/components/messages/ChatThread";
import { FeedView } from "@/components/feed/FeedView";
import { SeasonalEventHeader } from "@/components/member/SeasonalEventHeader";
import type { MyConversation, DirectoryMember } from "@/components/messages/types";
import {
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  Newspaper,
  Search,
  Menu,
  X,
  Briefcase,
  Calendar,
  QrCode,
  Users,
  Handshake,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export { isSelfUser } from "@/components/messages/message-utils";

const messagesSearchSchema = z.object({
  peerCode: z.string().optional(),
  peerName: z.string().optional(),
  tab: z.enum(["feed", "messages"]).optional(),
  postId: z.string().optional(),
});

export const Route = createFileRoute("/association/messages")({
  validateSearch: (search: Record<string, unknown>) => messagesSearchSchema.parse(search),
  component: MessagesScreen,
});

interface MessagesErrorBoundaryProps {
  children: ReactNode;
}

interface MessagesErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class MessagesErrorBoundary extends Component<
  MessagesErrorBoundaryProps,
  MessagesErrorBoundaryState
> {
  constructor(props: MessagesErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): MessagesErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("MessagesScreen caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
            <MessageSquare className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            Không thể tải tin nhắn
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Đã có sự cố kết nối hoặc dữ liệu hiển thị. Vui lòng bấm thử lại để làm mới giao diện.
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MessagesScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const fetchMembers = useServerFn(listMembers);
  const { data: members = [] } = useServerData<DirectoryMember[]>(
    () => fetchMembers(),
    [],
    "vba_directory_members",
  );

  const [mainTab, setMainTab] = useState<"feed" | "messages">(() => {
    if (search.peerCode) return "messages";
    if (search.tab === "messages") return "messages";
    return "feed";
  });

  const [active, setActive] = useState<MyConversation | null>(() => {
    if (search.peerCode) {
      return {
        peerCode: search.peerCode,
        name: search.peerName || search.peerCode.toUpperCase(),
        last: "",
        time: "Vừa xong",
        unread: 0,
      };
    }
    return null;
  });

  // State for Network Header: Search & Dropdown Menu
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState<"all" | "opps" | "posts" | "events" | "meetings">("all");
  const [searchFocused, setSearchFocused] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (search.peerCode) {
      setActive({
        peerCode: search.peerCode,
        name: search.peerName || search.peerCode.toUpperCase(),
        last: "",
        time: "Vừa xong",
        unread: 0,
      });
      setMainTab("messages");
    }
  }, [search.peerCode, search.peerName]);

  const handleOpenConversation = (c: MyConversation) => {
    if (!c) return;
    c.unread = 0;
    try {
      const userRecentsKey = user?.id
        ? `vba.recent_conversations_${user.id}`
        : "vba.recent_conversations";
      const raw =
        localStorage.getItem(userRecentsKey) || localStorage.getItem("vba.recent_conversations");
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          const updated = list.map((item: any) =>
            item?.peerCode &&
            String(item.peerCode).toLowerCase() === String(c.peerCode).toLowerCase()
              ? { ...item, unread: 0 }
              : item,
          );
          const serialized = JSON.stringify(updated);
          localStorage.setItem(userRecentsKey, serialized);
          localStorage.setItem("vba.recent_conversations", serialized);
        }
      }
    } catch {}
    setActive(c);
  };

  return (
    <MessagesErrorBoundary>
      {active ? (
        <ChatThread peer={active} onBack={() => setActive(null)} members={members || []} />
      ) : (
        <div
          className="w-full min-h-screen bg-stone-50 dark:bg-slate-950 flex flex-col pb-24 font-sans relative transition-colors duration-300"
          style={{
            backgroundImage: "var(--festival-bg-image, none)",
            backgroundSize: "cover",
            backgroundAttachment: "fixed",
            backgroundPosition: "center",
          }}
        >
          <SeasonalEventHeader />
          {/* ── HEADER MẠNG LƯỚI CEO 1983 (YÊU CẦU 2) ── */}
          <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 py-2 shadow-xs transition-all">
            <div className="w-full flex items-center justify-between gap-2">
              {/* 1. Logo số 8 của CEO 1983 */}
              <Link
                to="/association"
                className="shrink-0 flex items-center gap-1.5 focus:outline-none group cursor-pointer"
                title="Về Trang Chủ CEO 1983"
              >
                <div className="relative size-9 rounded-xl overflow-hidden shadow-xs border border-amber-500/20 group-hover:scale-105 transition-transform flex items-center justify-center bg-gradient-to-br from-[#002855] to-[#001733]">
                  <img
                    src="/ceo1983-emblem-8.png"
                    alt="CEO 1983 Logo số 8"
                    className="size-8 object-contain drop-shadow"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                  <span className="text-amber-400 font-black text-xs tracking-tighter" style={{ display: "none" }}>
                    8
                  </span>
                </div>
              </Link>

              {/* 2. Ô Tìm kiếm đa năng (Cơ hội, Bài viết, Sự kiện, Cuộc gặp) */}
              <div className="flex-1 relative min-w-0">
                <div className="w-full h-9 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 rounded-xl flex items-center gap-2 border border-slate-200/80 dark:border-slate-700/80 transition-colors focus-within:ring-2 focus-within:ring-[#003B95]/30 focus-within:border-[#003B95] dark:focus-within:border-amber-400">
                  <Search className="size-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    placeholder="Tìm cơ hội, bài viết, sự kiện, cuộc gặp..."
                    className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown gợi ý / tìm kiếm nhanh khi gõ */}
                {searchFocused && searchQuery.trim().length > 0 && (
                  <div className="absolute top-11 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2.5 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Tìm kiếm trong danh mục
                      </span>
                      <button
                        type="button"
                        onClick={() => setSearchFocused(false)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Đóng
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchFocused(false);
                          navigate({ to: "/association/opportunities" });
                        }}
                        className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 flex items-center gap-2 hover:bg-blue-100 transition text-left cursor-pointer"
                      >
                        <Briefcase className="size-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">Cơ hội "{searchQuery}"</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchFocused(false);
                          setMainTab("feed");
                        }}
                        className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 flex items-center gap-2 hover:bg-red-100 transition text-left cursor-pointer"
                      >
                        <Newspaper className="size-3.5 text-red-600 shrink-0" />
                        <span className="truncate">Bài viết "{searchQuery}"</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchFocused(false);
                          navigate({ to: "/association/events" });
                        }}
                        className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center gap-2 hover:bg-amber-100 transition text-left cursor-pointer"
                      >
                        <Calendar className="size-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">Sự kiện "{searchQuery}"</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchFocused(false);
                          navigate({ to: "/association/members", search: { tab: "meetings" } });
                        }}
                        className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 hover:bg-emerald-100 transition text-left cursor-pointer"
                      >
                        <Handshake className="size-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Cuộc gặp "{searchQuery}"</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Icon Menu Dropdown & Icon Tin nhắn */}
              <div className="flex items-center gap-1.5 shrink-0" ref={menuRef}>
                {/* Icon Menu: Bấm show dropdown 4 danh mục */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className={`size-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
                      menuOpen
                        ? "bg-[#002855] text-amber-400 shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                    title="Menu danh mục Mạng lưới"
                    aria-label="Menu Mạng lưới"
                  >
                    <Menu className="size-5" />
                  </button>

                  {/* Dropdown Menu Show xuống 4 danh mục */}
                  {menuOpen && (
                    <div className="absolute right-0 top-11 z-50 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 px-1 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span>Danh mục Mạng Lưới</span>
                        <span className="size-1.5 rounded-full bg-red-500"></span>
                      </div>

                      {/* 1. Tin tức */}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate({ to: "/association/news" });
                        }}
                        className="w-full px-3 py-2.5 rounded-xl hover:bg-red-50/70 dark:hover:bg-red-950/30 flex items-center justify-between text-left transition group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Newspaper className="size-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-red-600 transition-colors">
                              Tin tức
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              Bản tin & thông cáo hiệp hội
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-slate-300 group-hover:text-red-500 group-hover:translate-x-0.5 transition" />
                      </button>

                      {/* 2. Cơ hội mà hội viên public ra */}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate({ to: "/association/opportunities" });
                        }}
                        className="w-full px-3 py-2.5 rounded-xl hover:bg-blue-50/70 dark:hover:bg-blue-950/30 flex items-center justify-between text-left transition group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Briefcase className="size-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                              Cơ hội hội viên public
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              Sàn giao thương B2B CEO 1983
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition" />
                      </button>

                      {/* 3. Sự kiện */}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate({ to: "/association/events" });
                        }}
                        className="w-full px-3 py-2.5 rounded-xl hover:bg-amber-50/70 dark:hover:bg-amber-950/30 flex items-center justify-between text-left transition group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Calendar className="size-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-amber-600 transition-colors">
                              Sự kiện
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              Hội thảo, Gala & Diễn đàn
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition" />
                      </button>

                      {/* 4. Check-in cuộc họp */}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate({ to: "/association/card" });
                        }}
                        className="w-full px-3 py-2.5 rounded-xl hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 flex items-center justify-between text-left transition group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <QrCode className="size-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors">
                              Check-in cuộc họp
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              Quét mã QR điểm danh họp
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. Icon Tin nhắn: Bấm vào thì ra màn tin nhắn */}
                <button
                  type="button"
                  onClick={() => setMainTab((prev) => (prev === "messages" ? "feed" : "messages"))}
                  className={`relative size-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
                    mainTab === "messages"
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                  title={mainTab === "messages" ? "Quay về Bảng tin" : "Mở Tin nhắn"}
                  aria-label="Tin nhắn"
                >
                  <MessageSquare className="size-4.5" />
                  {/* Chấm thông báo badge tin nhắn */}
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
                </button>
              </div>
            </div>
          </header>

          {/* Nội dung chính: Feed hoặc ConversationList */}
          {mainTab === "feed" ? (
            <FeedView searchQuery={searchQuery} />
          ) : (
            <ConversationList onOpen={handleOpenConversation} members={members || []} />
          )}
        </div>
      )}
    </MessagesErrorBoundary>
  );
}
