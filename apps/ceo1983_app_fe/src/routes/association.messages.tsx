import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, Component, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useServerData } from "@/hooks/use-server-data";
import { listMembers } from "@/lib/member-app.functions";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatThread } from "@/components/messages/ChatThread";
import type { MyConversation, DirectoryMember } from "@/components/messages/types";
import { AlertTriangle, RotateCcw, MessageSquare } from "lucide-react";

export { isSelfUser } from "@/components/messages/message-utils";

const messagesSearchSchema = z.object({
  peerCode: z.string().optional(),
  peerName: z.string().optional(),
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
            className="mt-4 px-5 py-2.5 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002B70] transition shadow-sm cursor-pointer"
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
        <ConversationList onOpen={handleOpenConversation} members={members || []} />
      )}
    </MessagesErrorBoundary>
  );
}
