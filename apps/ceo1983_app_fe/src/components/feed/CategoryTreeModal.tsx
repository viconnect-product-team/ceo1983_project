import React, { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, Check, X, Filter, Sparkles, Building2, Newspaper, Calendar, GraduationCap, Handshake, ShoppingBag } from "lucide-react";

export interface CategoryTreeNode {
  id: string;
  label: string;
  category?: string;
  department?: string;
  icon?: any;
  children?: CategoryTreeNode[];
}

export const CATEGORY_TREE_DATA: CategoryTreeNode[] = [
  {
    id: "ALL",
    label: "Tất Cả Danh Mục",
    category: "ALL",
    department: "ALL",
    icon: Sparkles,
  },
  {
    id: "NEWS_GROUP",
    label: "Tin Tức & Truyền Thông CLB",
    category: "NEWS",
    icon: Newspaper,
    children: [
      { id: "NEWS_ALL", label: "Tất cả tin tức", category: "NEWS", department: "ALL" },
      { id: "NEWS_BTT", label: "Ban Truyền Thông", category: "NEWS", department: "Ban Truyền Thông" },
      { id: "NEWS_BND", label: "Ban Nội Dung & Sự Kiện", category: "NEWS", department: "Ban Nội Dung & Sự Kiện" },
      { id: "NEWS_BXT", label: "Ban Xúc Tiến Thương Mại", category: "NEWS", department: "Ban Xúc Tiến Thương Mại" },
      { id: "NEWS_BDT", label: "Ban Đào Tạo & Phát Triển", category: "NEWS", department: "Ban Đào Tạo & Phát Triển" },
      { id: "NEWS_BHV", label: "Ban Hội Viên & Thi Đua", category: "NEWS", department: "Ban Hội Viên & Thi Đua" },
      { id: "NEWS_BTC", label: "Ban Tài Chính", category: "NEWS", department: "Ban Tài Chính" },
      { id: "NEWS_BTT_EXEC", label: "Ban Thường Trực", category: "NEWS", department: "Ban Thường Trực" },
    ],
  },
  {
    id: "EVENT_GROUP",
    label: "Sự Kiện & Họp Ban",
    category: "EVENT_MEETING",
    icon: Calendar,
    children: [
      { id: "EVENT_ALL", label: "Tất cả sự kiện & cuộc họp", category: "EVENT_MEETING", department: "ALL" },
      { id: "EVENT_EXEC", label: "Kỳ Họp Ban Điều Hành", category: "EVENT_MEETING", department: "Ban Điều Hành" },
      { id: "EVENT_GALA", label: "Hội Thảo & Gala Doanh Nhân", category: "EVENT_MEETING", department: "Gala & Diễn Đàn" },
      { id: "EVENT_B2B", label: "Kết Nối B2B 1-on-1", category: "EVENT_MEETING", department: "Kết Nối Giao Thương" },
    ],
  },
  {
    id: "TRAINING_GROUP",
    label: "Ban Đào Tạo & Phát Triển",
    category: "TRAINING",
    icon: GraduationCap,
    children: [
      { id: "TRAINING_ALL", label: "Tất cả chương trình đào tạo", category: "TRAINING", department: "ALL" },
      { id: "TRAINING_MGMT", label: "Khóa Quản Trị & Điều Hành", category: "TRAINING", department: "Quản Trị Doanh Nghiệp" },
      { id: "TRAINING_SHARING", label: "Chia Sẻ Kinh Nghiệm Thực Chiến", category: "TRAINING", department: "Kinh Nghiệm Thực Chiến" },
    ],
  },
  {
    id: "OPP_GROUP",
    label: "Cơ Hội Chia Sẻ (B2B Leads)",
    category: "OPPORTUNITY",
    icon: Handshake,
    children: [
      { id: "OPP_ALL", label: "Tất cả cơ hội", category: "OPPORTUNITY", department: "ALL" },
      { id: "OPP_INV", label: "Cơ hội đầu tư & góp vốn", category: "OPPORTUNITY", department: "Đầu Tư" },
      { id: "OPP_PARTNER", label: "Tìm đối tác phân phối & cung ứng", category: "OPPORTUNITY", department: "Phân Phối & Cung Ứng" },
    ],
  },
  {
    id: "MARKET_GROUP",
    label: "Sàn Giao Thương B2B",
    category: "MARKETPLACE",
    icon: ShoppingBag,
    children: [
      { id: "MARKET_ALL", label: "Tất cả sản phẩm & dịch vụ", category: "MARKETPLACE", department: "ALL" },
      { id: "MARKET_VIP", label: "Ưu Đãi Độc Quyền Hội Viên CEO 1983", category: "MARKETPLACE", department: "Ưu Đãi Đặc Quyền" },
      { id: "MARKET_PROD", label: "Sản phẩm công nghệ & dịch vụ", category: "MARKETPLACE", department: "Sản Phẩm & Dịch Vụ" },
    ],
  },
];

