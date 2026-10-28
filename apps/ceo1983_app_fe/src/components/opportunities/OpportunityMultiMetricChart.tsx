import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, BarChart2, DollarSign, Activity, Calendar } from "lucide-react";

export type Timeframe = "15m" | "1h" | "1d" | "1w" | "1m" | "3m" | "1y";

interface OpportunityMultiMetricChartProps {
  opportunities: any[];
  title?: string;
  compact?: boolean;
}

export const OpportunityMultiMetricChart: React.FC<OpportunityMultiMetricChartProps> = ({
  opportunities = [],
  title = "Biến Động Giao Thương 3 Chỉ Số",
  compact = false,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>("1d");

  // Format short currency
  const formatValueVnd = (val: number) => {
    if (!val || val === 0) return "0 đ";
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} Tỷ`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)} Tr`;
    return `${val.toLocaleString("vi-VN")} đ`;
  };

  // Generate dynamic chart points based on REAL opportunities data grouped by requested timeframe
  const chartData = useMemo(() => {
    const now = new Date();
    const nowMs = now.getTime();

    // Determine bucket count and label format based on timeframe
    let buckets: { label: string; start: number; end: number }[] = [];

    if (timeframe === "15m") {
      // Last 6 intervals of 15 minutes
      for (let i = 5; i >= 0; i--) {
        const end = nowMs - i * 15 * 60 * 1000;
        const start = end - 15 * 60 * 1000;
        const d = new Date(end);
        buckets.push({
          label: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
          start,
          end,
        });
      }
    } else if (timeframe === "1h") {
      // Last 8 hours
      for (let i = 7; i >= 0; i--) {
        const end = nowMs - i * 60 * 60 * 1000;
        const start = end - 60 * 60 * 1000;
        const d = new Date(end);
        buckets.push({
          label: `${String(d.getHours()).padStart(2, "0")}:00`,
          start,
          end,
        });
      }
    } else if (timeframe === "1d") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).getTime();
        const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).getTime();
        buckets.push({
          label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
          start,
          end,
        });
      }
    } else if (timeframe === "1w") {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const end = nowMs - i * 7 * 86400000;
        const start = end - 7 * 86400000;
        buckets.push({
          label: `T-${i === 0 ? "Nay" : i}`,
          start,
          end,
        });
      }
    } else if (timeframe === "1m") {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
        buckets.push({
          label: `T${d.getMonth() + 1}`,
          start,
          end,
        });
      }
    } else if (timeframe === "3m") {
      // Last 4 quarters
      for (let i = 3; i >= 0; i--) {
        const qMonth = now.getMonth() - i * 3;
        const d = new Date(now.getFullYear(), qMonth, 1);
        const qNum = Math.floor(d.getMonth() / 3) + 1;
        const start = new Date(d.getFullYear(), (qNum - 1) * 3, 1).getTime();
        const end = new Date(d.getFullYear(), qNum * 3, 0, 23, 59, 59).getTime();
        buckets.push({
          label: `Q${qNum}/${String(d.getFullYear()).slice(2)}`,
          start,
          end,
        });
      }
    } else {
      // Last 3 years
      for (let i = 2; i >= 0; i--) {
        const y = now.getFullYear() - i;
        const start = new Date(y, 0, 1).getTime();
        const end = new Date(y, 11, 31, 23, 59, 59).getTime();
        buckets.push({
          label: `${y}`,
          start,
          end,
        });
      }
    }

    // Populate real opportunities into buckets
    return buckets.map((bucket) => {
      const inBucket = opportunities.filter((o) => {
        const t = o.createdAt || o.time || o.updatedAt;
        if (!t) return false;
        const oppMs = new Date(t).getTime();
        return oppMs >= bucket.start && oppMs <= bucket.end;
      });

      const volume = inBucket.length;

      let totalValue = 0;
      let wonCount = 0;
      for (const o of inBucket) {
        const v = typeof o.estimatedValue === "number" && o.estimatedValue > 0
          ? o.estimatedValue
          : typeof o.budgetMax === "number" && o.budgetMax > 0
          ? o.budgetMax
          : 0;
        totalValue += v;
        if (o.status === "won" || o.status === "claimed" || o.isWon || (o as any).dealStatus === "won") {
          wonCount++;
        }
      }

      // Value normalized in Million VNĐ for chart scaling
      const valueMillion = Math.round(totalValue / 1_000_000);
      const successRate = volume > 0 ? Math.round((wonCount / volume) * 100) : 0;

      return {
        name: bucket.label,
        volume,
        valueMillion,
        successRate,
        rawValue: totalValue,
      };
    });
  }, [opportunities, timeframe]);

  // Aggregate metrics summary for top strip
  const totalVolume = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.volume, 0);
  }, [chartData]);

  const totalVal = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.rawValue, 0);
  }, [chartData]);

  const avgSuccessRate = useMemo(() => {
    const valid = chartData.filter((c) => c.volume > 0);
    if (valid.length === 0) return 0;
    return Math.round(valid.reduce((acc, curr) => acc + curr.successRate, 0) / valid.length);
  }, [chartData]);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-3.5 flex flex-col gap-3 font-['Inter']">
      {/* Header + Timeframe Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-[#003B95] dark:text-blue-400 flex items-center justify-center">
            <Activity className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wide text-slate-900 dark:text-white">
              {title}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              3 chỉ số: Khối lượng • Giá trị • Tỷ lệ thành công
            </p>
          </div>
        </div>

        {/* Timeframe Selectors */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: "15m", label: "Phút" },
            { id: "1h", label: "Giờ" },
            { id: "1d", label: "Ngày" },
            { id: "1w", label: "Tuần" },
            { id: "1m", label: "Tháng" },
            { id: "3m", label: "Quý" },
            { id: "1y", label: "Năm" },
          ].map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => setTimeframe(tf.id as Timeframe)}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                timeframe === tf.id
                  ? "bg-[#003B95] text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Metric Summary Badges */}
      <div className="grid grid-cols-3 gap-2">
        {/* 1. Khối lượng */}
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            <BarChart2 className="size-3 text-[#003B95] dark:text-blue-400" />
            <span className="truncate">Khối lượng deal</span>
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
            {totalVolume} <span className="text-[10px] font-normal text-slate-400">deal</span>
          </div>
        </div>

        {/* 2. Giá trị giao thương */}
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <DollarSign className="size-3 text-emerald-600 dark:text-emerald-400" />
            <span className="truncate">Giá trị giao thương</span>
          </div>
          <div className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-0.5 truncate">
            {formatValueVnd(totalVal)}
          </div>
        </div>

        {/* 3. Tỷ lệ thành công */}
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            <TrendingUp className="size-3 text-amber-500" />
            <span className="truncate">Tỷ lệ thành công</span>
          </div>
          <div className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5">
            {avgSuccessRate}%
          </div>
        </div>
      </div>

      {/* Interactive Composed Chart */}
      <div className={`w-full ${compact ? "h-36" : "h-48"} mt-1`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "#64748B" }}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 9, fill: "#64748B" }}
              domain={[0, "auto"]}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 9, fill: "#F59E0B" }}
              domain={[0, 100]}
              unit="%"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900/95 text-white p-2.5 rounded-xl shadow-lg border border-slate-700 text-xs">
                      <p className="font-bold text-amber-400 mb-1 border-b border-slate-700 pb-1">
                        Khung thời gian: {data.name}
                      </p>
                      <p className="flex justify-between gap-3 text-slate-200">
                        <span>• Khối lượng:</span> <b className="text-blue-300">{data.volume} deal</b>
                      </p>
                      <p className="flex justify-between gap-3 text-slate-200">
                        <span>• Giá trị:</span> <b className="text-emerald-400">{formatValueVnd(data.rawValue)}</b>
                      </p>
                      <p className="flex justify-between gap-3 text-slate-200">
                        <span>• Tỷ lệ chốt:</span> <b className="text-amber-400">{data.successRate}%</b>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Cột Khối lượng: Navy */}
            <Bar yAxisId="left" dataKey="volume" fill="#003B95" radius={[4, 4, 0, 0]} maxBarSize={28} />
            {/* Đường Giá trị: Emerald */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="valueMillion"
              stroke="#059669"
              strokeWidth={2}
              dot={{ r: 2.5, fill: "#059669" }}
            />
            {/* Đường Tỷ lệ thành công: Amber */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="successRate"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ r: 3, fill: "#F59E0B" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend footer */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-xs bg-[#003B95]" />
          <span>Khối lượng deal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#059669]" />
          <span>Giá trị (VNĐ)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#F59E0B]" />
          <span>Tỷ lệ thành công (%)</span>
        </div>
      </div>
    </div>
  );
};
