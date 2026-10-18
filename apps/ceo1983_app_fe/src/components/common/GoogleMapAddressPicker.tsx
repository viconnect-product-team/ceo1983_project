import React, { useState } from "react";
import { MapPin, Navigation, ExternalLink, Map, X, Check, Loader2 } from "lucide-react";
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
  },
  {
    name: "Trung tâm Hội nghị Quốc gia",
    address: "Đại lộ Thăng Long, Mễ Trì, Nam Từ Liêm, Hà Nội",
  },
  {
    name: "Khách sạn JW Marriott Hanoi",
    address: "Số 8 Đỗ Đức Dục, Mễ Trì, Nam Từ Liêm, Hà Nội",
  },
  {
    name: "Khách sạn Lotte Hotel Hanoi",
    address: "Số 54 Liễu Giai, Cống Vị, Ba Đình, Hà Nội",
  },
];

export function GoogleMapAddressPicker({
  id,
  value,
  onChange,
  placeholder = "Nhập địa chỉ hoặc chọn vị trí trên Google Maps...",
  required = false,
  className = "",
  error,
  label,
  helperText,
  showQuickLocations = true,
}: GoogleMapAddressPickerProps) {
  const [locating, setLocating] = useState(false);
  const [showMapPreview, setShowMapPreview] = useState(false);

  // Mở Google Maps tìm kiếm theo địa chỉ
  const handleOpenGoogleMaps = () => {
    if (!value.trim()) {
      toast.info("Vui lòng nhập địa chỉ trước khi mở Google Maps!");
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value.trim())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Định vị vị trí hiện tại qua GPS Browser Geolocation
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
        try {
          // Reverse geocoding miễn phí từ Nominatim OpenStreetMap
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "vi" } }
          );
          if (res.ok) {
            const data = await res.json();
            const formatted = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            onChange(formatted, { lat: latitude, lng: longitude, mapUrl });
            toast.success("✓ Đã định vị thành công vị trí của bạn!", { id: toastId });
            setShowMapPreview(true);
          } else {
            const fallbackAddr = `Vị trí tọa độ: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            onChange(fallbackAddr, { lat: latitude, lng: longitude, mapUrl });
            toast.success("✓ Đã lấy tọa độ GPS thành công!", { id: toastId });
            setShowMapPreview(true);
          }
        } catch {
          const fallbackAddr = `Vị trí tọa độ: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          onChange(fallbackAddr, { lat: latitude, lng: longitude, mapUrl });
          toast.success("✓ Đã lấy tọa độ GPS thành công!", { id: toastId });
          setShowMapPreview(true);
        } finally {
          setLocating(false);
        }
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

  const mapEmbedUrl = value.trim()
    ? `https://maps.google.com/maps?q=${encodeURIComponent(value.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : "";

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block text-xs font-semibold text-foreground">
            {label} {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
          <div className="flex items-center gap-2">
            {value.trim() && (
              <button
                type="button"
                onClick={() => setShowMapPreview(!showMapPreview)}
                className="text-[11px] font-bold text-[#003B95] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Map className="h-3 w-3" />
                <span>{showMapPreview ? "Ẩn bản đồ" : "Xem bản đồ"}</span>
              </button>
            )}
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
          className={`h-10 w-full rounded-xl border bg-background pl-9 pr-24 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B95]/30 transition ${
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

          {/* Nút định vị GPS */}
          <button
            type="button"
            onClick={handleLocateCurrentPosition}
            disabled={locating}
            title="Định vị vị trí hiện tại của bạn"
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[10px] font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {locating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Navigation className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            )}
            <span className="hidden sm:inline">Định vị</span>
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
                  mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`,
                });
                setShowMapPreview(true);
              }}
              className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-secondary/50 hover:bg-primary/10 hover:border-primary/40 text-foreground transition cursor-pointer"
            >
              📍 {loc.name}
            </button>
          ))}
        </div>
      )}

      {/* Google Maps Preview Embed Iframe */}
      {showMapPreview && value.trim() && (
        <div className="mt-2 rounded-xl border border-border overflow-hidden shadow-xs animate-in fade-in duration-200">
          <div className="bg-muted/70 px-3 py-1.5 border-b border-border flex items-center justify-between text-[11px]">
            <span className="font-semibold text-foreground flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span className="truncate">{value}</span>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleOpenGoogleMaps}
                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Mở bản đồ lớn</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowMapPreview(false)}
                className="text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
          <iframe
            title={`Bản đồ định vị: ${value}`}
            src={mapEmbedUrl}
            className="w-full h-36 border-0 bg-muted"
            loading="lazy"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
