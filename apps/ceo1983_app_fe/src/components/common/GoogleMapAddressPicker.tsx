import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Map as MapIcon,
  X,
  Check,
  Loader2,
  Search,
  Crosshair,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";

export interface GoogleMapAddressPickerProps {
  id?: string;
  value: string;
  onChange: (address: string, extra?: { lat?: number; lng?: number; mapUrl?: string }) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  error?: string;
  label?: string;
  helperText?: string;
  showQuickLocations?: boolean;
}

const COMMON_CEO1983_LOCATIONS = [
  {
    name: "Trụ sở CLB CEO 1983",
    address: "Tầng 2, Tòa nhà V-Tower, Số 649 Kim Mã, Ba Đình, Hà Nội",
    lat: 21.0315,
    lng: 105.8152,
  },
  {
    name: "Tòa nhà CEO Tower",
    address: "Tòa nhà CEO Tower, Đường Phạm Hùng, Mễ Trì, Nam Từ Liêm, Hà Nội",
    lat: 21.0189,
    lng: 105.7821,
  },
  {
    name: "Trung tâm Hội nghị Quốc gia",
    address: "Đại lộ Thăng Long, Mễ Trì, Nam Từ Liêm, Hà Nội",
    lat: 21.0056,
    lng: 105.7885,
  },
  {
    name: "Khách sạn JW Marriott Hanoi",
    address: "Số 8 Đỗ Đức Dục, Mễ Trì, Nam Từ Liêm, Hà Nội",
    lat: 21.0084,
    lng: 105.7839,
  },
  {
    name: "Khách sạn Lotte Hotel Hanoi",
    address: "Số 54 Liễu Giai, Cống Vị, Ba Đình, Hà Nội",
    lat: 21.0332,
    lng: 105.8143,
  },
];

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
    document.body.appendChild(script);
  });
}

