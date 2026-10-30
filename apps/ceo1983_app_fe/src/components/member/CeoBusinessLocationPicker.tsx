import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Navigation,
  Search,
  Check,
  Building2,
  Sparkles,
  Loader2,
  Compass,
  RefreshCw,
  ExternalLink,
  Layers,
  ZoomIn,
  ZoomOut,
  LocateFixed,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";

interface CeoBusinessLocationPickerProps {
  initialAddress?: string;
  initialLat?: number | null;
  initialLng?: number | null;
  companyName?: string;
  userId?: string;
  onAddressSaved?: (newAddress: string, lat: number, lng: number) => void;
}

// Tâm Keangnam Landmark 72, Hà Nội (Trụ sở CEO 1983)
const DEFAULT_CENTER = { lat: 21.0175, lng: 105.7838 };

function loadLeaflet(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject("SSR");
  if ((window as any).L) return Promise.resolve((window as any).L);

  return new Promise((resolve, reject) => {
    // 1. Load CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
      document.head.appendChild(link);
    }

    // 2. Load JS
    const existingScript = document.getElementById("leaflet-js") as HTMLScriptElement;
    if (existingScript) {
      if ((window as any).L) {
        resolve((window as any).L);
      } else {
        existingScript.addEventListener("load", () => resolve((window as any).L));
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
    script.async = true;
    script.onload = () => resolve((window as any).L);
    script.onerror = () => {
      // Fallback sang unpkg nếu cdnjs lỗi
      const fallbackScript = document.createElement("script");
      fallbackScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      fallbackScript.onload = () => resolve((window as any).L);
      fallbackScript.onerror = reject;
      document.head.appendChild(fallbackScript);
    };
    document.head.appendChild(script);
  });
}

export const CeoBusinessLocationPicker: React.FC<CeoBusinessLocationPickerProps> = ({
  initialAddress = "",
  initialLat,
  initialLng,
  companyName = "Doanh nghiệp CEO 1983",
  userId,
  onAddressSaved,
}) => {
  const [address, setAddress] = useState(initialAddress);
  const [lat, setLat] = useState<number>(
    initialLat && !isNaN(initialLat) ? initialLat : DEFAULT_CENTER.lat
  );
  const [lng, setLng] = useState<number>(
    initialLng && !isNaN(initialLng) ? initialLng : DEFAULT_CENTER.lng
  );
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(15);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (initialAddress) setAddress(initialAddress);
    if (initialLat && !isNaN(initialLat)) setLat(initialLat);
    if (initialLng && !isNaN(initialLng)) setLng(initialLng);
  }, [initialAddress, initialLat, initialLng]);

  // Reverse Geocoding helper (Lấy địa chỉ từ tọa độ lat/lng)
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=vi`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        setHasChanged(true);
        toast.info("Đã cập nhật địa chỉ theo vị trí ghim mới!", { duration: 2500 });
      }
    } catch {
      // Ignored if network blocked
    }
  };

  // ── 2D CANVAS MAP ENGINE (Vẽ hình ảnh bản đồ 2D đường phố tức thì khi chưa có Leaflet) ──
  const draw2DCanvasMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Nền phố xá đô thị 2D (màu xám sáng chuẩn Apple / Google Maps 2D)
    ctx.fillStyle = "#F1F5F9";
    ctx.fillRect(0, 0, width, height);

    // 1. Vẽ các khối đô thị / khu dân cư
    ctx.fillStyle = "#E2E8F0";
    ctx.fillRect(20, 20, width * 0.35, height * 0.3);
    ctx.fillRect(width * 0.55, 30, width * 0.4, height * 0.35);
    ctx.fillRect(30, height * 0.6, width * 0.3, height * 0.32);
    ctx.fillRect(width * 0.5, height * 0.55, width * 0.45, height * 0.38);

    // 2. Vẽ công viên & mảng xanh sinh thái
    ctx.fillStyle = "#DCFCE7"; // Xanh lá cây nhạt
    ctx.beginPath();
    ctx.roundRect(width * 0.65, 45, 80, 50, 8);
    ctx.fill();

    ctx.fillStyle = "#BBF7D0";
    ctx.beginPath();
    ctx.roundRect(40, height * 0.65, 75, 45, 8);
    ctx.fill();

    // 3. Vẽ hồ nước / sông ngòi 2D
    ctx.fillStyle = "#BAE6FD"; // Xanh nước biển
    ctx.beginPath();
    ctx.ellipse(width * 0.22, height * 0.35, 45, 25, Math.PI / 6, 0, 2 * Math.PI);
    ctx.fill();

    // 4. Vẽ mạng lưới đường giao thông 2D
    // Đường nhánh
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";

    // Trục ngang
    ctx.beginPath();
    ctx.moveTo(0, height * 0.45);
    ctx.lineTo(width, height * 0.45);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, height * 0.85);
    ctx.lineTo(width, height * 0.85);
    ctx.stroke();

    // Trục dọc
    ctx.beginPath();
    ctx.moveTo(width * 0.45, 0);
    ctx.lineTo(width * 0.45, height);
    ctx.stroke();

    // Trục đại lộ chính (Vàng cam nổi bật như Google Maps)
    ctx.strokeStyle = "#FEF08A";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    ctx.lineTo(width, height * 0.5);
    ctx.stroke();

    ctx.strokeStyle = "#FDE047";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    ctx.lineTo(width, height * 0.5);
    ctx.stroke();

    // Đại lộ xuyên tâm (Đại lộ Thăng Long / Phạm Hùng)
    ctx.strokeStyle = "#FEF08A";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(width * 0.1, 0);
    ctx.lineTo(width * 0.8, height);
    ctx.stroke();

    ctx.strokeStyle = "#FDE047";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(width * 0.1, 0);
    ctx.lineTo(width * 0.8, height);
    ctx.stroke();

    // 5. Tên phố và địa danh 2D
    ctx.font = "bold 9px sans-serif";
    ctx.fillStyle = "#64748B";
    ctx.fillText("ĐẠI LỘ THĂNG LONG", width * 0.25, height * 0.42);
    ctx.fillText("ĐƯỜNG PHẠM HÙNG", width * 0.48, height * 0.2);
    ctx.fillText("KEANGNAM LANDMARK 72", width * 0.46, height * 0.72);

    // 6. Điểm tòa nhà Keangnam
    ctx.fillStyle = "#003B95";
    ctx.beginPath();
    ctx.roundRect(width * 0.46, height * 0.6, 20, 20, 4);
    ctx.fill();

    // 7. Vẽ GHIM ĐỎ THƯƠNG HIỆU CEO 1983 TẠI VỊ TRÍ CHỌN
    const pinX = width / 2;
    const pinY = height / 2;

    // Vòng tỏa sóng pulse
    ctx.fillStyle = "rgba(220, 38, 38, 0.25)";
    ctx.beginPath();
    ctx.arc(pinX, pinY, 22, 0, 2 * Math.PI);
    ctx.fill();

    // Bóng ghim
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.ellipse(pinX, pinY + 6, 8, 3.5, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Đầu ghim đỏ
    ctx.fillStyle = "#DC2626";
    ctx.beginPath();
    ctx.arc(pinX, pinY - 14, 12, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(pinX - 9, pinY - 10);
    ctx.lineTo(pinX, pinY + 2);
    ctx.lineTo(pinX + 9, pinY - 10);
    ctx.fillStyle = "#DC2626";
    ctx.fill();

    // Chấm trắng ở tâm ghim
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(pinX, pinY - 14, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Hộp chú thích công ty
    ctx.fillStyle = "rgba(0, 59, 149, 0.95)";
    ctx.beginPath();
    const boxW = Math.min(220, width - 40);
    ctx.roundRect(pinX - boxW / 2, pinY - 48, boxW, 24, 6);
    ctx.fill();

    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(companyName.slice(0, 28), pinX, pinY - 33);
  }, [companyName]);

  // Vẽ Canvas khi mount hoặc kích thước thay đổi
  useEffect(() => {
    draw2DCanvasMap();
  }, [draw2DCanvasMap, lat, lng]);

  // Khởi tạo bản đồ Leaflet
  useEffect(() => {
    let isCancelled = false;

    loadLeaflet()
      .then((L) => {
        if (isCancelled || !mapContainerRef.current) return;

        setLeafletLoaded(true);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: zoomLevel,
          zoomControl: false,
        });
        mapInstanceRef.current = map;

        // Custom Zoom Control ở góc phải dưới
        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Tile layer CartoDB Voyager 2D: Rất đẹp, phố xá rõ nét, tốc độ siêu nhanh tại Việt Nam
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OSM',
            maxZoom: 19,
            subdomains: "abcd",
          }
        ).addTo(map);

        // Tạo custom icon ghim đỏ thương hiệu CEO 1983
        const redIcon = L.divIcon({
          className: "ceo-custom-pin",
          html: `
            <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(220, 38, 38, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; width: 30px; height: 30px; border-radius: 50%; background: #DC2626; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 32],
          popupAnchor: [0, -32],
        });

        // Marker cho phép kéo thả (draggable)
        const marker = L.marker([lat, lng], {
          icon: redIcon,
          draggable: true,
        }).addTo(map);
        markerRef.current = marker;

        marker.bindPopup(
          `<div style="font-family: inherit; font-size: 12px; padding: 2px;">
            <strong style="color: #003B95; font-size: 13px;">${companyName}</strong>
            <p style="margin: 4px 0 0; color: #475569; font-size: 11px;">Kéo ghim hoặc bấm vào bản đồ để đổi vị trí</p>
          </div>`
        );

        // Bắt sự kiện khi kéo ghim xong (dragend)
        marker.on("dragend", async (e: any) => {
          const newPos = e.target.getLatLng();
          setLat(newPos.lat);
          setLng(newPos.lng);
          setHasChanged(true);
          await reverseGeocode(newPos.lat, newPos.lng);
        });

        // Bắt sự kiện khi người dùng click vào bất kỳ điểm nào trên bản đồ
        map.on("click", async (e: any) => {
          const { lat: clickLat, lng: clickLng } = e.latlng;
          setLat(clickLat);
          setLng(clickLng);
          marker.setLatLng([clickLat, clickLng]);
          setHasChanged(true);
          await reverseGeocode(clickLat, clickLng);
        });

        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      })
      .catch((err) => {
        console.warn("Leaflet CDN delay, using 2D Canvas Engine fallback:", err);
      });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Cập nhật vị trí ghim và tâm bản đồ khi lat/lng thay đổi
  const updateMapPosition = (newLat: number, newLng: number, zoom = 16) => {
    setLat(newLat);
    setLng(newLng);
    setZoomLevel(zoom);
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
      mapInstanceRef.current.setView([newLat, newLng], zoom, { animate: true });
    }
  };

  // Nút GPS: Lấy vị trí hiện tại của thiết bị
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị GPS!");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        updateMapPosition(latitude, longitude, 17);
        setHasChanged(true);
        toast.success("Đã tìm thấy vị trí GPS hiện tại của bạn!");
        await reverseGeocode(latitude, longitude);
      },
      (err) => {
        setIsLocating(false);
        console.warn("GPS error:", err);
        toast.error("Không thể lấy vị trí GPS. Vui lòng cho phép quyền truy cập vị trí!");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Tìm kiếm vị trí trên bản đồ từ địa chỉ gõ trong ô input
  const handleSearchAddress = async () => {
    if (!address.trim()) {
      toast.error("Vui lòng nhập địa chỉ cần tìm!");
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address.trim()
        )}&limit=1&accept-language=vi`
      );
      if (!res.ok) throw new Error("Search failed");
      const list = await res.json();
      if (!list || list.length === 0) {
        toast.error("Không tìm thấy tọa độ cho địa chỉ này. Hãy thử nhập địa chỉ rõ ràng hơn!");
        return;
      }
      const item = list[0];
      const parsedLat = parseFloat(item.lat);
      const parsedLng = parseFloat(item.lon);
      updateMapPosition(parsedLat, parsedLng, 16);
      setHasChanged(true);
      toast.success("Đã định vị địa chỉ thành công trên bản đồ!");
    } catch {
      toast.error("Không thể tìm kiếm địa chỉ lúc này. Vui lòng thử lại!");
    } finally {
      setIsSearching(false);
    }
  };

  // Click trên canvas 2D fallback để chọn vị trí
  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const deltaX = (x - rect.width / 2) / rect.width;
    const deltaY = (y - rect.height / 2) / rect.height;

    // Giả lập dời tọa độ tương ứng
    const newLat = lat - deltaY * 0.01;
    const newLng = lng + deltaX * 0.01;

    updateMapPosition(newLat, newLng);
    setHasChanged(true);
    await reverseGeocode(newLat, newLng);
  };

  // Lưu địa chỉ và tọa độ vào Hồ Sơ Doanh Nghiệp
  const handleSaveLocation = async () => {
    if (!address.trim()) {
      toast.error("Vui lòng nhập địa chỉ doanh nghiệp!");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        address: address.trim(),
        latitude: lat,
        longitude: lng,
        company: companyName,
      };

      // 1. Lưu vào cache localStorage
      try {
        const rawProfile = localStorage.getItem("vba_custom_profile");
        const customProfile = rawProfile ? JSON.parse(rawProfile) : {};
        localStorage.setItem(
          "vba_custom_profile",
          JSON.stringify({ ...customProfile, address: address.trim(), latitude: lat, longitude: lng })
        );
      } catch {}

      // 2. Gửi API đồng bộ vào CSDL PostgreSQL
      await fetchNestApi("/members/my-location", {
        method: "PUT",
        body: JSON.stringify(payload),
      }).catch(() => {
        return fetchNestApi("/members/me", {
          method: "PATCH",
          body: JSON.stringify({ address: address.trim(), latitude: lat, longitude: lng }),
        });
      });

      // 3. Dispatch event toàn cục
      window.dispatchEvent(
        new CustomEvent("profile-updated", {
          detail: { address: address.trim(), latitude: lat, longitude: lng },
        })
      );
      window.dispatchEvent(
        new CustomEvent("vba_profile_updated", {
          detail: { address: address.trim(), latitude: lat, longitude: lng },
        })
      );

      if (onAddressSaved) {
        onAddressSaved(address.trim(), lat, lng);
      }

      setHasChanged(false);
      toast.success("Đã lưu địa chỉ doanh nghiệp và tọa độ định vị thành công!");
    } catch (err: any) {
      toast.error("Không thể lưu địa chỉ lúc này: " + (err.message || ""));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs space-y-3.5">
      {/* Header khu vực địa chỉ doanh nghiệp */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-[#DC2626] dark:text-red-400 grid place-items-center shrink-0">
            <Building2 className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Địa chỉ &amp; Bản đồ 2D định vị doanh nghiệp
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Chạm hoặc kéo ghim trên bản đồ 2D để cập nhật trụ sở
            </p>
          </div>
        </div>

        {/* Nút GPS định vị tự động */}
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-[#003B95] dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-900 transition cursor-pointer disabled:opacity-50"
          title="Lấy vị trí GPS hiện tại"
        >
          {isLocating ? <Loader2 className="size-3.5 animate-spin" /> : <Navigation className="size-3.5" />}
          <span>{isLocating ? "Đang định vị..." : "GPS của tôi"}</span>
        </button>
      </div>

      {/* 1. Trường nhập địa chỉ doanh nghiệp */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Trụ sở / Văn phòng doanh nghiệp
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-2.5 size-4 text-[#DC2626]" />
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setHasChanged(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleSearchAddress();
                }
              }}
              placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
            />
          </div>
          <button
            type="button"
            onClick={handleSearchAddress}
            disabled={isSearching}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
            title="Định vị địa chỉ này lên bản đồ"
          >
            {isSearching ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
            <span className="hidden sm:inline">Tìm tọa độ</span>
          </button>
        </div>
      </div>

      {/* 2. Bản đồ 2D định vị tương tác hiển thị ngay bên dưới */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Compass className="size-3 text-amber-500" />
            Tọa độ 2D: <strong className="text-slate-700 dark:text-slate-300">{lat.toFixed(4)}, {lng.toFixed(4)}</strong>
          </span>
          <span className="text-amber-600 dark:text-amber-400 font-semibold">
            Bấm lên bản đồ để dời ghim
          </span>
        </div>

        <div className="relative w-full h-[230px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-900">
          {/* Leaflet Map Layer */}
          <div
            ref={mapContainerRef}
            className={`w-full h-full z-0 transition-opacity duration-300 ${
              leafletLoaded ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />

          {/* Fallback 2D Canvas Map Engine (Hiện 0ms ngay lập tức không phụ thuộc CDN) */}
          {!leafletLoaded && (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center">
              <canvas
                ref={canvasRef}
                width={420}
                height={230}
                onClick={handleCanvasClick}
                className="w-full h-full object-cover cursor-crosshair"
              />
              <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2 py-1 rounded-lg text-[9px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                <Layers className="size-3 text-[#003B95]" />
                <span>Bản đồ 2D CEO 1983 (Chạm để dời ghim)</span>
              </div>
            </div>
          )}

          {/* Quick Keangnam button */}
          <button
            type="button"
            onClick={() => updateMapPosition(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, 16)}
            className="absolute bottom-2 left-2 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-2.5 py-1 rounded-xl text-[10px] font-extrabold text-[#003B95] dark:text-amber-400 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
          >
            <LocateFixed className="size-3 text-red-500" />
            <span>Về Keangnam 72</span>
          </button>
        </div>
      </div>

      {/* 3. Nút lưu cập nhật */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-[11px] text-slate-500">
          {hasChanged && (
            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
              <Sparkles className="size-3" /> Có thay đổi chưa lưu
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={isSaving || !hasChanged}
          onClick={handleSaveLocation}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
        >
          {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          <span>{isSaving ? "Đang lưu vị trí..." : "Lưu địa chỉ & Vị trí"}</span>
        </button>
      </div>
    </div>
  );
};
