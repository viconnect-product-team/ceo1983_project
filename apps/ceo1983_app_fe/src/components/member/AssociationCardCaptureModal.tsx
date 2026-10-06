import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  Upload,
  X,
  RotateCw,
  Zap,
  RefreshCw,
  Image as ImageIcon,
  UserCheck,
  AlertCircle,
  ExternalLink,
  BookUser,
  Phone,
  User,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import { fetchNestApi } from "@/lib/api-client";

export interface AssociationCardCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onApplyBackground?: (imageUrl: string) => void;
  onSuccessSaveContact?: (partner: any) => void;
}

export function AssociationCardCaptureModal({
  open,
  onClose,
  onApplyBackground,
  onSuccessSaveContact,
}: AssociationCardCaptureModalProps) {
  const [mounted, setMounted] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"camera" | "upload">("camera");

  // Recognition / Member Check state
  const [analyzing, setAnalyzing] = useState(false);
  const [memberStatus, setMemberStatus] = useState<"idle" | "member_found" | "non_member">("idle");

  // Thông tin liên hệ hội viên: Họ Tên, Số Điện Thoại và Email
  const [contactName, setContactName] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [memberCode, setMemberCode] = useState<string>("");
  const [savingContact, setSavingContact] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { scanImageFile } = useQrScanner({
    active: false,
    torch: false,
    onDetect: () => {},
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Reset state on open/close
  useEffect(() => {
    if (!open) {
      stopCamera();
      setCapturedImage(null);
      setMemberStatus("idle");
      setContactName("");
      setContactPhone("");
      setContactEmail("");
      setMemberCode("");
    } else {
      if (activeTab === "camera" && !capturedImage) {
        startCamera();
      }
    }
  }, [open, activeTab, capturedImage]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    stopCamera();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Trình duyệt không hỗ trợ truy cập máy ảnh");
        setActiveTab("upload");
        return;
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }

      const track = newStream.getVideoTracks()[0];
      const capabilities = (track.getCapabilities?.() as any) || {};
      setTorchSupported(Boolean(capabilities.torch));
    } catch (err) {
      console.warn("[CardCaptureModal] Camera access error:", err);
      toast.error("Không thể mở máy ảnh. Vui lòng cấp quyền hoặc tải ảnh lên từ máy.");
      setActiveTab("upload");
    }
  };

  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
      const nextTorch = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch {
      toast.error("Thiết bị không hỗ trợ bật đèn flash");
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Helper to normalize strings for comparison
  const normalizeText = (str: string): string => {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]/g, "")
      .trim();
  };

  const normalizePhone = (phone: string): string => {
    const digits = (phone || "").replace(/\D/g, "");
    return digits.length > 9 ? digits.slice(-9) : digits;
  };

  const normalizeEmail = (email: string): string => {
    return (email || "").trim().toLowerCase();
  };

  // Hàm đối soát hội viên: (Tên + SĐT) HOẶC (Email + SĐT)
  const checkMemberMatch = (
    membersList: any[],
    inputName: string,
    inputPhone: string,
    inputEmail: string,
  ) => {
    const normInputName = normalizeText(inputName);
    const normInputPhone = normalizePhone(inputPhone);
    const normInputEmail = normalizeEmail(inputEmail);

    if (normInputPhone.length < 8) return null;

    return membersList.find((m) => {
      const mPhone = normalizePhone(m.phone || m.workPhone || m.phoneNumber || "");
      const samePhone = normInputPhone.length >= 8 && mPhone.length >= 8 && normInputPhone === mPhone;
      if (!samePhone) return false;

      // TH1: Tên và Số điện thoại trùng
      const mName = normalizeText(m.name || m.contact || m.personName || "");
      const sameName =
        normInputName.length >= 2 &&
        mName.length >= 2 &&
        (mName.includes(normInputName) || normInputName.includes(mName));

      // TH2: Email và Số điện thoại trùng
      const mEmail = normalizeEmail(m.email || m.workEmail || "");
      const sameEmail =
        normInputEmail.length >= 5 &&
        mEmail.length >= 5 &&
        normInputEmail === mEmail;

      return sameName || sameEmail;
    });
  };

  // Analyze the captured/uploaded card image
  const analyzeCardImage = async (dataUrl: string, fileBlob?: File) => {
    setAnalyzing(true);
    setMemberStatus("idle");

    try {
      let qrText: string | null = null;

      // 1. Quét tìm mã QR trên ảnh danh thiếp
      if (fileBlob) {
        try {
          qrText = await scanImageFile(fileBlob);
        } catch {
          // ignore
        }
      }

      if (!qrText && dataUrl) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], "captured-card.jpg", { type: "image/jpeg" });
          qrText = await scanImageFile(file);
        } catch {
          // ignore
        }
      }

      // 2. Lấy danh sách hội viên chính thức của Hiệp hội CEO 1983 để đối soát
      let directoryMembers: any[] = [];
      try {
        const fetched = await fetchNestApi<any[]>("/members/directory").catch(() => null);
        if (Array.isArray(fetched) && fetched.length > 0) {
          directoryMembers = fetched;
        } else if (typeof window !== "undefined") {
          const cached = localStorage.getItem("vba_directory_members");
          if (cached) directoryMembers = JSON.parse(cached);
        }
      } catch {
        // fallback
      }

      // Danh sách hội viên mẫu mặc định của CLB CEO 1983 (có đầy đủ Tên, SĐT, Email)
      const defaultMembers = [
        { code: "M1983-001", name: "Platform Administrator", phone: "0901000001", email: "admin@ceo1983.vn" },
        { code: "M1983-002", name: "Quản trị viên Hệ thống", phone: "0901000002", email: "quantri@ceo1983.vn" },
        { code: "M1983-003", name: "James Nguyễn", phone: "0901000003", email: "james.nguyen@ceo1983.vn" },
        { code: "M1983-004", name: "Demo User", phone: "0901000004", email: "demo@ceo1983.vn" },
        { code: "M1983-005", name: "Nguyen Hoang Nam", phone: "0901000005", email: "nam.nguyen@ceo1983.vn" },
        { code: "M1983-006", name: "Tran Thu Thao", phone: "0901000006", email: "thao.tran@ceo1983.vn" },
        { code: "M1983-007", name: "Lê Hoàng Long", phone: "0983000001", email: "long.le@ceo1983.vn" },
        { code: "M1983-008", name: "Nguyễn Văn Cường", phone: "0983000002", email: "cuong.nguyen@ceo1983.vn" },
        { code: "M1983-009", name: "Vũ Thu Trang", phone: "0983000003", email: "trang.vu@ceo1983.vn" },
        { code: "M1983-010", name: "Phạm Quang Huy", phone: "0983000004", email: "huy.pham@ceo1983.vn" },
        { code: "M1983-292", name: "Trần Anh Tuấn", phone: "0988123456", email: "tuan.tran@ceo1983.vn" },
      ];

      const allKnownMembers = [...directoryMembers, ...defaultMembers];

      let rawName = "";
      let rawPhone = "";
      let rawEmail = "";
      let foundMemberCode = "";

      // Xử lý nếu mã QR là vCard (BEGIN:VCARD)
      if (qrText && qrText.includes("BEGIN:VCARD")) {
        const nameMatch = qrText.match(/FN[;:]([^\r\n]+)/i);
        const telMatch = qrText.match(/TEL[^:]*:([^\r\n]+)/i);
        const emailMatch = qrText.match(/EMAIL[^:]*:([^\r\n]+)/i);
        rawName = nameMatch ? nameMatch[1].trim() : "";
        rawPhone = telMatch ? telMatch[1].replace(/[^0-9+]/g, "").trim() : "";
        rawEmail = emailMatch ? emailMatch[1].trim() : "";
      } else if (qrText && (qrText.includes("CEO1983") || qrText.includes("/card/") || qrText.startsWith("M1983-"))) {
        let code = "";
        if (qrText.includes("CEO1983-MEMBER:")) {
          code = qrText.replace("CEO1983-MEMBER:", "").trim();
        } else if (qrText.includes("/card/")) {
          const match = qrText.match(/\/card\/([^/?#]+)/);
          code = match ? match[1] : "";
        } else {
          code = qrText.trim();
        }

        try {
          const res = await fetchNestApi<any>(
            `/business-cards/public-card/${encodeURIComponent(code)}`,
          ).catch(() => null);
          if (res) {
            rawName = res.name || res.contact || "";
            rawPhone = res.phone || "";
            rawEmail = res.email || "";
            foundMemberCode = code;
          }
        } catch {
          // ignore
        }
      }

      // Nếu chưa có đủ thông tin từ QR, thử nhận diện OCR qua backend /card-scans
      if (!rawPhone || (!rawName && !rawEmail)) {
        try {
          const ocrRes = await fetchNestApi<any>("/card-scans", {
            method: "POST",
            body: JSON.stringify({
              imageDataUrl: dataUrl,
              clientToken: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "scan-" + Date.now(),
            }),
          }).catch(() => null);

          if (ocrRes?.candidate) {
            const cand = ocrRes.candidate;
            if (!rawName && cand.displayName?.value) rawName = cand.displayName.value;
            if (!rawPhone && cand.phones?.length > 0) rawPhone = cand.phones[0].value;
            if (!rawEmail && cand.emails?.length > 0) rawEmail = cand.emails[0].value;
          }
        } catch {
          // fallback
        }
      }

      // NGUYÊN TẮC BẮT BUỘC:
      // Kiểm tra xem (Tên và Số điện thoại) HAY (Email và Số điện thoại) trên danh thiếp
      // có trùng với hội viên chính thức của Hiệp hội hay không.
      let matchedMember: any = null;

      if (rawPhone) {
        matchedMember = checkMemberMatch(allKnownMembers, rawName, rawPhone, rawEmail);
      }

      if (matchedMember) {
        setContactName(matchedMember.name || rawName);
        setContactPhone(matchedMember.phone || rawPhone);
        setContactEmail(matchedMember.email || rawEmail);
        setMemberCode(matchedMember.code || foundMemberCode || `M1983-${Date.now().toString().slice(-4)}`);
        setMemberStatus("member_found");
        toast.success(`Xác thực thành công: Hội viên ${matchedMember.name} (${matchedMember.phone}) thuộc Hiệp hội CEO 1983!`);
        return;
      }

      // NẾU KHÔNG TRÙNG (TÊN + SĐT) HAY (EMAIL + SĐT) VỚI BẤT KỲ HỘI VIÊN NÀO
      // -> Chuyển sang trạng thái non_member, hiển thị thông báo hướng dẫn cài đặt app ViOne
      setMemberStatus("non_member");
      setContactName(rawName);
      setContactPhone(rawPhone);
      setContactEmail(rawEmail);
      setMemberCode("");
    } catch (err) {
      console.warn("[CardCaptureModal] Analyze error:", err);
      setMemberStatus("non_member");
      setContactName("");
      setContactPhone("");
      setContactEmail("");
      setMemberCode("");
    } finally {
      setAnalyzing(false);
    }
  };

  // Đối soát thủ công: Kiểm tra (Tên + SĐT) HOẶC (Email + SĐT)
  const handleVerifyMember = async () => {
    if (!contactPhone.trim() || (!contactName.trim() && !contactEmail.trim())) {
      toast.error("Vui lòng nhập Số điện thoại và ít nhất Họ tên hoặc Email để đối soát!");
      return;
    }

    setAnalyzing(true);
    try {
      let directoryMembers: any[] = [];
      try {
        const fetched = await fetchNestApi<any[]>("/members/directory").catch(() => null);
        if (Array.isArray(fetched) && fetched.length > 0) {
          directoryMembers = fetched;
        } else if (typeof window !== "undefined") {
          const cached = localStorage.getItem("vba_directory_members");
          if (cached) directoryMembers = JSON.parse(cached);
        }
      } catch {
        // fallback
      }

      const defaultMembers = [
        { code: "M1983-001", name: "Platform Administrator", phone: "0901000001", email: "admin@ceo1983.vn" },
        { code: "M1983-002", name: "Quản trị viên Hệ thống", phone: "0901000002", email: "quantri@ceo1983.vn" },
        { code: "M1983-003", name: "James Nguyễn", phone: "0901000003", email: "james.nguyen@ceo1983.vn" },
        { code: "M1983-004", name: "Demo User", phone: "0901000004", email: "demo@ceo1983.vn" },
        { code: "M1983-005", name: "Nguyen Hoang Nam", phone: "0901000005", email: "nam.nguyen@ceo1983.vn" },
        { code: "M1983-006", name: "Tran Thu Thao", phone: "0901000006", email: "thao.tran@ceo1983.vn" },
        { code: "M1983-007", name: "Lê Hoàng Long", phone: "0983000001", email: "long.le@ceo1983.vn" },
        { code: "M1983-008", name: "Nguyễn Văn Cường", phone: "0983000002", email: "cuong.nguyen@ceo1983.vn" },
        { code: "M1983-009", name: "Vũ Thu Trang", phone: "0983000003", email: "trang.vu@ceo1983.vn" },
        { code: "M1983-010", name: "Phạm Quang Huy", phone: "0983000004", email: "huy.pham@ceo1983.vn" },
        { code: "M1983-292", name: "Trần Anh Tuấn", phone: "0988123456", email: "tuan.tran@ceo1983.vn" },
      ];

      const allKnownMembers = [...directoryMembers, ...defaultMembers];
      const matchedMember = checkMemberMatch(allKnownMembers, contactName, contactPhone, contactEmail);

      if (matchedMember) {
        setContactName(matchedMember.name || contactName);
        setContactPhone(matchedMember.phone || contactPhone);
        setContactEmail(matchedMember.email || contactEmail);
        setMemberCode(matchedMember.code || `M1983-${Date.now().toString().slice(-4)}`);
        setMemberStatus("member_found");
        toast.success(`Xác thực thành công: Hội viên ${matchedMember.name} (${matchedMember.phone}) thuộc Hiệp hội CEO 1983!`);
      } else {
        setMemberStatus("non_member");
        toast.error("Không tìm thấy hội viên khớp (Họ tên + Số điện thoại) hoặc (Email + Số điện thoại) trong danh bạ Hiệp Hội!");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const targetAspect = 1.7;
    const videoWidth = video.videoWidth || 1280;
    const videoHeight = video.videoHeight || 720;
    const videoAspect = videoWidth / videoHeight;

    let cropWidth = videoWidth;
    let cropHeight = videoHeight;
    let startX = 0;
    let startY = 0;

    if (videoAspect > targetAspect) {
      cropWidth = videoHeight * targetAspect * 0.85;
      cropHeight = videoHeight * 0.85;
      startX = (videoWidth - cropWidth) / 2;
      startY = (videoHeight - cropHeight) / 2;
    } else {
      cropWidth = videoWidth * 0.88;
      cropHeight = (videoWidth * 0.88) / targetAspect;
      startX = (videoWidth - cropWidth) / 2;
      startY = (videoHeight - cropHeight) / 2;
    }

    canvas.width = 1020;
    canvas.height = 600;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, startX, startY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    setCapturedImage(dataUrl);
    stopCamera();

    // Trigger analysis
    void analyzeCardImage(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      stopCamera();
      void analyzeCardImage(dataUrl, file);
    };
    reader.readAsDataURL(file);
  };

  // Lưu danh bạ số: CHỈ LƯU HỘI VIÊN THUỘC HIỆP HỘI
  const handleSaveToDigitalContacts = async () => {
    if (memberStatus !== "member_found" || !memberCode || memberCode === "NON_MEMBER") {
      toast.error("Tính năng không áp dụng cho người không thuộc app hiệp hội!");
      return;
    }

    if (!contactName.trim()) {
      toast.error("Vui lòng nhập tên hội viên");
      return;
    }
    if (!contactPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    setSavingContact(true);
    try {
      const cleanName = contactName.trim();
      const cleanPhone = contactPhone.trim();

      // 1. Lưu vào danh bạ số hiệp hội (localStorage)
      if (typeof window !== "undefined") {
        try {
          const existingContacts = JSON.parse(
            localStorage.getItem("vba_connected_members") || "[]",
          );
          const isExisted = existingContacts.some((c: any) => c.phone === cleanPhone);
          if (!isExisted) {
            existingContacts.unshift({
              name: cleanName,
              phone: cleanPhone,
              code: memberCode || "M1983-MEMBER",
              savedAt: new Date().toISOString(),
              source: "card_photo_ocr",
            });
            localStorage.setItem("vba_connected_members", JSON.stringify(existingContacts));
          }
        } catch {
          // ignore
        }
      }

      // 2. Gửi API lưu liên hệ danh bạ
      await fetchNestApi("/api/members/contacts", {
        method: "POST",
        body: JSON.stringify({
          targetCode: memberCode || "M1983-MEMBER",
          targetName: cleanName,
          targetPhone: cleanPhone,
        }),
      }).catch(() => {});

      // 3. Tải file vCard .vcf CHỈ CHỨA TÊN VÀ SỐ ĐIỆN THOẠI (Không có TITLE, không có NOTE/mô tả)
      const vcardContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${cleanName}\nTEL:${cleanPhone}\nEND:VCARD`;
      const blob = new Blob([vcardContent], { type: "text/vcard;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${cleanName.replace(/\s+/g, "_")}.vcf`;
      link.click();

      toast.success(`Đã thêm ${cleanName} (${cleanPhone}) vào danh bạ số thành công!`);
      onSuccessSaveContact?.({
        name: cleanName,
        phone: cleanPhone,
        code: memberCode,
      });
      handleClose();
    } catch {
      toast.error("Không thể lưu danh bạ. Vui lòng thử lại!");
    } finally {
      setSavingContact(false);
    }
  };

  const handleOpenViOneApp = () => {
    if (typeof window !== "undefined") {
      window.open("https://14.225.217.232:5445/connect-app", "_blank");
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setMemberStatus("idle");
    setContactName("");
    setContactPhone("");
    setContactEmail("");
    setMemberCode("");
    if (activeTab === "camera") {
      startCamera();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setMemberStatus("idle");
    setContactName("");
    setContactPhone("");
    setContactEmail("");
    setMemberCode("");
    onClose();
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#070D18] text-slate-900 dark:text-white rounded-3xl shadow-2xl border border-slate-200 dark:border-amber-500/25 overflow-hidden flex flex-col my-auto max-h-[92dvh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - CEO 1983 Navy Blue & Amber Gold */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-200 dark:border-white/10 bg-[#003B95] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 text-amber-300 border border-amber-400/40 shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
                Chụp Ảnh Danh Thiếp
              </h3>
              <p className="text-[11px] text-amber-200/90 font-medium">
                Kiểm tra hội viên & thêm tên + số điện thoại vào danh bạ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {!capturedImage && (
          <div className="px-4 pt-3 pb-1 bg-slate-50 dark:bg-[#0A101D] border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center bg-slate-200/80 dark:bg-black/40 p-1 rounded-2xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("camera");
                  setCapturedImage(null);
                }}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "camera"
                    ? "bg-[#003B95] text-white font-bold shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Máy Ảnh Trực Tiếp</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("upload");
                  stopCamera();
                }}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "upload"
                    ? "bg-[#003B95] text-white font-bold shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải Ảnh Từ Máy</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Body */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[380px] flex items-center justify-center bg-black overflow-hidden">
          {capturedImage ? (
            /* PREVIEW & RECOGNITION RESULT */
            <div className="relative w-full h-full p-4 flex flex-col items-center justify-center gap-3 overflow-y-auto">
              <div className="relative w-full max-w-sm aspect-[1.7/1] rounded-2xl overflow-hidden border-2 border-amber-400/90 shadow-2xl shadow-amber-500/20 shrink-0">
                <img
                  src={capturedImage}
                  alt="Danh thiếp đã chụp"
                  className="w-full h-full object-cover"
                />
                {analyzing && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                    <span className="text-xs font-semibold">
                      Đang kiểm tra thông tin hội viên...
                    </span>
                  </div>
                )}
              </div>

              {/* ── TRƯỜNG HỢP 1: LÀ HỘI VIÊN HIỆP HỘI CEO 1983 ── */}
              {/* HIỂN THỊ TÊN, SỐ ĐIỆN THOẠI VÀ EMAIL (NẾU CÓ) */}
              {memberStatus === "member_found" && (
                <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-4 border border-emerald-500/40 shadow-lg animate-scale-in text-slate-900 dark:text-white">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-white/10">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Hội Viên CEO 1983</span>
                    </span>
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      {memberCode}
                    </span>
                  </div>

                  {/* Form hiển thị và chỉnh sửa: Tên, Số điện thoại và Email */}
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                        <User className="w-3.5 h-3.5 text-[#003B95] dark:text-blue-400" />
                        <span>Họ và tên</span>
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Nhập họ và tên"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003B95]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Số điện thoại</span>
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="Nhập số điện thoại"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {contactEmail && (
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                          <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                          <span>Email</span>
                        </label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="Email hội viên"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveToDigitalContacts}
                    disabled={savingContact}
                    className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 active:scale-98 transition-all cursor-pointer"
                  >
                    {savingContact ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <BookUser className="w-4 h-4" />
                    )}
                    <span>{savingContact ? "Đang lưu..." : "Thêm Vào Danh Bạ Số"}</span>
                  </button>

                  <div className="mt-3 text-center">
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="text-[11px] text-slate-400 hover:text-amber-500 underline transition cursor-pointer"
                    >
                      Chụp lại danh thiếp khác
                    </button>
                  </div>
                </div>
              )}

              {/* ── TRƯỜNG HỢP 2: KHÔNG THUỘC HIỆP HỘI -> THÔNG BÁO SANG APP VIONE ── */}
              {memberStatus === "non_member" && (
                <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-amber-500/60 shadow-xl shadow-amber-500/10 animate-scale-in text-slate-900 dark:text-white text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 grid place-items-center text-amber-500 mb-3">
                    <AlertCircle className="w-6 h-6" />
                  </div>

                  <h4 className="font-extrabold text-sm text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                    Thông Báo Danh Thiếp
                  </h4>

                  {/* Thông báo chuẩn nguyên văn yêu cầu */}
                  <p className="text-xs text-slate-700 dark:text-slate-200 mt-2 px-1 font-semibold leading-relaxed">
                    Chức năng chụp ảnh lưu danh bạ không áp dụng cho người không phải hội viên nhưng bạn có thể cài đặt app ViOne để sử dụng chức năng này.
                  </p>

                  {/* Nút liên kết trực tiếp đến trang web / app ViOne theo yêu cầu */}
                  <div className="mt-4 flex flex-col gap-2.5">
                    <a
                      href="https://14.225.217.232:5445/connect-app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FFBE00] to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-98 transition-all cursor-pointer"
                    >
                      <span>Cài Đặt / Mở Ứng Dụng ViOne</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      type="button"
                      onClick={handleRetake}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Chụp lại danh thiếp khác
                    </button>
                  </div>

                  {/* Đối soát thủ công nếu danh thiếp mờ hoặc quét chưa trúng */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 text-left">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Đối soát trực tiếp thông tin hội viên:
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">
                      (Hệ thống kiểm tra trùng Tên + SĐT hoặc Email + SĐT)
                    </p>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Họ và tên hội viên"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                      />
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="Số điện thoại hội viên (*)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                      />
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="Email hội viên"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyMember}
                        disabled={analyzing}
                        className="w-full py-2 rounded-lg bg-[#003B95] hover:bg-[#002b70] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
                      >
                        {analyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                        <span>Đối Soát Hội Viên</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === "camera" ? (
            /* LIVE CAMERA VIEW */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`absolute inset-0 w-full h-full object-cover ${
                  facingMode === "user" ? "scale-x-[-1]" : ""
                }`}
              />

              <div className="absolute inset-0 bg-black/60 pointer-events-none" />

              <div className="relative z-10 w-[88%] max-w-[420px] aspect-[1.7/1] rounded-2xl border-2 border-amber-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] pointer-events-none flex flex-col justify-between p-3.5">
                <div className="absolute top-0 left-0 w-5 h-5 border-t-3 border-l-3 border-amber-300 rounded-tl-xl -mt-0.5 -ml-0.5" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-3 border-r-3 border-amber-300 rounded-tr-xl -mt-0.5 -mr-0.5" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-3 border-l-3 border-amber-300 rounded-bl-xl -mb-0.5 -ml-0.5" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-3 border-r-3 border-amber-300 rounded-br-xl -mb-0.5 -mr-0.5" />

                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_10px_#F59E0B] animate-pulse" />

                <div className="text-center">
                  <span className="inline-block px-3 py-1 rounded-full text-[11px] font-medium bg-black/75 backdrop-blur-md text-amber-200 border border-amber-400/30">
                    Căn chỉnh danh thiếp vừa khít trong khung
                  </span>
                </div>
              </div>

              <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                {torchSupported && (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={`p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                      torchOn
                        ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/40"
                        : "bg-black/60 text-white hover:bg-black/80 border border-white/10"
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={switchCamera}
                  className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 border border-white/10 transition-all cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* UPLOAD VIEW */
            <div className="p-8 text-center flex flex-col items-center justify-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4 shadow-sm">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-white">Tải Ảnh Danh Thiếp</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Chọn ảnh danh thiếp từ thiết bị. Hệ thống sẽ tự động kiểm tra hội viên và lưu tên +
                số điện thoại vào danh bạ.
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 px-6 py-3 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Chọn Tệp Ảnh Từ Máy</span>
              </button>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070D18] flex flex-wrap items-center justify-between gap-3">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-white/5 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Chụp / Chọn Lại</span>
              </button>

              {onApplyBackground && (
                <button
                  type="button"
                  onClick={() => {
                    if (capturedImage) {
                      onApplyBackground(capturedImage);
                      toast.success("Đã áp dụng ảnh nền cho danh thiếp!");
                      handleClose();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Áp Dụng Làm Nền</span>
                </button>
              )}
            </>
          ) : activeTab === "camera" ? (
            <div className="w-full flex items-center justify-center">
              <button
                type="button"
                onClick={handleCapture}
                className="w-16 h-16 rounded-full border-2 border-white/80 p-1 bg-white/5 hover:bg-white/15 transition-all flex items-center justify-center active:scale-90 cursor-pointer shadow-lg shadow-amber-400/20"
                title="Bấm để chụp"
              >
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-200 hover:brightness-110 transition-all shadow-[0_0_12px_rgba(245,158,11,0.4)]" />
              </button>
            </div>
          ) : (
            <div className="w-full text-center text-xs text-slate-500">
              Hỗ trợ JPG, PNG, WEBP. Ảnh rõ nét sẽ nhận diện tên và số điện thoại nhanh chóng.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
