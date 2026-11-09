import React from "react";

export interface ChartAdaptiveTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  formatter?: (value: any, name: any, item: any, index: number) => React.ReactNode | [React.ReactNode, string];
  title?: string;
  unit?: string;
}

export function ChartAdaptiveTooltip({
  active,
  payload,
  label,
  formatter,
  title,
  unit,
}: ChartAdaptiveTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-slate-950/50 text-xs min-w-[160px] max-w-[280px]">
      {/* Tooltip Header / Label */}
      {(label || title) && (
        <div className="mb-2 border-b border-slate-100 pb-1.5 font-bold text-slate-800 dark:border-slate-800 dark:text-slate-200">
          {title || label}
        </div>
      )}

      {/* Tooltip Items */}
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => {
          const color = entry.color || entry.fill || entry.stroke || "#003B95";
          const rawValue = entry.value;
          const name = entry.name || entry.dataKey || "Chỉ số";

          let formattedValue: React.ReactNode = rawValue;
          let displayName = name;

          if (formatter) {
            const formatted = formatter(rawValue, name, entry, index);
            if (Array.isArray(formatted)) {
              formattedValue = formatted[0];
              displayName = formatted[1] || name;
            } else {
              formattedValue = formatted;
            }
          } else if (typeof rawValue === "number") {
            formattedValue = rawValue.toLocaleString("vi-VN");
          }

          return (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[11px] leading-relaxed">
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="size-2 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate text-slate-600 dark:text-slate-400 font-medium">
                  {displayName}
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white shrink-0 font-mono">
                {formattedValue} {unit ? ` ${unit}` : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

