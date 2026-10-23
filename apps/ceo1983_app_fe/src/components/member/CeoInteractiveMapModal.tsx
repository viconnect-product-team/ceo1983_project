import React, { useState, useMemo, useEffect, useRef } from "react";
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
  CheckCircle2,
  MessageSquare,
  Globe,
  Layers,
  UserCheck,
} from "lucide-react";
import { resolveMediaUrl } from "@/lib/api-client";
import { formatDisplayDate } from "@/lib/date-format";

export interface MapMarkerItem {
  id: string;
  type: "member" | "event" | "meeting_1on1" | "meeting_board";
  category: "overview" | "personal"; // Phân loại: Tổng thể vs Cá nhân
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
  isConnected?: boolean;
  isRegistered?: boolean;
  memberCode?: string;
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

// Helper nạp Leaflet động từ CDN nếu chưa có
function loadLeaflet(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject("SSR");
  if ((window as any).L) return Promise.resolve((window as any).L);

  return new Promise((resolve, reject) => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const existingScript = document.getElementById("leaflet-js") as HTMLScriptElement;
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve((window as any).L));
      return;
    }
    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve((window as any).L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export const CeoInteractiveMapModal: React.FC<CeoInteractiveMapModalProps> = ({
  isOpen,
  onClose,
  members = [],
  events = [],
  meetings = [],
  myMember,
}) => {
  // ── 2 DANH MỤC CHÍNH: TỔNG THỂ & CÁ NHÂN (THEO YÊU CẦU 2) ──
  const [activeScope, setActiveScope] = useState<"overview" | "personal">("overview");
  const [activeTypeFilter, setActiveTypeFilter] = useState<"all" | "member" | "event" | "meeting">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerItem | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [isSharingLocation, setIsSharingLocation] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("vba_location_sharing_enabled") !== "false";
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  // Danh sách hội viên đã kết nối (từ localStorage)
  const connectedMemberCodes = useMemo(() => {
    if (typeof window === "undefined") return new Set<string>();
    try {
      const raw = localStorage.getItem("vba_connected_members") || localStorage.getItem("vba.connected_members");
      if (raw) {
        const list = JSON.parse(raw);
        return new Set(list.map((c: any) => String(c).toLowerCase()));
      }
    } catch {}
    return new Set<string>();
  }, [isOpen]);

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

  // Tổng hợp Markers phân loại theo 2 nhóm: Tổng thể và Cá nhân
  const allMarkers: MapMarkerItem[] = useMemo(() => {
    const list: MapMarkerItem[] = [];
    const myCode = myMember?.code?.toLowerCase() || "";

    // 1. Hội viên bật định vị GPS
    if (isSharingLocation) {
      members.forEach((m, idx) => {
        const baseKey = Object.keys(landmarkCoords)[idx % Object.keys(landmarkCoords).length];
        const base = landmarkCoords[baseKey];
        const latOffset = (((idx * 37) % 100) - 50) * 0.0007;
        const lngOffset = (((idx * 53) % 100) - 50) * 0.0007;
        const lat = m.lat || base.lat + latOffset;
        const lng = m.lng || base.lng + lngOffset;
        const code = (m.code || "").toLowerCase();
        const isConnected = connectedMemberCodes.has(code) || connectedMemberCodes.has(String(m.id || "").toLowerCase());
        const isMine = Boolean(myCode && code === myCode);

        const item: MapMarkerItem = {
          id: `mem-${m.id || m.code || idx}`,
          type: "member",
          category: isConnected || isMine ? "personal" : "overview",
          title: m.name || m.contact || "Hội viên CEO 1983",
          subtitle: m.company || m.title || "Doanh nghiệp CLB",
          avatar: m.avatar ? resolveMediaUrl(m.avatar) : null,
          locationName: m.address || m.companyAddress || "Khu vực Cầu Giấy, Hà Nội",
          lat,
          lng,
          phone: m.phone || "",
          highlight: isMine || isConnected,
          statusBadge: isMine ? "Vị trí của tôi" : isConnected ? "Đã kết nối" : "Đang dùng App",
          isConnected,
          memberCode: m.code,
        };
        list.push(item);
      });
    }

    // 2. Sự kiện sắp diễn ra
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
        const offset = idx * 0.003;
        lat = landmarkCoords.marriott.lat + offset;
        lng = landmarkCoords.marriott.lng + offset;
      }

      const isRegistered = Boolean(ev.registered || ev.is_registered);

      const item: MapMarkerItem = {
        id: `ev-${ev.id || idx}`,
        type: "event",
        category: isRegistered ? "personal" : "overview",
        title: ev.title || "Sự kiện CLB CEO 1983",
        subtitle: ev.time || "Sắp diễn ra",
        avatar: ev.image ? resolveMediaUrl(ev.image) : null,
        locationName: ev.location || ev.venue || "Trung tâm Hội nghị JW Marriott Hà Nội",
        lat,
        lng,
        timeText: formatDisplayDate(ev.date || ev.start_date || new Date().toISOString()),
        highlight: true,
        statusBadge: isRegistered ? "Đã đăng ký vé" : "Sự kiện CLB",
        actionUrl: "/association/events",
        isRegistered,
      };
      list.push(item);
    });

    // 3. Cuộc gặp 1-on-1 & Họp Ban Chuyên Môn
    meetings.forEach((mt, idx) => {
      const is1on1 = mt.venueType === "offline" || mt.type === "1on1" || !mt.title?.includes("Họp Ban");
      const base = landmarkCoords.caugiay;
      const lat = base.lat + (idx + 1) * 0.002;
      const lng = base.lng + (idx + 1) * 0.002;
      const isRelatesToMe = Boolean(mt.isUserHost || mt.isUserInvitee || is1on1);

      const item: MapMarkerItem = {
        id: `mt-${mt.id || idx}`,
        type: is1on1 ? "meeting_1on1" : "meeting_board",
        category: isRelatesToMe ? "personal" : "overview",
        title: mt.title || (is1on1 ? "Gặp gỡ kết nối 1-on-1" : "Cuộc họp Ban Chuyên Môn"),
        subtitle: mt.partnerName || mt.hostName || "Hội viên kết nối",
        avatar: mt.partnerAvatar || mt.hostAvatar || null,
        locationName: mt.venue || mt.location || "Highlands Coffee Cầu Giấy, Hà Nội",
        lat,
        lng,
        timeText: `${mt.time || "09:00"} - ${formatDisplayDate(mt.date || new Date().toISOString())}`,
        highlight: is1on1,
        statusBadge: is1on1 ? "Hẹn gặp 1-on-1" : "Cuộc Họp Ban",
        phone: mt.partnerPhone || mt.hostPhone,
      };
      list.push(item);
    });

    return list;
  }, [members, events, meetings, isSharingLocation, myMember, connectedMemberCodes]);

  // Bộ lọc theo Scope (Tổng thể vs Cá nhân) và Type
  const filteredMarkers = useMemo(() => {
    return allMarkers.filter((m) => {
      // Khi chọn Cá nhân: chỉ lấy markers thuộc category personal
      if (activeScope === "personal" && m.category !== "personal") {
        return false;
      }
      // Bộ lọc loại hình con
      if (activeTypeFilter === "member" && m.type !== "member") return false;
      if (activeTypeFilter === "event" && m.type !== "event") return false;
      if (activeTypeFilter === "meeting" && m.type !== "meeting_1on1" && m.type !== "meeting_board") return false;

      // Tìm kiếm từ khóa
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          m.title.toLowerCase().includes(q) ||
          m.subtitle.toLowerCase().includes(q) ||
          m.locationName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allMarkers, activeScope, activeTypeFilter, searchQuery]);

  // Khởi tạo bản đồ Google Maps 2D bằng Leaflet TileLayer
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    let isMounted = true;
    setMapLoading(true);

    loadLeaflet()
      .then((L) => {
        if (!isMounted || !mapContainerRef.current) return;

        // Xóa map cũ nếu đã có
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
          zoom: DEFAULT_ZOOM,
          zoomControl: false,
          tap: true,
        });
        mapInstanceRef.current = map;

        // Tích hợp Google Maps 2D Standard Roadmap Tiles (chuẩn 2D đường nhà tiếng Việt y hệt Google Maps)
        L.tileLayer("https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
          subdomains: ["0", "1", "2", "3"],
          maxZoom: 20,
          attribution: "© Google Maps 2D",
        }).addTo(map);

        // Tạo layer group cho markers
        const markersGroup = L.layerGroup().addTo(map);
        markersGroupRef.current = markersGroup;

        setTimeout(() => {
          map.invalidateSize();
          setMapLoading(false);
        }, 200);
      })
      .catch((err) => {
        console.error("Leaflet loading error:", err);
        setMapLoading(false);
      });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Vẽ các Markers lên bản đồ khi filteredMarkers thay đổi
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).L || !markersGroupRef.current) return;
    const L = (window as any).L;
    const group = markersGroupRef.current;
    group.clearLayers();

    filteredMarkers.forEach((item) => {
      let iconHtml = "";

      if (item.type === "member") {
        const isMine = item.statusBadge === "Vị trí của tôi";
        const ringColor = isMine ? "#DC2626" : item.isConnected ? "#059669" : "#003B95";
        iconHtml = `
          <div style="position:relative; width:44px; height:44px; display:flex; flex-direction:column; align-items:center; cursor:pointer; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35)); transition:transform 0.2s;">
            <div style="width:40px; height:40px; border-radius:50%; background:#ffffff; border:3px solid ${ringColor}; overflow:hidden; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px ${ringColor}80;">
              ${
                item.avatar
                  ? `<img src="${item.avatar}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/ceo1983-logo.png'"/>`
                  : `<div style="font-size:12px; font-weight:900; color:#003B95;">${item.title.slice(0, 2).toUpperCase()}</div>`
              }
            </div>
            <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid ${ringColor}; margin-top:-2px;"></div>
            ${
              isMine
                ? `<div style="position:absolute; -top:4px; -right:2px; width:12px; height:12px; border-radius:50%; background:#EF4444; border:2px solid #ffffff;"></div>`
                : ""
            }
          </div>
        `;
      } else if (item.type === "event") {
        iconHtml = `
          <div style="position:relative; width:44px; height:44px; display:flex; flex-direction:column; align-items:center; cursor:pointer; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
            <div style="width:40px; height:40px; border-radius:12px; background:linear-gradient(135deg, #F59E0B, #D97706); border:2.5px solid #ffffff; display:flex; align-items:center; justify-content:center; color:#ffffff; font-weight:900; font-size:18px; box-shadow:0 0 12px rgba(245,158,11,0.6);">
              📅
            </div>
            <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid #D97706; margin-top:-2px;"></div>
          </div>
        `;
      } else {
        // Meeting / Gặp 1-1
        iconHtml = `
          <div style="position:relative; width:44px; height:44px; display:flex; flex-direction:column; align-items:center; cursor:pointer; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
            <div style="width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, #0284C7, #0369A1); border:2.5px solid #ffffff; display:flex; align-items:center; justify-content:center; color:#ffffff; font-weight:900; font-size:18px; box-shadow:0 0 12px rgba(2,132,199,0.6);">
              🤝
            </div>
            <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid #0369A1; margin-top:-2px;"></div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: "ceo-map-pin",
        html: iconHtml,
        iconSize: [44, 48],
        iconAnchor: [22, 48],
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(group);
      marker.on("click", () => {
        setSelectedMarker(item);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([item.lat, item.lng], { animate: true });
        }
      });
    });
  }, [filteredMarkers]);

  // Recenter map
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], DEFAULT_ZOOM, {
        animate: true,
        duration: 1,
      });
      setSelectedMarker(null);
    }
  };

  // Toggle GPS
  const handleToggleLocation = () => {
    const next = !isSharingLocation;
    setIsSharingLocation(next);
    try {
      localStorage.setItem("vba_location_sharing_enabled", String(next));
    } catch {}
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in font-sans">
      <div className="w-full max-w-[480px] h-[100dvh] max-h-[100dvh] flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden shadow-2xl">
        {/* ── TOP HEADER: PHÂN CHIA 2 DANH MỤC TỔNG THỂ & CÁ NHÂN (YÊU CẦU 2) ── */}
        <div className="absolute top-0 inset-x-0 z-30 p-3 bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-transparent flex flex-col gap-2.5 backdrop-blur-xs select-none">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-[#003B95] text-white border border-blue-400/40 shadow-md">
                <Compass className="size-4" />
              </span>
              <div>
                <h3 className="text-[13px] font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>BẢN ĐỒ GOOGLE 2D CEO 1983</span>
                  <span className="size-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                </h3>
                <p className="text-[10.5px] text-slate-300">
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

          {/* ── 2 TAB LỚN: TỔNG THỂ vs CÁ NHÂN (THEO YÊU CẦU CHÍNH) ── */}
          <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-md">
            <button
              type="button"
              onClick={() => {
                setActiveScope("overview");
                setSelectedMarker(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeScope === "overview"
                  ? "bg-gradient-to-r from-sky-900 via-[#003B95] to-blue-700 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe className="size-3.5" />
              <span>Tổng thể ({allMarkers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScope("personal");
                setSelectedMarker(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeScope === "personal"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserCheck className="size-3.5" />
              <span>Cá nhân ({allMarkers.filter((m) => m.category === "personal").length})</span>
            </button>
          </div>

          {/* Ô Tìm kiếm trên bản đồ */}
          <div className="relative flex items-center bg-slate-900/90 rounded-xl border border-slate-700/80 px-3 py-1.5 shadow-sm backdrop-blur-md">
            <Search className="size-3.5 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeScope === "personal"
                  ? "Tìm bạn bè đã kết nối, sự kiện đã đăng ký..."
                  : "Tìm hội viên, sự kiện, họp ban trên bản đồ..."
              }
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 border-0 outline-none font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-white p-0.5">
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Bộ lọc con: Tất cả / Hội viên / Sự kiện / Họp ban */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "all", label: "Tất cả" },
              { id: "member", label: "Hội viên" },
              { id: "event", label: "Sự kiện" },
              { id: "meeting", label: "Cuộc họp" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveTypeFilter(f.id as any)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer border ${
                  activeTypeFilter === f.id
                    ? "bg-white text-slate-950 border-white shadow-xs font-black"
                    : "bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── BẢN ĐỒ GOOGLE MAPS 2D CONTAINER (LEAFLET DYNAMIC TILES) ── */}
        <div className="flex-1 w-full relative overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Trạng thái tải bản đồ */}
          {mapLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900">
              <div className="size-8 border-3 border-[#003B95] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Đang nạp bản đồ Google Maps 2D đường nhà...
              </p>
            </div>
          )}

          {/* Nút công cụ nổi bên phải */}
          <div className="absolute right-3 top-48 z-20 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleRecenter}
              className="size-10 rounded-full bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer active:scale-95 transition"
              title="Về trung tâm Hà Nội / Vị trí của tôi"
            >
              <Navigation className="size-4 text-[#003B95] dark:text-blue-400" />
            </button>

            <button
              type="button"
              onClick={handleToggleLocation}
              className={`size-10 rounded-full shadow-lg border flex items-center justify-center cursor-pointer active:scale-95 transition ${
                isSharingLocation
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-white dark:bg-slate-900 text-slate-400 border-slate-300"
              }`}
              title={isSharingLocation ? "Đang chia sẻ vị trí (Bấm để tắt)" : "Đã tắt định vị (Bấm để bật)"}
            >
              <MapPin className="size-4" />
            </button>
          </div>
        </div>

        {/* ── BOTTOM SHEET CHI TIẾT ĐỐI TƯỢNG ĐANG CHỌN (POPUP NỔI) ── */}
        {selectedMarker && (
          <div className="absolute bottom-3 inset-x-3 z-30 bg-white dark:bg-slate-900 rounded-3xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  {selectedMarker.avatar ? (
                    <img
                      src={selectedMarker.avatar}
                      alt={selectedMarker.title}
                      className="size-12 rounded-2xl object-cover ring-2 ring-[#003B95]/30 shadow-xs"
                      onError={(e) => {
                        e.currentTarget.src = "/ceo1983-logo.png";
                      }}
                    />
                  ) : (
                    <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#003B95] dark:text-blue-300 grid place-items-center font-bold text-base ring-2 ring-[#003B95]/20">
                      {selectedMarker.title.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-md bg-[#003B95] text-[9px] font-black text-white">
                    {selectedMarker.type === "member" ? "CEO" : selectedMarker.type === "event" ? "EVENT" : "MEET"}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {selectedMarker.title}
                    </h4>
                    <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {selectedMarker.statusBadge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
                    {selectedMarker.subtitle}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate mt-0.5">
                    <MapPin className="size-3 shrink-0 text-[#DC2626]" />
                    <span className="truncate">{selectedMarker.locationName}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMarker(null)}
                className="size-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Các nút hành động nhanh */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMarker.lat},${selectedMarker.lng}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition text-center"
              >
                <Navigation className="size-3.5 text-[#003B95] dark:text-blue-400" />
                <span>Chỉ đường Maps</span>
              </a>

              {selectedMarker.phone ? (
                <a
                  href={`tel:${selectedMarker.phone}`}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-sky-900 via-[#003B95] to-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm text-center"
                >
                  <Phone className="size-3.5" />
                  <span>Gọi kết nối</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (selectedMarker.actionUrl) {
                      window.location.href = selectedMarker.actionUrl;
                    } else {
                      window.location.href = "/association/messages";
                    }
                  }}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-sky-900 via-[#003B95] to-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MessageSquare className="size-3.5" />
                  <span>Xem chi tiết</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
