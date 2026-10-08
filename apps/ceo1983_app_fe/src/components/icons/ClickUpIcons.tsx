import React from "react";
import {
  Trophy,
  Crown,
  Award,
  Gift,
  Sparkles,
  Star,
  Package,
  Handshake,
  Ticket,
  Flame,
  Coins,
  ShoppingBag,
  Boxes,
  Zap,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Users,
  Eye,
  SlidersHorizontal,
  Save,
  Plus,
  Trash2,
  X,
  Volume2,
  VolumeX,
  Bell,
  Search,
  Dices,
  PartyPopper,
  ShieldCheck,
  Medal,
  Gem,
  Tag,
  Laptop,
  Car,
  Plane,
  HeartHandshake,
  Percent,
  Check,
  type LucideIcon,
} from "lucide-react";

/**
 * ClickUp Design System Color Tokens & Variants
 * Sourced directly from ClickUp DESIGN.MD spec
 */
export const CLICKUP_TOKENS = {
  colors: {
    primary: "#202020",
    accent: "#7612FA",
    accentHover: "#6647F0",
    ink: "#090C1D",
    logoPurple: "#6647F0",
    logoBlue: "#0091FF",
    logoPink: "#FF02F0",
    logoOrange: "#F76808",
    aiPink: "#FA12E3",
    aiCyan: "#12D0FA",
    productTeal: "#12A594",
    productYellow: "#FFC800",
    productViolet: "#B38CFF",
    palePurple: "#EFEDFD",
    palePink: "#FFF1FE",
    paleBlue: "#E9E9F6",
    paleOrange: "#FFECE5",
  },
  gradients: {
    brand: "linear-gradient(135deg, #FF02F0 0%, #7612FA 50%, #0091FF 100%)",
    ai: "linear-gradient(135deg, #FA12E3 0%, #12D0FA 100%)",
    gold: "linear-gradient(135deg, #F76808 0%, #FFC800 100%)",
    teal: "linear-gradient(135deg, #12A594 0%, #0091FF 100%)",
  },
};

/**
 * Icon Map for ClickUp Design System
 */
export const CLICKUP_ICON_MAP: Record<string, LucideIcon> = {
  Trophy,
  Crown,
  Award,
  Gift,
  Sparkles,
  Star,
  Package,
  Handshake,
  Ticket,
  Flame,
  Coins,
  ShoppingBag,
  Boxes,
  Zap,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Users,
  Eye,
  SlidersHorizontal,
  Save,
  Plus,
  Trash2,
  X,
  Volume2,
  VolumeX,
  Bell,
  Search,
  Dices,
  PartyPopper,
  ShieldCheck,
  Medal,
  Gem,
  Tag,
  Laptop,
  Car,
  Plane,
  HeartHandshake,
  Percent,
  Check,
};

export type ClickUpIconName = keyof typeof CLICKUP_ICON_MAP;

export type ClickUpColorVariant =
  | "purple"
  | "blue"
  | "pink"
  | "orange"
  | "teal"
  | "yellow"
  | "gradient-brand"
  | "gradient-ai"
  | "gradient-gold"
  | "mono"
  | "white";

export interface ClickUpIconProps extends React.SVGProps<SVGSVGElement> {
  name: ClickUpIconName | string;
  variant?: ClickUpColorVariant;
  size?: number | string;
  className?: string;
}

/**
 * ClickUp Official Logo Mark (4-color gradient)
 */
export function ClickUpMark({ className = "w-6 h-6", size }: { className?: string; size?: number }) {
  const s = size || 24;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="clickup-chevron-grad" x1="2" y1="16" x2="22" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF02F0" />
          <stop offset="0.5" stopColor="#7612FA" />
          <stop offset="1" stopColor="#0091FF" />
        </linearGradient>
      </defs>
      {/* ClickUp Chevron Mark */}
      <path
        d="M4.5 14.5L12 7.5L19.5 14.5"
        stroke="url(#clickup-chevron-grad)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* ClickUp Dot/Bar */}
      <circle cx="12" cy="18" r="2.2" fill="#0091FF" />
    </svg>
  );
}

/**
 * Dynamic ClickUp Icon Renderer
 */
