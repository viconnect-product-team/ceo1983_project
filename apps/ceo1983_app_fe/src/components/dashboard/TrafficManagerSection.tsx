import React, { useState, useEffect } from 'react';
import { Activity, Globe, Eye, Users, Calendar, RefreshCw, Smartphone, Monitor, Shield, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { fetchNestApi } from '@/lib/api-client';

interface TrafficVisitor {
  id: string;
  slug: string;
  ip: string;
  userAgent?: string;
  referrer?: string;
  device?: string;
  createdAt: string;
}

interface TrafficStats {
  totalVisits: number;
  todayVisits: number;
  uniqueVisitors: number;
  recentVisitors: TrafficVisitor[];
}

export const TrafficManagerSection: React.FC = () => {
  const [stats, setStats] = useState<TrafficStats>({
    totalVisits: 0,
    todayVisits: 0,
    uniqueVisitors: 0,
    recentVisitors: [],
  });
  const [loading, setLoading] = useState(false);

  const loadTraffic = async () => {
    setLoading(true);
    try {
      const data = await fetchNestApi<TrafficStats>('/public/traffic-stats');
      if (data && typeof data.totalVisits === 'number') {
        setStats(data);
      }
    } catch (err: any) {
      console.warn('Lỗi tải traffic stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTraffic();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#003B95] dark:text-blue-400" />
            <span>Quản Lý Lượng Truy Cập & Khách Vãng Lai Landing Page</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
            Hệ thống tự động phát hiện, ghi nhận IP, thiết bị và thông tin lượt truy cập khi có khách vào Landing Page
          </p>
        </div>

        <button
          type="button"
          onClick={loadTraffic}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer self-start sm:self-auto border border-slate-300 dark:border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Tổng lượt truy cập */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Tổng lượt xem trang</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {stats.totalVisits.toLocaleString('vi-VN')}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              Tích lũy toàn hệ thống
            </div>
          </div>
        </div>

        {/* Card 2: Lượt xem hôm nay */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-900">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Truy cập hôm nay</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {stats.todayVisits.toLocaleString('vi-VN')}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Thời gian thực trong ngày
            </div>
          </div>
        </div>

        {/* Card 3: Khách độc nhất */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-900">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Khách truy cập (IP riêng)</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {stats.uniqueVisitors.toLocaleString('vi-VN')}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
              Thiết bị / IP khác nhau
            </div>
          </div>
        </div>
      </div>

      {/* Table Recent Visitors */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            Nhật ký {stats.recentVisitors.length} lượt truy cập gần nhất
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Tự động bắt IP &amp; User-Agent</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="h-11 bg-blue-50/50 dark:bg-blue-950/30 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 text-center w-12">STT</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 w-36">Thời gian</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 w-32">Địa chỉ IP</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 w-28">Thiết bị</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 w-36">Trang / Subdomain</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 min-w-[150px]">Nguồn (Referrer)</th>
                <th className="py-2.5 px-3 min-w-[200px]">Trình duyệt / Thông tin hệ thống</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {stats.recentVisitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400 italic">
                    Chưa có lượt truy cập nào được ghi nhận. Hãy mở thử Landing Page để hệ thống bắt thông tin!
                  </td>
                </tr>
              ) : (
                stats.recentVisitors.map((v, i) => (
                  <tr key={v.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-center text-slate-500 font-mono">
                      {i + 1}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {v.createdAt ? new Date(v.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 font-mono font-bold text-[#003B95] dark:text-blue-400">
                      {v.ip}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
                        {v.device === 'Mobile' ? <Smartphone className="w-3 h-3 text-sky-500" /> : <Monitor className="w-3 h-3 text-slate-500" />}
                        <span>{v.device || 'Desktop'}</span>
                      </span>
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-slate-100">
                      /{v.slug}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-slate-500 truncate max-w-[150px]">
                      {v.referrer || 'Trực tiếp / Direct'}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400 text-[11px] truncate max-w-[250px]" title={v.userAgent}>
                      {v.userAgent || 'Trình duyệt Web'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

