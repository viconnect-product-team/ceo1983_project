import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, Component, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useServerData } from "@/hooks/use-server-data";
import { listMembers } from "@/lib/member-app.functions";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatThread } from "@/components/messages/ChatThread";
import { FeedView } from "@/components/feed/FeedView";
import type { MyConversation, DirectoryMember } from "@/components/messages/types";
import { AlertTriangle, RotateCcw, MessageSquare, Newspaper } from "lucide-react";

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
        <div className="w-full min-h-screen bg-stone-50 dark:bg-slate-950 flex flex-col pb-24 font-sans">
          {/* ── SEGMENTED TOP BAR: BẢNG TIN vs TIN NHẮN ── */}
          <div className="ceo-safe-sticky sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 shadow-xs">
            <div className="w-full max-w-sm mx-auto grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setMainTab("feed")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  mainTab === "feed"
                    ? "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Newspaper className="size-4" />
                <span>Bảng tin CLB</span>
              </button>
              <button
                type="button"
                onClick={() => setMainTab("messages")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  mainTab === "messages"
                    ? "bg-white dark:bg-slate-700 text-[#003B95] dark:text-amber-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <MessageSquare className="size-4" />
                <span>Tin nhắn</span>
              </button>
            </div>
          </div>

          {mainTab === "feed" ? (
            <FeedView />
          ) : (
            <ConversationList onOpen={handleOpenConversation} members={members || []} />
          )}
        </div>
      )}
    </MessagesErrorBoundary>
  );
}