export function ClickUpIcon({
  name,
  variant = "purple",
  size = 18,
  className = "",
  ...props
}: ClickUpIconProps) {
  const IconComponent = CLICKUP_ICON_MAP[name] || Gift;

  const colorStyles: Record<ClickUpColorVariant, string> = {
    purple: "text-[#7612FA]",
    blue: "text-[#0091FF]",
    pink: "text-[#FF02F0]",
    orange: "text-[#F76808]",
    teal: "text-[#12A594]",
    yellow: "text-[#FFC800]",
    "gradient-brand": "text-[#7612FA]",
    "gradient-ai": "text-[#FA12E3]",
    "gradient-gold": "text-[#FFC800]",
    mono: "text-slate-400",
    white: "text-white",
  };

  return (
    <IconComponent
      size={size}
      className={`${colorStyles[variant] || ""} ${className}`}
      {...props}
    />
  );
}

/**
 * ClickUp Styled Badge with Icon Container
 */
export function ClickUpBadgeIcon({
  name,
  variant = "purple",
  size = 18,
  containerClassName = "",
}: {
  name: ClickUpIconName | string;
  variant?: ClickUpColorVariant;
  size?: number;
  containerClassName?: string;
}) {
  const containerStyles: Record<ClickUpColorVariant, string> = {
    purple: "bg-[#7612FA]/15 border-[#7612FA]/30 text-[#7612FA]",
    blue: "bg-[#0091FF]/15 border-[#0091FF]/30 text-[#0091FF]",
    pink: "bg-[#FF02F0]/15 border-[#FF02F0]/30 text-[#FF02F0]",
    orange: "bg-[#F76808]/15 border-[#F76808]/30 text-[#F76808]",
    teal: "bg-[#12A594]/15 border-[#12A594]/30 text-[#12A594]",
    yellow: "bg-[#FFC800]/15 border-[#FFC800]/30 text-[#FFC800]",
    "gradient-brand": "bg-gradient-to-br from-[#FF02F0]/20 via-[#7612FA]/20 to-[#0091FF]/20 border-[#7612FA]/40 text-[#B38CFF]",
    "gradient-ai": "bg-gradient-to-br from-[#FA12E3]/20 to-[#12D0FA]/20 border-[#12D0FA]/40 text-[#12D0FA]",
    "gradient-gold": "bg-gradient-to-br from-[#F76808]/20 to-[#FFC800]/20 border-[#FFC800]/40 text-[#FFC800]",
    mono: "bg-slate-800 border-slate-700 text-slate-300",
    white: "bg-white/10 border-white/20 text-white",
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-2xl border p-2.5 shadow-sm transition-transform hover:scale-105 ${
        containerStyles[variant] || containerStyles.purple
      } ${containerClassName}`}
    >
      <ClickUpIcon name={name} variant={variant} size={size} />
    </div>
  );
}

/**
 * ClickUp Icon Picker for Forms & Setups
 */
export const CLICKUP_POPULAR_ICONS: Array<{ name: ClickUpIconName; label: string; variant: ClickUpColorVariant }> = [
  { name: "Crown", label: "Vương miện / Đặc biệt", variant: "gradient-gold" },
  { name: "Trophy", label: "Cúp danh giá / Nhất", variant: "yellow" },
  { name: "Medal", label: "Huy chương / Nhì", variant: "blue" },
  { name: "Award", label: "Bằng khen / Ba", variant: "teal" },
  { name: "Gift", label: "Hộp quà tặng", variant: "purple" },
  { name: "Gem", label: "Kim cương / VIP", variant: "pink" },
  { name: "Sparkles", label: "Tỏa sáng / Tri ân", variant: "gradient-brand" },
  { name: "PartyPopper", label: "Pháo hoa sự kiện", variant: "orange" },
  { name: "ShoppingBag", label: "Sản phẩm / Dịch vụ", variant: "teal" },
  { name: "Tag", label: "Voucher / Ưu đãi", variant: "blue" },
  { name: "Coins", label: "Hiện kim / Tiền mặt", variant: "yellow" },
  { name: "Car", label: "Phương tiện / Ô tô", variant: "purple" },
  { name: "Laptop", label: "Công nghệ / Thiết bị", variant: "blue" },
  { name: "Plane", label: "Kỳ nghỉ / Du lịch", variant: "teal" },
];
