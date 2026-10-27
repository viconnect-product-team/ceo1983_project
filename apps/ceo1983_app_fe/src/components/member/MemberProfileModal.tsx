import { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import {
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  ExternalLink,
  UserPlus,
  BadgeCheck,
  User,
  Check,
  UserMinus,
  CreditCard,
  Clock,
  Compass,
} from "lucide-react";
import { resolveMediaUrl } from "@/lib/api-client";
import { toast } from "sonner";
import type { DirectoryMember } from "@/lib/member-app.functions";

export interface ExtendedDirectoryMember extends DirectoryMember {
  coverPhoto?: string | null;
  coverUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface MemberProfileModalProps {
  member: ExtendedDirectoryMember | null;
  initialConnected?: boolean;
  isPending?: boolean;
  onClose: () => void;
  onMessage?: (member: DirectoryMember) => void;
  onConnect?: (member: DirectoryMember) => void;
  onDisconnect?: (member: DirectoryMember) => void;
}

// Nạp Leaflet động từ CDN cho bản đồ định vị công ty
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

function CompanyLocationMap({
  address,
  companyName,
  lat,
  lng,
}: {
  address?: string | null;
  companyName?: string | null;
  lat?: number | null;
  lng?: number | null;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Sinh tọa độ an toàn xung quanh Hà Nội nếu chưa có dữ liệu GPS
  const coords = useMemo(() => {
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
    const seed = (address || companyName || "Keangnam Hanoi")
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const baseLat = 21.0175; // Khu Keangnam / Cầu Giấy
    const baseLng = 105.7838;
    const latOffset = (((seed * 31) % 100) - 50) * 0.0006;
    const lngOffset = (((seed * 47) % 100) - 50) * 0.0006;

    return {
      lat: baseLat + latOffset,
      lng: baseLng + lngOffset,
    };
  }, [lat, lng, address, companyName]);

  const googleMapsUrl = useMemo(() => {
    const query = [companyName, address].filter(Boolean).join(", ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || `${coords.lat},${coords.lng}`)}`;
  }, [companyName, address, coords]);

  useEffect(() => {
    let isMounted = true;
    if (!mapContainerRef.current) return;

    loadLeaflet()
      .then((L) => {
        if (!isMounted || !mapContainerRef.current) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [coords.lat, coords.lng],
          zoom: 15,
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false,
          dragging: true,
          tap: true,
        });
        mapInstanceRef.current = map;

        // Google Maps 2D Tiles (Roadmap sắc nét tiếng Việt như trên mobile app)
        L.tileLayer("https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
          subdomains: ["0", "1", "2", "3"],
          maxZoom: 20,
        }).addTo(map);

        // Marker icon công ty đỏ nổi bật
        const customIcon = L.divIcon({
          className: "custom-company-pin",
          html: `
            <div style="position: relative; transform: translate(-50%, -100%);">
              <div style="background: #DC2626; color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(220,38,38,0.45); border: 2.5px solid white;">
                <div style="transform: rotate(45deg); font-size: 13px; font-weight: 900;">🏢</div>
              </div>
              <div style="position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 12px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%; filter: blur(1px);"></div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; color: #1E293B; line-height: 1.4;">
            <div>${companyName || "Trụ sở Doanh nghiệp"}</div>
            <div style="font-size: 10px; font-weight: normal; color: #64748B; margin-top: 2px;">${address || "Hà Nội, Việt Nam"}</div>
          </div>
        `);

        // Controls zoom nhỏ gọn ở góc dưới
        L.control.zoom({ position: "bottomright" }).addTo(map);

        setMapLoaded(true);

        setTimeout(() => {
          if (isMounted && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 200);
      })
      .catch(() => {
        setMapLoaded(false);
      });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coords.lat, coords.lng, companyName, address]);

  return (
    <div className="space-y-2 rounded-2xl bg-slate-50 dark:bg-white/[0.03] p-3 border border-slate-200/60 dark:border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
          <MapPin className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-wider">
            Định vị trụ sở công ty
          </span>
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#003B95] dark:text-amber-400 hover:underline"
        >
          <span>Chỉ đường</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Interactive Leaflet Google Maps View */}
      <div className="relative w-full h-[170px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/90 dark:bg-slate-800/90 text-[11px] text-slate-400 gap-1.5 font-medium">
            <Compass className="h-4 w-4 animate-spin text-red-500" />
            <span>Đang tải định vị bản đồ...</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-[10.5px] text-slate-500 dark:text-slate-400 pt-0.5">
        <span className="truncate max-w-[220px]">
          {address || "Khu vực doanh nghiệp CLB CEO 1983, Hà Nội"}
        </span>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 font-bold border border-red-200 dark:border-red-900/50 hover:bg-red-100 transition"
        >
          Mở Google Maps
        </a>
      </div>
    </div>
  );
}

export function MemberProfileModal({
  member,
  initialConnected,
  isPending,
  onClose,
  onMessage,
  onConnect,
  onDisconnect,
}: MemberProfileModalProps) {
  const [mounted, setMounted] = useState(false);
  const isDisconnectedInStorage = (m: DirectoryMember | null) => {
    if (!m) return false;
    try {
      const raw = localStorage.getItem("vba.disconnected_members");
      if (raw) {
        const list: string[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          const keys = [m.code, m.userId].filter(Boolean).map((x) => String(x).toLowerCase());
          return list.some((item) => keys.includes(String(item).toLowerCase()));
        }
      }
    } catch {}
    return false;
  };

  const isConnectedInStorage = (m: DirectoryMember | null) => {
    if (!m) return false;
    try {
      const raw = localStorage.getItem("vba.connected_members");
      if (raw) {
        const list: string[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          const keys = [m.code, m.userId].filter(Boolean).map((x) => String(x).toLowerCase());
          return list.some((item) => keys.includes(String(item).toLowerCase()));
        }
      }
    } catch {}
    return false;
  };

  const [connected, setConnected] = useState(() => {
    if (!member) return false;
    if (isDisconnectedInStorage(member)) return false;
    if (isConnectedInStorage(member)) return true;
    if (initialConnected !== undefined) return initialConnected;
    return false;
  });

  const [requestSent, setRequestSent] = useState(() => Boolean(isPending));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setRequestSent(Boolean(isPending));
  }, [isPending, member?.code, member?.userId]);

  // Kiểm tra trạng thái đã kết nối đồng bộ
  useEffect(() => {
    if (!member) return;
    if (isDisconnectedInStorage(member)) {
      setConnected(false);
      return;
    }
    if (isConnectedInStorage(member)) {
      setConnected(true);
      return;
    }
    if (initialConnected !== undefined) {
      setConnected(initialConnected);
      return;
    }
    setConnected(false);
  }, [member?.code, member?.userId, initialConnected]);

  if (!mounted || !member || typeof document === "undefined") {
    return null;
  }

  const displayName = member.contact || member.personName || member.name;
  const avatarUrl = member.avatar ? resolveMediaUrl(member.avatar) || member.avatar : null;
  const coverUrl = member.coverUrl || member.coverPhoto ? resolveMediaUrl(member.coverUrl || member.coverPhoto || "") : null;
  const subtitle = [member.personTitle || member.industry, member.region].filter(Boolean).join(" · ");
  const cleanPhone = (member.phone || "").replace(/\D/g, "");

  const handleToggleConnection = () => {
    const mCode = member.code.toLowerCase();
    const mUserId = (member.userId || "").toLowerCase();

    if (connected) {
      // HỦY KẾT NỐI
      try {
        const storedD = localStorage.getItem("vba.disconnected_members");
        const dList: string[] = storedD ? JSON.parse(storedD) : [];
        if (!dList.includes(mCode)) dList.push(mCode);
        if (mUserId && !dList.includes(mUserId)) dList.push(mUserId);
        localStorage.setItem("vba.disconnected_members", JSON.stringify(dList));

        const storedC = localStorage.getItem("vba.connected_members");
        const cList: string[] = storedC ? JSON.parse(storedC) : [];
        const nextC = cList.filter((c) => {
          const lower = String(c).toLowerCase();
          return lower !== mCode && lower !== mUserId;
        });
        localStorage.setItem("vba.connected_members", JSON.stringify(nextC));

        window.dispatchEvent(
          new CustomEvent("vba.connection.changed", {
            detail: { memberCode: member.code, userId: member.userId, connected: false },
          }),
        );
      } catch {}

      setConnected(false);
      setRequestSent(false);
      toast.success(`Đã hủy kết nối với hội viên ${displayName}`);
      if (onDisconnect) onDisconnect(member);
      return;
    }

    if (requestSent) {
      toast.info(`Lời mời kết nối tới ${displayName} đã được gửi. Vui lòng chờ đối phương phản hồi.`);
      return;
    }

    // GỬI LỜI MỜI KẾT NỐI
    try {
      const storedD = localStorage.getItem("vba.disconnected_members");
      const dList: string[] = storedD ? JSON.parse(storedD) : [];
      const nextD = dList.filter((c) => {
        const lower = String(c).toLowerCase();
        return lower !== mCode && lower !== mUserId;
      });
      localStorage.setItem("vba.disconnected_members", JSON.stringify(nextD));
    } catch {}

    setRequestSent(true);
    toast.success(`Đã gửi lời mời kết nối tới ${displayName}. Đang chờ đối phương đồng ý.`);
    if (onConnect) onConnect(member);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-hidden animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-[420px] max-h-[92dvh] rounded-3xl bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable Center Content */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          
          {/* 1. Header with Cover Photo (Ảnh bìa) */}
          <div className="relative w-full h-32 sm:h-36 bg-gradient-to-r from-[#001B54] via-[#003B95] to-[#B8860B] overflow-hidden">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt="Cover photo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-between px-6 opacity-30 select-none">
                <span className="text-3xl font-black text-white/30 tracking-widest">CEO 1983</span>
                <span className="text-2xl font-serif text-amber-300/40 font-bold">HANOIBA</span>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Close Button top-right */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 rounded-full p-1.5 text-white/90 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-xs transition cursor-pointer z-10 shadow-xs"
              aria-label="Đóng"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Badge Hiệp Hội CEO 1983 top-left */}
            <div className="absolute top-3 left-3 bg-[#001B54]/85 backdrop-blur-xs border border-amber-400/40 text-amber-300 font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow-xs">
              Hội Viên CLB CEO 1983
            </div>
          </div>

          <div className="px-4 pb-4 space-y-3.5">
            {/* 2. Avatar overlapping Cover Photo */}
            <div className="flex items-end justify-between -mt-10 sm:-mt-12 relative z-10">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-20 w-20 sm:h-22 sm:w-22 rounded-2xl object-cover ring-4 ring-white dark:ring-[#0f172a] shadow-lg bg-white"
                    onError={(e) => {
                      e.currentTarget.src = "/ceo1983-logo.png";
                    }}
                  />
                ) : (
                  <div className="grid h-20 w-20 sm:h-22 sm:w-22 place-items-center rounded-2xl bg-blue-50 dark:bg-blue-950 text-[#001B54] dark:text-blue-300 ring-4 ring-white dark:ring-[#0f172a] shadow-lg">
                    <User className="h-10 w-10" />
                  </div>
                )}
                {member.verified && (
                  <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 text-[#001B54] dark:text-amber-400 fill-white dark:fill-slate-900 shadow-xs" />
                )}
              </div>

              {/* Status / Member code badge */}
              <div className="flex flex-col items-end gap-1 mb-1">
                {member.code && (
                  <span className="rounded-lg bg-[#001B54] dark:bg-amber-500 px-2.5 py-1 text-[11px] font-black text-white dark:text-slate-950 shadow-xs tracking-wider">
                    {member.code}
                  </span>
                )}
                {connected && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-300/40">
                    <Check className="size-2.5" />
                    Đã kết nối
                  </span>
                )}
              </div>
            </div>

            {/* 3. Member Info */}
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {displayName}
              </h3>
              {member.name && (
                <p className="text-[13px] font-bold text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span>{member.name}</span>
                </p>
              )}
              {subtitle && (
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-medium">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Bio / About */}
            {member.about && (
              <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] p-2.5 text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-white/5">
                <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                  GIỚI THIỆU
                </p>
                <p className="line-clamp-4 whitespace-pre-wrap">{member.about}</p>
              </div>
            )}

            {/* Contact Info (with Zalo fast button) */}
            <div className="space-y-2 rounded-2xl bg-slate-50 dark:bg-white/[0.03] p-3 text-[11.5px] border border-slate-200/60 dark:border-white/5">
              <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                THÔNG TIN LIÊN HỆ
              </p>
              {member.phone && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Phone className="h-3.5 w-3.5 text-[#003B95] dark:text-amber-400" />
                    <span>Điện thoại</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${member.phone}`}
                      className="font-semibold text-[#003B95] dark:text-amber-400 hover:underline"
                    >
                      {member.phone}
                    </a>
                    {cleanPhone && (
                      <a
                        href={`https://zalo.me/${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-2xs"
                      >
                        Zalo
                      </a>
                    )}
                  </div>
                </div>
              )}
              {member.email && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Mail className="h-3.5 w-3.5 text-[#003B95] dark:text-amber-400" />
                    <span>Email</span>
                  </div>
                  <a
                    href={`mailto:${member.email}`}
                    className="font-semibold text-[#003B95] dark:text-amber-400 hover:underline truncate max-w-[200px]"
                  >
                    {member.email}
                  </a>
                </div>
              )}
              {member.website && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Globe className="h-3.5 w-3.5 text-[#003B95] dark:text-amber-400" />
                    <span>Website</span>
                  </div>
                  <a
                    href={member.website.startsWith("http") ? member.website : `https://${member.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#003B95] dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Truy cập</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {member.address && (
                <div className="flex items-start justify-between gap-2 pt-1.5 border-t border-slate-200/50 dark:border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 shrink-0">
                    <MapPin className="h-3.5 w-3.5 text-[#003B95] dark:text-amber-400" />
                    <span>Địa chỉ</span>
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 text-right truncate max-w-[210px]">
                    {member.address}
                  </span>
                </div>
              )}
            </div>

            {/* 4. Ở DƯỚI CÙNG LÀ BẢN ĐỒ ĐỊNH VỊ VỊ TRÍ CÔNG TY */}
            <CompanyLocationMap
              address={member.address}
              companyName={member.name || member.company || displayName}
              lat={member.lat}
              lng={member.lng}
            />
          </div>
        </div>

        {/* 5. Fixed Footer with Action Buttons */}
        <div className="shrink-0 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-slate-100 dark:border-white/10 bg-slate-50/90 dark:bg-white/[0.03]">
          <div className="flex gap-2">
            <Link
              to="/card/$code"
              params={{ code: member.code || "M1983-001" }}
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 py-2.5 text-[12.5px] font-bold text-[#003B95] dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition active:scale-95 cursor-pointer shadow-sm text-center"
            >
              <CreditCard className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Xem danh thiếp số</span>
            </Link>

            <button
              type="button"
              onClick={handleToggleConnection}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-bold transition active:scale-95 cursor-pointer shadow-md ${
                connected
                  ? "border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 shadow-rose-500/10"
                  : requestSent
                    ? "border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 shadow-amber-500/10"
                    : "bg-[#003B95] hover:bg-[#002B70] text-white shadow-blue-900/20"
              }`}
            >
              {connected ? (
                <>
                  <UserMinus className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  <span>Hủy kết nối</span>
                </>
              ) : requestSent ? (
                <>
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Đang chờ đồng ý</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 text-white" />
                  <span>Kết nối</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