interface CategoryTreeModalProps {
  isOpen: boolean;
  selectedCategory: string;
  selectedDepartment: string;
  onClose: () => void;
  onSelectCategory: (category: string, department: string) => void;
}

export function CategoryTreeModal({
  isOpen,
  selectedCategory,
  selectedDepartment,
  onClose,
  onSelectCategory,
}: CategoryTreeModalProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    NEWS_GROUP: true,
    EVENT_GROUP: true,
    TRAINING_GROUP: true,
    OPP_GROUP: true,
    MARKET_GROUP: true,
  });

  if (!isOpen) return null;

  const toggleExpand = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleSelect = (node: CategoryTreeNode) => {
    if (node.children && node.children.length > 0) {
      // Toggle expansion when clicking parent
      setExpandedNodes((prev) => ({
        ...prev,
        [node.id]: !prev[node.id],
      }));
      // If clicking parent node, also filter by its category and ALL departments
      if (node.category) {
        onSelectCategory(node.category, "ALL");
        onClose();
      }
    } else {
      onSelectCategory(node.category || "ALL", node.department || "ALL");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] flex flex-col">
        {/* Top Handle on Mobile */}
        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#003B95] dark:text-blue-400 flex items-center justify-center font-bold">
              <Filter className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Cây Danh Mục & Ban Chuyên Môn
              </h3>
              <p className="text-[11px] text-slate-500">Lọc bài viết bảng tin theo cấu trúc cây</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tree List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1">
          {CATEGORY_TREE_DATA.map((parent) => {
            const hasChildren = parent.children && parent.children.length > 0;
            const isExpanded = expandedNodes[parent.id];
            const isParentSelected =
              selectedCategory === parent.category &&
              (!parent.children || selectedDepartment === "ALL");
            const Icon = parent.icon || Folder;

            return (
              <div key={parent.id} className="space-y-0.5">
                {/* Parent Node */}
                <div
                  onClick={() => handleSelect(parent)}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition text-xs font-bold ${
                    isParentSelected
                      ? "bg-blue-50 dark:bg-blue-950/40 text-[#003B95] dark:text-blue-300 border border-blue-200 dark:border-blue-900/50"
                      : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(parent.id, e)}
                        className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {isExpanded ? (
                          <ChevronDown className="size-3.5" />
                        ) : (
                          <ChevronRight className="size-3.5" />
                        )}
                      </button>
                    )}
                    {!hasChildren && <span className="w-4" />}
                    <Icon className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{parent.label}</span>
                  </div>

                  {isParentSelected && <Check className="size-4 text-blue-600 shrink-0" />}
                </div>

                {/* Child Nodes */}
                {hasChildren && isExpanded && (
                  <div className="ml-6 pl-2 border-l-2 border-slate-200 dark:border-slate-800 space-y-0.5">
                    {parent.children!.map((child) => {
                      const isChildSelected =
                        selectedCategory === child.category &&
                        selectedDepartment === child.department;

                      return (
                        <div
                          key={child.id}
                          onClick={() => handleSelect(child)}
                          className={`w-full p-2 rounded-lg flex items-center justify-between cursor-pointer transition text-xs ${
                            isChildSelected
                              ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-900/40"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span className="truncate">{child.label}</span>
                          {isChildSelected && (
                            <Check className="size-3.5 text-amber-600 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002766] transition cursor-pointer text-center"
          >
            Đóng Cây Danh Mục
          </button>
        </div>
      </div>
    </div>
  );
}

