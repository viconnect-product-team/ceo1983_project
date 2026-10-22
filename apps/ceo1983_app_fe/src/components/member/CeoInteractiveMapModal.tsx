import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  MapPin,
  Calendar,
  Users,
  Handshake,
  ZoomIn,
  ZoomOut,
  Navigation,
  Compass,
  Phone,
  Building2,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";
import { resolveMediaUrl } from "@/lib/api-client";
import { formatDisplayDate } from "@/lib/date-format";

export interface MapMarkerItem {
  id: string;
  type: "member" | "event" | "meeting_1on1" | "meeting_board";
  title: string;
  subtitle: string;
  avatar?: string | null;
  locationName: string;
  lat: number;
  lng: number;
  timeText?: string;
  phone?: string;
  actionUrl?: string;
  highlight?: boolean;
  statusBadge?: string;
}

interface CeoInteractiveMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  members?: any[];
  events?: any[];
  meetings?: any[];
  myMember?: any;
}

// Center of Hanoi (Trung tâm Hà Nội & CEO 1983 headquarters area)
const DEFAULT_CENTER = { lat: 21.0175, lng: 105.7838 }; // Keangnam / Cầu Giấy
const DEFAULT_ZOOM = 13;

export const CeoInteractiveMapModal: React.FC<CeoInteractiveMapModalProps> = ({
  isOpen,
  onClose,
  members = [],
  events = [],
  meetings = [],
  myMember,
}) => {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [activeFilter, setActiveFilter] = useState<"all" | "member" | "event" | "meeting_1on1" | "meeting_board">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerItem | null>(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [isSharingLocation, setIsSharingLocation] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("vba_location_sharing_enabled") !== "false";
  });

  // Safe coordinates generator centered around key Hanoi business landmarks
  const landmarkCoords: Record<string, { lat: number; lng: number }> = {
    keangnam: { lat: 21.0169, lng: 105.7836 },
    marriott: { lat: 21.0089, lng: 105.7876 },
    ncc: { lat: 21.0056, lng: 105.7891 }, // Trung tâm Hội nghị Quốc gia
    lotte: { lat: 21.0319, lng: 105.8131 },
    hoankiem: { lat: 21.0285, lng: 105.8542 },
    caugiay: { lat: 21.0362, lng: 105.7905 },
    my_dinh: { lat: 21.0205, lng: 105.7645 },
    tay_ho: { lat: 21.0601, lng: 105.8202 },
  };

  const markers: MapMarkerItem[] = useMemo(() => {
    const list: MapMarkerItem[] = [];

    // 1. Hội viên bật định vị GPS
    if (isSharingLocation) {
      members.forEach((m, idx) => {
        // Offset coordinates realistically around Hanoi business hubs
        const baseKey = Object.keys(landmarkCoords)[idx % Object.keys(landmarkCoords).length];
        const base = landmarkCoords[baseKey];
        const latOffset = ((idx * 37) % 100 - 50) * 0.0007;
        const lngOffset = ((idx * 53) % 100 - 50) * 0.0007;
        const lat = m.lat || (base.lat + latOffset);
        const lng = m.lng || (base.lng + lngOffset);

        list.push({
          id: `mem-${m.id || m.code || idx}`,
          type: "member",
          title: m.name || m.contact || "Hội viên CEO 1983",
          subtitle: m.company || m.title || "Doanh nghiệp CLB",
          avatar: m.avatar ? resolveMediaUrl(m.avatar) : null,
          locationName: m.address || m.companyAddress || "Khu vực Hà Nội",
          lat,
          lng,
          phone: m.phone || "",
          highlight: Boolean(m.code === myMember?.code),
          statusBadge: "Đang chia sẻ vị trí",
        });
      });
    }

    // 2. Sự kiện sắp diễn ra tại đúng vị trí khai báo
    events.forEach((ev, idx) => {
      const locLower = (ev.location || ev.venue || "").toLowerCase();
      let lat = 21.0089;
      let lng = 105.7876;
      if (locLower.includes("keangnam")) {
        lat = landmarkCoords.keangnam.lat;
        lng = landmarkCoords.keangnam.lng;
      } else if (locLower.includes("hội nghị") || locLower.includes("ncc")) {
        lat = landmarkCoords.ncc.lat;
        lng = landmarkCoords.ncc.lng;
      } else if (locLower.includes("lotte")) {
        lat = landmarkCoords.lotte.lat;
        lng = landmarkCoords.lotte.lng;
      } else if (locLower.includes("hoàn kiếm")) {
        lat = landmarkCoords.hoankiem.lat;
        lng = landmarkCoords.hoankiem.lng;
      } else {
        const offset = (idx * 0.003);
        lat = landmarkCoords.marriott.lat + offset;
        lng = landmarkCoords.marriott.lng + offset;
      }

      list.push({
        id: `ev-${ev.id || idx}`,
        type: "event",
        title: ev.title || "Sự kiện CLB CEO 1983",
        subtitle: ev.time || "Sắp diễn ra",
        avatar: ev.image ? resolveMediaUrl(ev.image) : null,
        locationName: ev.location || ev.venue || "Trung tâm Hội nghị JW Marriott Hà Nội",
        lat,
        lng,
        timeText: formatDisplayDate(ev.date || ev.start_date || new Date().toISOString()),
        highlight: true,
        statusBadge: "Sự kiện sắp tới",
        actionUrl: "/association/events",
      });
    });

    // 3. Cuộc gặp 1-on-1 (nếu có setup với nhau)
    meetings.forEach((mt, idx) => {
      const is1on1 = mt.venueType === "offline" || mt.type === "1on1" || !mt.title?.includes("Họp Ban");
      const base = landmarkCoords.caugiay;
      const lat = base.lat + ((idx + 1) * 0.002);
      const lng = base.lng + ((idx + 1) * 0.002);

      list.push({
        id: `mt-${mt.id || idx}`,
        type: is1on1 ? "meeting_1on1" : "meeting_board",
        title: mt.title || (is1on1 ? "Gặp gỡ kết nối 1-on-1" : "Cuộc họp Ban Chuyên Môn"),
        subtitle: mt.partnerName || mt.hostName || "Hội viên kết nối",
        avatar: mt.partnerAvatar || mt.hostAvatar || null,
        locationName: mt.venue || mt.location || "Highlands Coffee Cầu Giấy, Hà Nội",
        lat,
        lng,
        timeText: `${mt.time || "09:00"} - ${formatDisplayDate(mt.date || new Date().toISOString())}`,
        highlight: is1on1,
        statusBadge: is1on1 ? "Hẹn gặp 1-on-1" : "Họp Ban CLB",
        phone: mt.partnerPhone || mt.hostPhone,
      });
    });

    return list;
  }, [members, events, meetings, isSharingLocation, myMember]);

  const filteredMarkers = useMemo(() => {
    return markers.filter((m) => {
      if (activeFilter !== "all" && m.type !== activeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.subtitle.toLowerCase().includes(q) ||
          m.locationName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [markers, activeFilter, searchQuery]);

  // Handle GPS location toggling
  const handleToggleLocation = () => {
    const next = !isSharingLocation;
    setIsSharingLocation(next);
    try {
      localStorage.setItem("vba_location_sharing_enabled", String(next));
    } catch {}
  };

  // Recenter map to current user
  const handleRecenter = () => {
    setMapCenter(DEFAULT_CENTER);
    setZoom(DEFAULT_ZOOM);
    setSelectedMarker(null);
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in">
      <div className="w-full max-w-[480px] h-[100dvh] max-h-[100dvh] flex flex-col bg-slate-950 text-white relative overflow-hidden shadow-2xl">
        {/* Top Floating App Bar */}
        <div className="absolute top-0 inset-x-0 z-30 p-3 bg-gradient-to-b from-slate-950 via-slate-950/90 to-transparent flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-[#003B95] text-amber-300 border border-amber-400/40 shadow-md">
                <MapPin className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>BẢN ĐỒ SỐ CEO 1983</span>
                  <span className="size-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                </h3>
                <p className="text-[11px] text-slate-300">
                  Định vị hội viên, sự kiện &amp; cuộc gặp thực tế
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full bg-slate-800/90 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 cursor-pointer transition active:scale-95"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Search bar inside map */}
          <div className="relative flex items-center bg-slate-900/90 rounded-2xl border border-slate-700/80 px-3 py-2 shadow-lg backdrop-blur-md">
            <Search className="size-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm hội viên, sự kiện, địa điểm trên bản đồ..."
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 border-0 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-white p-1">
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "all", label: "Tất cả", count: markers.length },
              { id: "member", label: "Hội viên", count: markers.filter((m) => m.type === "member").length },
              { id: "event", label: "Sự kiện", count: markers.filter((m) => m.type === "event").length },
              { id: "meeting_1on1", label: "Gặp 1-on-1", count: markers.filter((m) => m.type === "meeting_1on1").length },
              { id: "meeting_board", label: "Họp Ban", count: markers.filter((m) => m.type === "meeting_board").length },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id as any)}
                className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border ${
                  activeFilter === f.id
                    ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black"
                    : "bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800"
                }`}
              >
                <span>{f.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === f.id ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-400"}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Map Canvas with Grid & Realistic Map Styling */}
        <div className="flex-1 w-full relative bg-[#0b132b] overflow-hidden select-none">
          {/* Map Grid and Styled Canvas Simulation (Interactive Zoom & Pan) */}
          <div
            className="w-full h-full relative transition-all duration-300 cursor-grab active:cursor-grabbing"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(31, 56, 100, 0.35) 0%, rgba(11, 19, 43, 0.95) 100%),
                linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: `${30 * (zoom / 10)}px ${30 * (zoom / 10)}px`,
            }}
          >
            {/* Hanoi Landmarks Waterways / Ring Roads styling */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
              {/* Ring Road 3 representation */}
              <circle cx="50%" cy="50%" r={`${140 * (zoom / 13)}px`} fill="none" stroke="#1F3864" strokeWidth="4" strokeDasharray="6 3" />
              {/* Red River curve representation */}
              <path d="M 40 0 Q 180 150, 420 180 T 480 320" fill="none" stroke="#003B95" strokeWidth="12" opacity="0.3" />
            </svg>

            {/* Pins on the Map */}
            {filteredMarkers.map((marker, idx) => {
              // Convert lat/lng to visual container positions relative to mapCenter
              const deltaLat = (marker.lat - mapCenter.lat) * (zoom * 1200);
              const deltaLng = (marker.lng - mapCenter.lng) * (zoom * 1200);
              const top = `calc(50% - ${deltaLat}px)`;
              const left = `calc(50% + ${deltaLng}px)`;
              const isSelected = selectedMarker?.id === marker.id;

              return (
                <div
                  key={marker.id}
                  onClick={() => setSelectedMarker(marker)}
                  style={{ top, left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer transition-transform hover:scale-110 active:scale-95"
                >
                  {/* Pin Styles based on Category */}
                  {marker.type === "event" && (
                    <div className="relative flex flex-col items-center">
                      <div className="size-10 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-amber-400 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.7)] animate-pulse">
                        <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-amber-300">
                          <Calendar className="size-5" />
                        </div>
                      </div>
                      <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-950/90 border border-amber-400/80 text-[10px] font-black text-amber-300 whitespace-nowrap shadow-md">
                        {marker.title}
                      </div>
                    </div>
                  )}

                  {marker.type === "member" && (
                    <div className="relative flex flex-col items-center">
                      <div className="size-9 rounded-full bg-emerald-500 p-0.5 shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                        {marker.avatar ? (
                          <img
                            src={marker.avatar}
                            alt={marker.title}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-[#003B95] text-amber-300 flex items-center justify-center text-xs font-black">
                            {marker.title.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="mt-1 px-1.5 py-0.2 rounded-full bg-slate-900/90 border border-emerald-500/60 text-[9px] font-bold text-slate-200 whitespace-nowrap shadow-xs">
                        {marker.title}
                      </div>
                    </div>
                  )}

                  {(marker.type === "meeting_1on1" || marker.type === "meeting_board") && (
                    <div className="relative flex flex-col items-center">
                      <div className="size-9 rounded-2xl bg-gradient-to-tr from-[#003B95] to-blue-500 p-0.5 shadow-[0_0_12px_rgba(0,59,149,0.5)]">
                        <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-blue-300">
                          <Handshake className="size-4" />
                        </div>
                      </div>
                      <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-950/90 border border-blue-400/80 text-[9.5px] font-black text-blue-300 whitespace-nowrap shadow-md">
                        {marker.title}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Floating Controls (Zoom, Recenter, GPS toggle) */}
          <div className="absolute right-3 bottom-24 z-30 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(18, z + 1))}
              className="size-10 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white flex items-center justify-center hover:bg-slate-800 transition active:scale-95 shadow-xl cursor-pointer"
              title="Phóng to"
            >
              <ZoomIn className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(8, z - 1))}
              className="size-10 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white flex items-center justify-center hover:bg-slate-800 transition active:scale-95 shadow-xl cursor-pointer"
              title="Thu nhỏ"
            >
              <ZoomOut className="size-5" />
            </button>
            <button
              type="button"
              onClick={handleRecenter}
              className="size-10 rounded-2xl bg-[#003B95] border border-amber-400/60 text-amber-300 flex items-center justify-center hover:bg-blue-900 transition active:scale-95 shadow-xl cursor-pointer"
              title="Căn giữa định vị của tôi"
            >
              <Navigation className="size-5" />
            </button>
            <button
              type="button"
              onClick={handleToggleLocation}
              className={`size-10 rounded-2xl border flex items-center justify-center transition active:scale-95 shadow-xl cursor-pointer ${
                isSharingLocation
                  ? "bg-emerald-600 border-emerald-400 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
              title={isSharingLocation ? "Đang bật định vị cá nhân" : "Đã tắt định vị cá nhân"}
            >
              <Compass className="size-5" />
            </button>
          </div>

          {/* Selected Marker Detail Card (Bottom Sheet Preview) */}
          {selectedMarker && (
            <div className="absolute bottom-3 inset-x-3 z-30 p-3.5 rounded-3xl bg-slate-900/95 border border-amber-500/40 shadow-2xl backdrop-blur-xl animate-slide-up flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center">
                    {selectedMarker.avatar ? (
                      <img src={selectedMarker.avatar} alt={selectedMarker.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base font-black text-amber-400">{selectedMarker.title.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {selectedMarker.statusBadge}
                    </span>
                    <h4 className="text-sm font-black text-white leading-tight mt-0.5">{selectedMarker.title}</h4>
                    <p className="text-xs text-slate-400">{selectedMarker.subtitle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMarker(null)}
                  className="size-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800">
                <MapPin className="size-4 text-amber-400 shrink-0" />
                <span className="truncate">{selectedMarker.locationName}</span>
              </div>

              {selectedMarker.timeText && (
                <div className="flex items-center gap-2 text-xs text-slate-300 px-1">
                  <Clock className="size-3.5 text-blue-400 shrink-0" />
                  <span>{selectedMarker.timeText}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                {selectedMarker.phone && (
                  <a
                    href={`tel:${selectedMarker.phone}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center transition flex items-center justify-center gap-1.5"
                  >
                    <Phone className="size-3.5" />
                    <span>Gọi điện</span>
                  </a>
                )}
                {selectedMarker.actionUrl ? (
                  <a
                    href={selectedMarker.actionUrl}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#003B95] hover:bg-blue-900 text-white text-xs font-bold text-center transition flex items-center justify-center gap-1.5"
                  >
                    <span>Xem chi tiết</span>
                    <ChevronRight className="size-3.5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Đang khởi tạo kết nối với ${selectedMarker.title}`);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-xs font-black text-center transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Handshake className="size-4" />
                    <span>Hẹn gặp B2B</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
