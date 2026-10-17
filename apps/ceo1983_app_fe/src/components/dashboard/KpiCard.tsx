import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Tone = "indigo" | "blue" | "green" | "amber" | "pink";

const toneStyles: Record<Tone, { bg: string; fg: string }> = {
  indigo: { bg: "oklch(0.94 0.06 285)", fg: "oklch(0.50 0.22 280)" },
  blue: { bg: "oklch(0.93 0.05 240)", fg: "oklch(0.52 0.18 240)" },
  green: { bg: "oklch(0.93 0.07 155)", fg: "oklch(0.52 0.16 155)" },
  amber: { bg: "oklch(0.94 0.09 75)", fg: "oklch(0.58 0.16 65)" },
  pink: { bg: "oklch(0.93 0.06 10)", fg: "oklch(0.60 0.20 10)" },
};

export function KpiCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  deltaLabel: string;
  icon: LucideIcon;
  tone: Tone;
}) {
  const s = toneStyles[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: s.bg, color: s.fg }}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="mb-0.5 text-[13px] font-medium text-muted-foreground">{label}</div>
          <div className="text-[26px] font-bold leading-tight tracking-tight text-foreground">
            {value}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-[11.5px]">
        <span className="inline-flex items-center gap-0.5 font-semibold text-success">
          <ArrowUpRight className="h-3.5 w-3.5" />
          {delta}
        </span>
        <span className="text-muted-foreground">{deltaLabel}</span>
      </div>
    </div>
  );
}

export function MiniKpiCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  deltaLabel: string;
  icon: LucideIcon;
  tone: Tone;
}) {
  const s = toneStyles[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="mb-1 text-[12px] font-medium text-muted-foreground">{label}</div>
          <div className="text-[22px] font-bold leading-tight text-foreground">{value}</div>
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: s.bg, color: s.fg }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-[11px]">
        <span className="inline-flex items-center gap-0.5 font-semibold text-success">
          <ArrowUpRight className="h-3 w-3" />
          {delta}
        </span>
        <span className="text-muted-foreground">{deltaLabel}</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   CHUẨN HÓA 4 Ô METRIC CARDS ĐỒNG BỘ TOÀN HỆ THỐNG HIỆP HỘI (ẢNH 2 FIGMA)
   Ô 1: Sky/Blue  |  Ô 2: Violet/Indigo  |  Ô 3: Orange/Amber  |  Ô 4: Green/Emerald
   Kích thước: h-32 p-4 rounded-[20px] outline-[0.5px] outline-slate-200
────────────────────────────────────────────────────────────────────────── */
export type StandardMetricTone = "sky" | "violet" | "orange" | "green";

const STANDARD_METRIC_THEMES: Record<
  StandardMetricTone,
  {
    bgGradient: string;
    textTitle: string;
  }
> = {
  sky: {
    bgGradient: "bg-gradient-to-b from-sky-100 to-slate-50 dark:from-sky-950/40 dark:to-slate-900",
    textTitle: "text-blue-600 dark:text-blue-400",
  },
  violet: {
    bgGradient: "bg-gradient-to-b from-violet-100 to-white dark:from-violet-950/40 dark:to-slate-900",
    textTitle: "text-indigo-500 dark:text-indigo-400",
  },
  orange: {
    bgGradient: "bg-gradient-to-b from-orange-100 to-white dark:from-amber-950/40 dark:to-slate-900",
    textTitle: "text-orange-500 dark:text-amber-400",
  },
  green: {
    bgGradient: "bg-gradient-to-b from-green-100 to-white dark:from-emerald-950/40 dark:to-slate-900",
    textTitle: "text-emerald-500 dark:text-emerald-400",
  },
};

export function StandardMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconUrl,
  tone = "sky",
  index = 0,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconUrl?: string;
  tone?: StandardMetricTone;
  index?: number;
}) {
  const tones: StandardMetricTone[] = ["sky", "violet", "orange", "green"];
  const chosenTone = tones[index % 4] || tone;
  const theme = STANDARD_METRIC_THEMES[chosenTone];

  return (
    <div
      className={`h-32 p-4 ${theme.bgGradient} rounded-[20px] outline outline-[0.50px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs transition hover:shadow-sm`}
    >
      <div className="h-8 flex items-center gap-2">
        {iconUrl ? (
          <img src={iconUrl} className="h-4 w-4 shrink-0" alt="icon" />
        ) : Icon ? (
          <Icon className={`h-4 w-4 shrink-0 ${theme.textTitle}`} />
        ) : null}
        <div className={`${theme.textTitle} text-xs font-semibold font-['Inter'] uppercase tracking-wider`}>
          {title}
        </div>
      </div>
      <div className="text-slate-900 dark:text-slate-100 text-2xl font-bold font-['Inter'] leading-7">
        {value}
      </div>
      {subtitle && (
        <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter'] truncate w-full">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export function StandardMetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  );
}
