import type { ReactNode } from "react";
import { SortHeader } from "@/components/dashboard/DataTablePagination";
import type { SortDir } from "@/hooks/use-table-controls";

export type TableColumn = string | { label: string; key?: string; align?: "left" | "right" };

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-[26px] font-bold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "primary",
  index,
  theme,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
  index?: number;
  theme?: "blue" | "purple" | "orange" | "green";
  icon?: ReactNode;
}) {
  const cardThemes = [
    {
      cardBg: "bg-gradient-to-b from-sky-100 to-slate-50 dark:from-sky-950/40 dark:to-slate-900 border-sky-200/70 dark:border-sky-800/40",
      labelColor: "text-blue-600 dark:text-sky-400",
      iconBg: "bg-blue-600 text-white",
    },
    {
      cardBg: "bg-gradient-to-b from-violet-100 to-white dark:from-indigo-950/40 dark:to-slate-900 border-violet-200/70 dark:border-indigo-800/40",
      labelColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-600 text-white",
    },
    {
      cardBg: "bg-gradient-to-b from-orange-100 to-white dark:from-amber-950/40 dark:to-slate-900 border-orange-200/70 dark:border-orange-800/40",
      labelColor: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-500 text-white",
    },
    {
      cardBg: "bg-gradient-to-b from-green-100 to-white dark:from-emerald-950/40 dark:to-slate-900 border-emerald-200/70 dark:border-emerald-800/40",
      labelColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-600 text-white",
    },
  ];

  let resolvedTheme = cardThemes[0];
  if (theme === "blue") resolvedTheme = cardThemes[0];
  else if (theme === "purple") resolvedTheme = cardThemes[1];
  else if (theme === "orange") resolvedTheme = cardThemes[2];
  else if (theme === "green") resolvedTheme = cardThemes[3];
  else if (typeof index === "number") resolvedTheme = cardThemes[index % 4];
  else {
    // Map tone to one of the 4 themes
    if (tone === "warning" || tone === "danger") resolvedTheme = cardThemes[2]; // orange
    else if (tone === "success") resolvedTheme = cardThemes[3]; // green
    else if (tone === "info") resolvedTheme = cardThemes[1]; // purple
    else resolvedTheme = cardThemes[0]; // blue
  }

  return (
    <div className={`flex h-32 flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all hover:scale-[1.01] hover:shadow-md ${resolvedTheme.cardBg}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`truncate text-xs font-bold uppercase tracking-wider ${resolvedTheme.labelColor}`}>
          {label}
        </span>
        {icon && (
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-xs ${resolvedTheme.iconBg}`}
          >
            {icon}
          </div>
        )}
      </div>
      <div>
        <div className="truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</div>
        {hint ? (
          <div className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">{hint}</div>
        ) : (
          <div className="mt-1 text-[11px] text-transparent select-none">.</div>
        )}
      </div>
    </div>
  );
}

export function Pill({
  children,
  color,
  tone,
}: {
  children: ReactNode;
  color?: "neutral" | "success" | "warning" | "danger" | "info" | "primary";
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "primary" | "warn";
}) {
  const effectiveTone = tone === "warn" ? "warning" : (tone || color || "neutral");
  const styles: Record<string, { bg: string; fg: string }> = {
    neutral: { bg: "oklch(0.94 0.01 250)", fg: "oklch(0.40 0.02 250)" },
    success: { bg: "oklch(0.93 0.07 155)", fg: "oklch(0.40 0.16 155)" },
    warning: { bg: "oklch(0.94 0.09 75)", fg: "oklch(0.45 0.14 65)" },
    danger: { bg: "oklch(0.93 0.06 25)", fg: "oklch(0.50 0.20 25)" },
    info: { bg: "oklch(0.94 0.05 220)", fg: "oklch(0.42 0.15 220)" },
    primary: { bg: "oklch(0.94 0.06 265)", fg: "oklch(0.40 0.18 265)" },
  };
  const s = styles[effectiveTone] || styles.neutral;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.fg }} />
      {children}
    </span>
  );
}

export function TableShell({
  columns,
  children,
  sort,
  footer,
}: {
  columns?: TableColumn[];
  children: ReactNode;
  sort?: { sortKey: string | null; sortDir: SortDir; onSort: (key: string) => void };
  footer?: ReactNode;
}) {
  const hasColumns = Array.isArray(columns) && columns.length > 0;

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        {hasColumns ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {(columns || []).map((c, i) => {
                  const col = typeof c === "string" ? { label: c } : c;
                  if (sort && col.key) {
                    return (
                      <SortHeader
                        key={col.key}
                        label={col.label}
                        columnKey={col.key}
                        sortKey={sort.sortKey}
                        sortDir={sort.sortDir}
                        onSort={sort.onSort}
                        align={col.align}
                      />
                    );
                  }
                  return (
                    <th
                      key={col.label + i}
                      className={`px-4 py-3 ${col.align === "right" ? "text-right" : ""}`}
                    >
                      {col.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>{children}</tbody>
          </table>
        ) : (
          children
        )}
      </div>
      {footer}
    </Card>
  );
}

export function fmtVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtDate(iso: string) {
  if (iso === "—") return "—";
  return new Date(iso).toLocaleDateString("vi-VN");
}
