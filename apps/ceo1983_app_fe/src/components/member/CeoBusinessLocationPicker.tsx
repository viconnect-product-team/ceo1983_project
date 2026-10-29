import React, { useState, useEffect, useRef } from "react";
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

// Center Hanoi Keangnam
const DEFAULT_CENTER = { lat: 21.0175, lng: 105.7838 };

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

export const CeoBusinessLocationPicker: React.FC<CeoBusinessLocationPickerProps> = ({
  initialAddress = "",
  initialLat,
  initialLng,
  companyName = "Doanh nghiệp CEO 1983",
  userId,
  onAddressSaved,
}) => {
  const [address, setAddress] = useState(initialAddress);
  const [lat, setLat] = useState<number>(initialLat && !isNaN(initialLat) ? initialLat : DEFAULT_CENTER.lat);
  const [lng, setLng] = useState<number>(initialLng && !isNaN(initialLng) ? initialLng : DEFAULT_CENTER.lng);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
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

  // Khởi tạo bản đồ Leaflet
  useEffect(() => {
    let isCancelled = false;

    loadLeaflet()
      .then((L) => {
        if (isCancelled || !mapContainerRef.current) return;

        // Tránh tạo lặp map
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: 15,
          zoomControl: false,
        });
        mapInstanceRef.current = map;

        // Custom Zoom Control ở góc phải dưới
        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Tile layer chuẩn Google Maps & OpenStreetMap sạch đẹp
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://openstreetmap.org">OSM</a>',
          maxZoom: 19,
        }).addTo(map);

        // Tạo custom icon ghim đỏ thương hiệu CEO 1983
        const redIcon = L.divIcon({
          className: "ceo-custom-pin",
          html: `
            <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(220, 38, 38, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; width: 30px; height: 30px; border-radius: 50%; background: #DC2626; border: 2px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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

        // Kích hoạt lại resize khi render
        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      })
      .catch((err) => {
        console.warn("Leaflet load error:", err);
      });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Cập nhật vị trí ghim và tâm bản đồ khi lat/lng thay đổi từ bên ngoài
  const updateMapPosition = (newLat: number, newLng: number, zoomLevel = 16) => {
    setLat(newLat);
    setLng(newLng);
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
      mapInstanceRef.current.setView([newLat, newLng], zoomLevel, { animate: true });
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
        toast.error("Không tìm thấy tọa độ phù hợp cho địa chỉ này. Bạn có thể bấm chọn trực tiếp trên bản đồ!");
        return;
      }
      const item = list[0];
      const newLat = parseFloat(item.lat);
      const newLng = parseFloat(item.lon);
      updateMapPosition(newLat, newLng, 16);
      setHasChanged(true);
      toast.success("Đã định vị được vị trí trên bản đồ!");
    } catch {
      toast.error("Lỗi kết nối tra cứu tọa độ!");
    } finally {
      setIsSearching(false);
    }
  };

  // Lưu địa chỉ và vị trí bản đồ vào CSDL
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
        isSharing: true,
      };

      // 1. Cập nhật localStorage để phản hồi tức thì
      try {
        const stored = JSON.parse(localStorage.getItem("vba_my_member") || "{}");
        const updated = {
          ...stored,
          address: address.trim(),
          latitude: lat,
          longitude: lng,
          is_location_sharing: true,
        };
        localStorage.setItem("vba_my_member", JSON.stringify(updated));
        if (userId) {
          localStorage.setItem(`vba_my_member_${userId}`, JSON.stringify(updated));
        }

        const customProfile = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
        localStorage.setItem(
          "vba_custom_profile",
          JSON.stringify({ ...customProfile, address: address.trim(), latitude: lat, longitude: lng })
        );
      } catch {}

      // 2. Gửi API đồng bộ vào CSDL PostgreSQL (hỗ trợ cả members/me và members/my-location)
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
              Địa chỉ &amp; Bản đồ định vị doanh nghiệp
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Chạm hoặc kéo ghim trên bản đồ để cập nhật vị trí trụ sở
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

      {/* 2. Bản đồ định vị tương tác hiển thị ngay bên dưới */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Compass className="size-3 text-amber-500" />
            Tọa độ: <strong className="text-slate-700 dark:text-slate-300">{lat.toFixed(4)}, {lng.toFixed(4)}</strong>
          </span>
          <span className="text-amber-600 dark:text-amber-400 font-semibold">
            Bấm lên bản đồ để dời ghim
          </span>
        </div>

        <div className="relative w-full h-[220px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-900">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
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

