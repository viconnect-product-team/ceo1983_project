import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef, Component, useCallback, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useServerData } from "@/hooks/use-server-data";
import { listMembers } from "@/lib/member-app.functions";
import { fetchNestApi } from "@/lib/api-client";
import { getConnectAppSocket } from "@/hooks/use-connect-app-socket";
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
  Bell,
} from "lucide-react";

export { isSelfUser } from "@/components/messages/message-utils";

const messagesSearchSchema = z.object({
  peerCode: z.string().optional(),
  peerName: z.string().optional(),
  tab: z.enum(["feed", "messages"]).optional(),
  postId: z.string().optional(),
  share_title: z.string().optional(),
  share_text: z.string().optional(),
  share_url: z.string().optional(),
  title: z.string().optional(),
  text: z.string().optional(),
  url: z.string().optional(),
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
            className="mt-4 px-5 py-2.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
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

  const shareTitle = search.share_title || search.title || "";
  const shareText = search.share_text || search.text || "";
  const shareUrl = search.share_url || search.url || "";
  const hasShare = Boolean(shareUrl || shareTitle || shareText);

  const initialShare = hasShare
    ? { title: shareTitle, text: shareText, url: shareUrl }
    : undefined;

  const [mainTab, setMainTab] = useState<"feed" | "messages">(() => {
    if (search.peerCode || search.tab === "messages") return "messages";
    return "feed";
  });

  useEffect(() => {
    if (search.tab === "messages" || search.peerCode) {
      setMainTab("messages");
    } else {
      setMainTab("feed");
      setActive(null);
    }
  }, [search.tab, search.peerCode]);

  // Luôn reset về giao diện Mạng Lưới khi người dùng bấm tab Mạng Lưới ở Footer
  useEffect(() => {
    const handleReset = () => {
      setActive(null);
      setMainTab("feed");
    };
    window.addEventListener("vba:reset_network_tab", handleReset);
    return () => window.removeEventListener("vba:reset_network_tab", handleReset);
  }, []);

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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState<"all" | "opps" | "posts" | "events" | "meetings">("all");
  const [searchFocused, setSearchFocused] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Debounce search input: 350ms delay to prevent repeated API calls on keystrokes/spaces
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Dynamic Realtime Unread Notification and Message Counts
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState<number>(0);

  const refreshUnreadCounters = useCallback(() => {
    // 1. Unread notifications
    try {
      fetchNestApi<any[]>("/notifications")
        .then((res) => {
          if (Array.isArray(res)) {
            const unread = res.filter((n: any) => !n.isRead && !n.is_read).length;
            setUnreadNotifCount(unread);
          }
        })
        .catch(() => {});
    } catch {}

    // 2. Unread messages
    try {
      const userRecentsKey = user?.id ? `vba.recent_conversations_${user.id}` : "vba.recent_conversations";
      const raw = localStorage.getItem(userRecentsKey) || localStorage.getItem("vba.recent_conversations");
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          const totalUnread = list.reduce((sum: number, c: any) => sum + (Number(c.unread) || 0), 0);
          setUnreadMsgCount(totalUnread);
        }
      }
    } catch {}
  }, [user?.id]);

  useEffect(() => {
    refreshUnreadCounters();

    const socket = getConnectAppSocket();
    const handleNotifUpdate = (payload?: any) => {
      if (typeof payload?.unreadCount === "number") {
        setUnreadNotifCount(payload.unreadCount);
      } else if (typeof payload?.count === "number") {
        setUnreadNotifCount(payload.count);
      } else {
        refreshUnreadCounters();
      }
    };
    const handleMsgUpdate = () => {
      refreshUnreadCounters();
    };

    socket.on("notification:new", handleNotifUpdate);
    socket.on("notification:unread_count", handleNotifUpdate);
    socket.on("notification:count", handleNotifUpdate);
    socket.on("notification:updated", handleNotifUpdate);
    socket.on("dm:message_received", handleMsgUpdate);
    socket.on("dm:thread_updated", handleMsgUpdate);

    window.addEventListener("vba.notifications.changed", refreshUnreadCounters);
    window.addEventListener("notifications-updated", refreshUnreadCounters);
    window.addEventListener("vba:message:new", refreshUnreadCounters);
    window.addEventListener("storage", refreshUnreadCounters);

    return () => {
      socket.off("notification:new", handleNotifUpdate);
      socket.off("notification:unread_count", handleNotifUpdate);
      socket.off("notification:count", handleNotifUpdate);
      socket.off("notification:updated", handleNotifUpdate);
      socket.off("dm:message_received", handleMsgUpdate);
      socket.off("dm:thread_updated", handleMsgUpdate);

      window.removeEventListener("vba.notifications.changed", refreshUnreadCounters);
      window.removeEventListener("notifications-updated", refreshUnreadCounters);
      window.removeEventListener("vba:message:new", refreshUnreadCounters);
      window.removeEventListener("storage", refreshUnreadCounters);
    };
  }, [refreshUnreadCounters]);

  // Set document title chuẩn mực cho Mạng Lưới Hội Viên & Bản Tin Doanh Nhân CEO 1983
  useEffect(() => {
    document.title = "Mạng Lưới Hội Viên & Bản Tin Doanh Nhân CEO 1983";
  }, []);

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
    } catch { }
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
          {/* Khi ở tab tin nhắn: chỉ hiển thị thanh tìm kiếm của tin nhắn kèm ConversationList, ẩn toàn bộ header mạng lưới */}
          {mainTab === "messages" ? (
            <ConversationList
              onOpen={handleOpenConversation}
              members={members || []}
              onBack={() => setMainTab("feed")}
            />
          ) : (
            <>
              <SeasonalEventHeader />
              {/* ── HEADER MẠNG LƯỚI CEO 1983 ── */}
              <header
                className="sticky top-0 z-40 w-full px-4 pb-2 bg-white dark:bg-slate-900 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)] border-b border-slate-100 dark:border-slate-800 transition-all"
                style={{
                  paddingTop: "calc(max(env(safe-area-inset-top, 0px), 54px) + 8px)",
                  minHeight: "calc(max(env(safe-area-inset-top, 0px), 54px) + 58px)",
                }}
              >
                <div className="w-full flex items-center justify-between gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    {/* 1. Nút Menu */}
                    <div className="relative" ref={menuRef}>
                      <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        title="Menu tính năng"
                      >
                        <img src="/icons/feed/menu-01.svg" alt="Menu" className="size-5" />
                      </button>

                      {/* Dropdown Menu Show xuống 4 danh mục */}
                      {menuOpen && (
                        <div className="absolute left-0 top-11 z-50 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 px-1 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                          <div className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="truncate">Mạng Lưới Hội Viên & Bản Tin CEO 1983</span>
                            <span className="size-1.5 rounded-full bg-red-500 shrink-0"></span>
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

                    {/* 2. Ô Tìm kiếm đa năng bo tròn 99px theo chuẩn user */}
                    <div className="relative flex-1">
                      <div className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-[99px] outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-700 flex items-center gap-2">
                        <img src="/icons/feed/search-01.svg" alt="Search" className="size-4 shrink-0" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => setSearchFocused(true)}
                          placeholder="Tìm cơ hội, bài viết, sự kiện, cuộc..."
                          className="w-full bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm font-normal font-['Inter'] leading-5"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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
                              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
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
                  </div>

                  {/* 3. Cụm nút Tin nhắn & Thông báo chuông badge realtime */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Nút Tin nhắn chuyển sang ConversationList */}
                    <div className="relative inline-flex flex-col justify-start items-start">
                      <button
                        type="button"
                        onClick={() => setMainTab("messages")}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 inline-flex items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        title="Tin nhắn"
                      >
                        <MessageSquare className="size-5 text-slate-800 dark:text-slate-200" />
                      </button>
                      {unreadMsgCount > 0 && (
                        <div className="px-1 left-[14px] -top-1 absolute bg-[#003B95] rounded-[100px] inline-flex justify-center items-center overflow-hidden pointer-events-none ring-1 ring-white dark:ring-slate-900 shadow-xs">
                          <div className="text-center text-white text-[10px] font-bold font-['Inter'] leading-4">
                            {unreadMsgCount > 99 ? "99+" : unreadMsgCount}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Nút Thông báo */}
                    <div className="relative inline-flex flex-col justify-start items-start">
                      <button
                        type="button"
                        onClick={() => navigate({ to: "/association/notifications" })}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 inline-flex items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        title="Thông báo"
                      >
                        <Bell className="size-5 text-slate-800 dark:text-slate-200" />
                      </button>
                      {unreadNotifCount > 0 && (
                        <div className="px-1 left-[14px] -top-1 absolute bg-[#DC2626] rounded-[100px] inline-flex justify-center items-center overflow-hidden pointer-events-none ring-1 ring-white dark:ring-slate-900 shadow-xs">
                          <div className="text-center text-white text-[10px] font-bold font-['Inter'] leading-4">
                            {unreadNotifCount > 99 ? "99+" : unreadNotifCount}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </header>

              {/* Bảng tin Feed */}
              <FeedView searchQuery={debouncedSearchQuery} initialShare={initialShare} />
            </>
          )}
        </div>
      )}
    </MessagesErrorBoundary>
  );
}