export function GoogleMapAddressPicker({
  id,
  value,
  onChange,
  placeholder = "Nhập địa chỉ hoặc chọn vị trí trên bản đồ...",
  required = false,
  className = "",
  error,
  label,
  helperText,
  showQuickLocations = true,
}: GoogleMapAddressPickerProps) {
  const [locating, setLocating] = useState(false);
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);

  // Tọa độ hiện tại đang chọn trên bản đồ (mặc định Hà Nội)
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 21.0285,
    lng: 105.8542,
  });
  const [tempAddress, setTempAddress] = useState(value);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  // Mở Google Maps tìm kiếm theo địa chỉ
  const handleOpenGoogleMaps = () => {
    if (!value.trim()) {
      toast.info("Vui lòng nhập địa chỉ trước khi mở Google Maps!");
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value.trim())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Reverse geocoding tọa độ ra tên địa chỉ đường phố tiếng Việt
  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "vi" } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setTempAddress(addr);
      } else {
        setTempAddress(`Tọa độ: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch {
      setTempAddress(`Tọa độ: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Khởi tạo bản đồ tương tác Leaflet
  useEffect(() => {
    if (!showInteractiveMap || !mapContainerRef.current) return;

    let isMounted = true;
    setMapLoading(true);

    loadLeaflet()
      .then((L) => {
        if (!isMounted || !mapContainerRef.current) return;

        // Xóa map cũ nếu có
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const initialLat = currentCoords.lat || 21.0285;
        const initialLng = currentCoords.lng || 105.8542;

        const map = L.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: 16,
          zoomControl: false,
        });
        mapInstanceRef.current = map;

        // Thêm zoom control góc dưới bên phải
        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Tile layer chuẩn OpenStreetMap
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap",
        }).addTo(map);

        // Custom icon pin đỏ đẹp phong cách app giao hàng/đặt xe
        const pinIcon = L.divIcon({
          className: "custom-map-pin",
          html: `
            <div style="position:relative; width:36px; height:44px; display:flex; flex-direction:column; align-items:center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35)); cursor:grab;">
              <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, #EF4444, #B91C1C); border:3px solid #FFFFFF; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(239,68,68,0.5);">
                <div style="width:10px; height:10px; border-radius:50%; background:#FFFFFF;"></div>
              </div>
              <div style="width:0; height:0; border-left:7px solid transparent; border-right:7px solid transparent; border-top:10px solid #B91C1C; margin-top:-2px;"></div>
            </div>
          `,
          iconSize: [36, 44],
          iconAnchor: [18, 44],
        });

        // Tạo Marker có thể kéo thả (draggable: true)
        const marker = L.marker([initialLat, initialLng], {
          icon: pinIcon,
          draggable: true,
          autoPan: true,
        }).addTo(map);
        markerInstanceRef.current = marker;

        // Bắt sự kiện kéo thả marker kết thúc
        marker.on("dragend", (e: any) => {
          const pos = e.target.getLatLng();
          setCurrentCoords({ lat: pos.lat, lng: pos.lng });
          fetchAddressFromCoords(pos.lat, pos.lng);
        });

        // Bắt sự kiện nhấp chuột / chạm màn hình bất kỳ đâu trên bản đồ để di chuyển pin đến đó
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setCurrentCoords({ lat, lng });
          fetchAddressFromCoords(lat, lng);
        });

        // Kích hoạt lại kích thước bản đồ
        setTimeout(() => {
          map.invalidateSize();
          setMapLoading(false);
        }, 200);
      })
      .catch((err) => {
        console.error("Lỗi nạp Leaflet Map:", err);
        setMapLoading(false);
        toast.error("Không thể tải bản đồ tương tác. Đang dùng chế độ thông thường.");
      });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showInteractiveMap]);

  // Di chuyển bản đồ và marker tới tọa độ mong muốn
  const panToCoords = (lat: number, lng: number, zoomLevel = 16) => {
    setCurrentCoords({ lat, lng });
    if (mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], zoomLevel);
      markerInstanceRef.current.setLatLng([lat, lng]);
    }
    fetchAddressFromCoords(lat, lng);
  };

  // Định vị vị trí hiện tại qua GPS thiết bị
  const handleLocateCurrentPosition = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị GPS!");
      return;
    }

    setLocating(true);
    const toastId = toast.loading("Đang lấy tọa độ GPS từ thiết bị của bạn...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocating(false);
        toast.success("✓ Đã định vị thành công vị trí của bạn!", { id: toastId });
        panToCoords(latitude, longitude, 17);
      },
      (err) => {
        setLocating(false);
        let msg = "Không thể lấy vị trí hiện tại.";
        if (err.code === 1) msg = "Bạn đã từ chối quyền truy cập vị trí trên trình duyệt.";
        else if (err.code === 2) msg = "Không nhận được tín hiệu định vị GPS.";
        else if (err.code === 3) msg = "Thời gian định vị quá lâu (hết hạn).";
        toast.error(msg, { id: toastId });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Tìm kiếm địa điểm trên bản đồ qua OpenStreetMap Nominatim
  const handleSearchPlaces = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&countrycodes=vn&limit=5`,
        { headers: { "Accept-Language": "vi" } }
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        if (data.length === 0) {
          toast.info("Không tìm thấy địa điểm phù hợp, vui lòng thử từ khóa khác!");
        }
      }
    } catch {
      toast.error("Không thể kết nối tìm kiếm địa điểm.");
    } finally {
      setIsSearching(false);
    }
  };

  // Xác nhận vị trí đã chọn
  const handleConfirmLocation = () => {
    const finalAddress = tempAddress || value;
    const mapUrl = `https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}`;
    onChange(finalAddress, {
      lat: currentCoords.lat,
      lng: currentCoords.lng,
      mapUrl,
    });
    setShowInteractiveMap(false);
    toast.success("✓ Đã cập nhật địa điểm tổ chức cuộc họp!");
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block text-xs font-semibold text-foreground">
            {label} {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowInteractiveMap(true);
                setTempAddress(value);
              }}
              className="text-[11px] font-bold text-[#003B95] dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900"
            >
              <MapIcon className="h-3 w-3 text-blue-600 dark:text-amber-400" />
              <span>Kéo thả ghim bản đồ</span>
            </button>
            <button
              type="button"
              onClick={handleOpenGoogleMaps}
              disabled={!value.trim()}
              title="Mở Google Maps trong tab mới"
              className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Google Maps ↗</span>
            </button>
          </div>
        </div>
      )}

      {/* Input Group with Google Map Brand Pin and Actions */}
      <div className="relative flex items-center">
        {/* Google Map Icon / Pin */}
        <div className="absolute left-3 flex items-center pointer-events-none text-rose-600">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>

        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value, {
              mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.target.value)}`,
            });
          }}
          placeholder={placeholder}
          required={required}
          className={`h-10 w-full rounded-xl border bg-background pl-9 pr-32 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B95]/30 transition ${
            error
              ? "border-destructive ring-1 ring-destructive/30"
              : "border-border focus-visible:border-[#003B95]"
          } ${className}`}
        />

        {/* Action Buttons on the Right of the input */}
        <div className="absolute right-1.5 flex items-center gap-1">
          {value.trim() && (
            <button
              type="button"
              onClick={() => onChange("", {})}
              title="Xóa địa chỉ"
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Nút mở Modal Bản đồ tương tác */}
          <button
            type="button"
            onClick={() => {
              setShowInteractiveMap(true);
              setTempAddress(value);
            }}
            title="Mở bản đồ kéo thả ghim vị trí như app đặt xe"
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-[10px] font-bold transition shadow-2xs cursor-pointer"
          >
            <MapIcon className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Bản đồ</span>
          </button>

          {/* Nút định vị GPS */}
          <button
            type="button"
            onClick={() => {
              setShowInteractiveMap(true);
              handleLocateCurrentPosition();
            }}
            disabled={locating}
            title="Định vị vị trí hiện tại của bạn"
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[10px] font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {locating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Navigation className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            )}
            <span className="hidden sm:inline">GPS</span>
          </button>
        </div>
      </div>

      {/* Error or Helper text */}
      {error ? (
        <p className="text-[11px] font-semibold text-destructive animate-in fade-in duration-150">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-muted-foreground">{helperText}</p>
      ) : null}

      {/* Quick Location Pills */}
      {showQuickLocations && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Gợi ý nhanh:
          </span>
          {COMMON_CEO1983_LOCATIONS.map((loc, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onChange(loc.address, {
                  lat: loc.lat,
                  lng: loc.lng,
                  mapUrl: `https://www.google.com/maps?q=${loc.lat},${loc.lng}`,
                });
                setCurrentCoords({ lat: loc.lat, lng: loc.lng });
                setTempAddress(loc.address);
                toast.success(`Đã chọn: ${loc.name}`);
              }}
              className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-secondary/50 hover:bg-primary/10 hover:border-primary/40 text-foreground transition cursor-pointer"
            >
              📍 {loc.name}
            </button>
          ))}
        </div>
      )}

      {/* MODAL BẢN ĐỒ TƯƠNG TÁC KÉO THẢ GHIM (GIỐNG APP ĐẶT XE, GIAO HÀNG) */}
      {showInteractiveMap && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-4 py-3 border-b border-border bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Chọn vị trí trên bản đồ
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Chạm bản đồ hoặc kéo thả ghim đỏ để chọn vị trí chính xác như app đặt xe
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInteractiveMap(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Thanh tìm kiếm địa điểm trên bản đồ */}
            <div className="p-3 border-b border-border bg-background space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchPlaces()}
                    placeholder="Tìm tên tòa nhà, phố, quận/huyện..."
                    className="w-full h-9 pl-8 pr-3 rounded-xl border border-border bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearchPlaces}
                  disabled={isSearching || !searchQuery.trim()}
                  className="h-9 px-3 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002B70] transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="h-3 w-3 animate-spin" /> : "Tìm"}
                </button>
                <button
                  type="button"
                  onClick={handleLocateCurrentPosition}
                  disabled={locating}
                  title="Bay đến vị trí GPS hiện tại"
                  className="h-9 px-2.5 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-300 hover:bg-blue-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  {locating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">GPS của tôi</span>
                </button>
              </div>

              {/* Danh sách kết quả tìm kiếm */}
              {searchResults.length > 0 && (
                <div className="max-h-36 overflow-y-auto divide-y divide-border rounded-xl border border-border bg-background">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const lat = parseFloat(item.lat);
                        const lon = parseFloat(item.lon);
                        panToCoords(lat, lon, 17);
                        setTempAddress(item.display_name);
                        setSearchResults([]);
                        setSearchQuery("");
                      }}
                      className="w-full p-2 text-left hover:bg-muted/70 text-xs text-foreground flex items-start gap-2 transition cursor-pointer"
                    >
                      <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="truncate">{item.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Container bản đồ Leaflet */}
            <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] bg-slate-100 dark:bg-slate-950">
              <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

              {mapLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-[#003B95] dark:text-amber-400" />
                  <span className="text-xs font-semibold text-muted-foreground">
                    Đang kích hoạt bản đồ tương tác...
                  </span>
                </div>
              )}

              {/* Hướng dẫn thao tác nổi phía trên bản đồ */}
              <div className="absolute top-2 left-2 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-border shadow-md text-[11px] font-semibold text-foreground flex items-center gap-1.5 pointer-events-none">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Kéo ghim hoặc click bất kỳ điểm nào trên bản đồ</span>
              </div>
            </div>

            {/* Footer hiển thị vị trí được chọn & Nút xác nhận */}
            <div className="p-3.5 border-t border-border bg-slate-50 dark:bg-slate-800/60 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/15 text-rose-600 shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-semibold uppercase tracking-wider">
                      Vị trí đã ghim:
                    </span>
                    <span className="font-mono text-[10px]">
                      {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-foreground line-clamp-2 mt-0.5">
                    {isReverseGeocoding ? (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" /> Đang tra cứu địa chỉ thực tế...
                      </span>
                    ) : (
                      tempAddress || "Chưa có địa chỉ. Vui lòng nhấp vào bản đồ để chọn."
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowInteractiveMap(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLocation}
                  disabled={!tempAddress && !value}
                  className="px-5 py-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold shadow-md shadow-[#003B95]/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Xác nhận chọn vị trí này</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
