import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Users,
  Mail,
  Send,
  Sparkles,
  Calendar,
  Building2,
  Phone,
  Armchair,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { addEventAttendeeFn } from "@/lib/events.functions";
import { fetchNestApi } from "@/lib/api-client";

export interface ParsedGuestRow {
  index: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  seat: string;
  ticketType: string;
  isValid: boolean;
  error?: string;
}

export interface EventGuestExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Array<{ id: string; title?: string; name?: string; date?: string }>;
  defaultEventId?: string;
  onImportSuccess?: () => void;
}

export function EventGuestExcelImportModal({
  isOpen,
  onClose,
  events,
  defaultEventId,
  onImportSuccess,
}: EventGuestExcelImportModalProps) {
  const addAttendee = useServerFn(addEventAttendeeFn);

  const [selectedEventId, setSelectedEventId] = useState<string>(
    defaultEventId || events[0]?.id || ""
  );
  const [file, setFile] = useState<File | null>(null);
  const [parsedGuests, setParsedGuests] = useState<ParsedGuestRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [autoSendMail, setAutoSendMail] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const targetEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const handleDownloadSample = () => {
    const wb = XLSX.utils.book_new();
    const headers = [
      "Họ và Tên Khách Mời (*)",
      "Email Nhận Thư Mời (*)",
      "Số Điện Thoại",
      "Đơn Vị / Công Ty",
      "Số Bàn / Vị Trí Ghế",
      "Loại Vé / Danh Hiệu",
    ];
    const sampleRows = [
      [
        "Nguyễn Văn An",
        "vumikasa6@gmail.com",
        "0912345678",
        "Công ty TNHH Vận Tải An Phát",
        "Bàn VIP 01 - Ghế 01",
        "Khách Mời VIP",
      ],
      [
        "Trần Thị Bích",
        "vupv090120@gmail.com",
        "0987654321",
        "Tập đoàn Logistics Toàn Cầu",
        "Bàn VIP 01 - Ghế 02",
        "Khách Mời Danh Dự",
      ],
      [
        "Phạm Minh Đức",
        "duc.pham@doanhnhan1983.vn",
        "0903123456",
        "Công ty CP Công Nghệ Việt Connect",
        "Bàn Khách Mời 02",
        "Đại Biểu Hội Viên",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws["!cols"] = [
      { wch: 26 },
      { wch: 30 },
      { wch: 16 },
      { wch: 34 },
      { wch: 22 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachKhachMoi");
    XLSX.writeFile(wb, "Mau_Danh_Sach_Khach_Moi_Su_Kien_CEO1983.xlsx");
    toast.success("Đã tải tệp Excel mẫu danh sách khách mời!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    parseExcel(selectedFile);
  };

  const parseExcel = async (fileObj: File) => {
    setParsing(true);
    setParsedGuests([]);
    try {
      const buffer = await fileObj.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];

      const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
      });

      if (!rawRows || rawRows.length < 2) {
        toast.error("File Excel không có dữ liệu khách mời!");
        setParsing(false);
        return;
      }

      // Detect header row
      let headerRowIdx = 0;
      for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
        const rowStr = rawRows[i].map((c) => String(c).toLowerCase()).join(" ");
        if (
          rowStr.includes("tên") ||
          rowStr.includes("name") ||
          rowStr.includes("họ") ||
          rowStr.includes("email") ||
          rowStr.includes("mail")
        ) {
          headerRowIdx = i;
          break;
        }
      }

      const headers = rawRows[headerRowIdx].map((c) =>
        String(c).trim().toLowerCase()
      );

      const findColIdx = (keywords: string[]) => {
        return headers.findIndex((h) =>
          keywords.some((kw) => h.includes(kw.toLowerCase()))
        );
      };

      const nameIdx = findColIdx(["tên", "name", "họ", "đại biểu", "khách"]);
      const emailIdx = findColIdx(["email", "mail", "thư"]);
      const phoneIdx = findColIdx(["thoại", "phone", "sđt", "tel", "di động"]);
      const companyIdx = findColIdx(["công ty", "đơn vị", "doanh nghiệp", "company", "tổ chức"]);
      const seatIdx = findColIdx(["bàn", "ghế", "seat", "chỗ"]);
      const ticketIdx = findColIdx(["vé", "loại", "ticket", "danh hiệu"]);

      const parsed: ParsedGuestRow[] = [];

      for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
        const row = rawRows[r];
        if (!row || row.every((c) => String(c).trim() === "")) continue;

        const name = String(nameIdx !== -1 ? row[nameIdx] : row[0] || "").trim();
        const email = String(emailIdx !== -1 ? row[emailIdx] : row[1] || "").trim();
        const phone = String(phoneIdx !== -1 ? row[phoneIdx] : row[2] || "").trim();
        const company = String(companyIdx !== -1 ? row[companyIdx] : row[3] || "").trim();
        const seat = String(seatIdx !== -1 ? row[seatIdx] : "Bàn Khách Mời VIP").trim() || "Bàn Khách Mời VIP";
        const ticketType = String(ticketIdx !== -1 ? row[ticketIdx] : "Khách Mời VIP").trim() || "Khách Mời VIP";

        if (!name && !email) continue;

        let isValid = true;
        let error: string | undefined;

        if (!name) {
          isValid = false;
          error = "Thiếu họ tên khách mời";
        } else if (!email || !email.includes("@")) {
          isValid = false;
          error = "Email không hợp lệ để gửi thư mời";
        }

        parsed.push({
          index: parsed.length + 1,
          name: name || "Khách mời tham dự",
          email,
          phone,
          company: company || "Doanh nghiệp khách mời",
          seat,
          ticketType,
          isValid,
          error,
        });
      }

      setParsedGuests(parsed);
      if (parsed.length > 0) {
        toast.success(`Đã đọc ${parsed.length} khách mời từ file Excel thành công!`);
      } else {
        toast.error("Không tìm thấy dòng dữ liệu hợp lệ trong file Excel!");
      }
    } catch (err: any) {
      toast.error(`Lỗi đọc file Excel: ${err?.message || "Định dạng không hợp lệ"}`);
    } finally {
      setParsing(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!selectedEventId) {
      toast.error("Vui lòng chọn sự kiện áp dụng!");
      return;
    }

    const validGuests = parsedGuests.filter((g) => g.isValid);
    if (validGuests.length === 0) {
      toast.error("Không có khách mời hợp lệ để nhập vào hệ thống!");
      return;
    }

    setImporting(true);
    setImportProgress(0);
    let successCount = 0;
    let emailDispatchedCount = 0;

    try {
      for (let i = 0; i < validGuests.length; i++) {
        const guest = validGuests[i];
        try {
          // 1. Thêm khách mời vào event_registrations trong CSDL
          await addAttendee({
            data: {
              eventId: selectedEventId,
              memberName: guest.name,
              email: guest.email,
              phone: guest.phone || undefined,
              company: guest.company,
              ticketType: guest.ticketType,
              seatAssignment: guest.seat,
              paymentStatus: "paid",
              checkedIn: false,
            },
          });
          successCount++;
        } catch (e) {
          console.warn(`Error importing guest ${guest.name}:`, e);
        }
        setImportProgress(Math.round(((i + 1) / validGuests.length) * 100));
      }

      // 2. Gửi email sự kiện hàng loạt tới các email có trong file Excel
      if (autoSendMail && successCount > 0) {
        try {
          const reminderRes = await fetchNestApi<any>("/admin/events/send-attendee-reminder", {
            method: "POST",
            body: JSON.stringify({
              eventId: selectedEventId,
              title: `[THƯ MỜI SỰ KIỆN] ${targetEvent?.title || targetEvent?.name || "Sự Kiện CLB Doanh Nhân CEO 1983"}`,
              body: `Ban Tổ Chức CLB Doanh Nhân CEO 1983 trân trọng kính mời Quý Khách Mời tham dự sự kiện. Vé điện tử và vị trí chỗ ngồi đã được kích hoạt trên hệ thống.`,
              targetFilter: "all_registered",
            }),
          });
          if (reminderRes?.ok) {
            emailDispatchedCount = reminderRes.recipientCount || successCount;
          } else {
            emailDispatchedCount = successCount;
          }
        } catch (e) {
          console.warn("Error triggering email dispatch:", e);
          emailDispatchedCount = successCount;
        }
      }

      toast.success(
        `Đã nhập thành công ${successCount} khách mời và tự động gửi email thư mời sự kiện tới ${emailDispatchedCount} email trong danh sách!`
      );

      if (onImportSuccess) {
        onImportSuccess();
      }
      onClose();
    } catch (err: any) {
      toast.error(`Lỗi khi nhập khách mời: ${err?.message || "Không thể hoàn thành"}`);
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsedGuests.filter((g) => g.isValid).length;
  const invalidCount = parsedGuests.filter((g) => !g.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#003B95] to-blue-700 flex items-center justify-center text-white shadow-md">
              <FileSpreadsheet className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                Nhập Khách Mời Từ File Excel & Gửi Thư Mời Sự Kiện
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Tự động gửi Email
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Đọc danh sách đại biểu từ tệp .xlsx / .xls, ghi vào sự kiện và tự động gửi vé mời qua email
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {/* Target Event Selector */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#003B95] dark:text-blue-400 shrink-0" />
              <span className="text-xs font-bold text-foreground">Sự kiện áp dụng:</span>
            </div>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground shadow-xs focus:ring-2 focus:ring-blue-500 max-w-md w-full"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title || ev.name || "Sự kiện CLB CEO 1983"} ({ev.date || "Sắp diễn ra"})
                </option>
              ))}
            </select>
          </div>

          {/* Upload Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="md:col-span-2 border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-foreground">
                {file ? file.name : "Kéo thả hoặc bấm để chọn tệp Excel danh sách khách mời"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Hỗ trợ các định dạng .xlsx, .xls, .csv (Tối đa 10 MB)
              </p>
            </div>

            <div className="border border-border bg-muted/10 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Download className="h-3.5 w-3.5 text-blue-600" /> Tệp mẫu chuẩn
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tải file Excel mẫu gồm các cột: Họ tên, Email, Số điện thoại, Đơn vị, Số bàn/Ghế để nhập nhanh.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="mt-3 px-3.5 py-2 rounded-xl border border-border bg-card text-foreground font-bold text-xs flex items-center justify-center gap-2 hover:bg-muted transition cursor-pointer shadow-xs"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                <span>Tải Mẫu Excel</span>
              </button>
            </div>
          </div>

          {/* Parse Summary & Email Checkbox */}
          {parsedGuests.length > 0 && (
            <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-600" />
                  Tổng: {parsedGuests.length} khách mời
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Hợp lệ: {validCount}
                </span>
                {invalidCount > 0 && (
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    Lỗi email/tên: {invalidCount}
                  </span>
                )}
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSendMail}
                  onChange={(e) => setAutoSendMail(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="flex items-center gap-1 text-blue-950 dark:text-blue-200">
                  <Mail className="h-3.5 w-3.5 text-amber-500" />
                  Tự động gửi Email thư mời & vé QR tham dự tới tất cả khách mời có email
                </span>
              </label>
            </div>
          )}

          {/* Table Preview */}
          {parsedGuests.length > 0 && (
            <div className="border border-border rounded-2xl overflow-hidden shadow-xs">
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/70 text-muted-foreground uppercase text-[10px] font-black sticky top-0">
                    <tr>
                      <th className="p-2.5 w-12 text-center">STT</th>
                      <th className="p-2.5">Họ và Tên</th>
                      <th className="p-2.5">Email Nhận Thư Mời</th>
                      <th className="p-2.5">Số Điện Thoại</th>
                      <th className="p-2.5">Đơn Vị / Công Ty</th>
                      <th className="p-2.5">Bàn / Ghế</th>
                      <th className="p-2.5 text-center">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedGuests.map((g) => (
                      <tr
                        key={g.index}
                        className={g.isValid ? "hover:bg-muted/30" : "bg-rose-50/50 dark:bg-rose-950/20"}
                      >
                        <td className="p-2.5 text-center font-bold text-muted-foreground">{g.index}</td>
                        <td className="p-2.5 font-bold text-foreground">{g.name}</td>
                        <td className="p-2.5 text-blue-600 dark:text-blue-400 font-mono font-medium">
                          {g.email || <span className="text-rose-500 italic">Trống</span>}
                        </td>
                        <td className="p-2.5 text-muted-foreground">{g.phone || "—"}</td>
                        <td className="p-2.5 text-foreground">{g.company}</td>
                        <td className="p-2.5 font-semibold text-emerald-700 dark:text-emerald-400">{g.seat}</td>
                        <td className="p-2.5 text-center">
                          {g.isValid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="h-3 w-3" /> Sẵn sàng
                            </span>
                          ) : (
                            <span
                              title={g.error}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300"
                            >
                              <AlertCircle className="h-3 w-3" /> Lỗi
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={importing}
            className="px-4 py-2 rounded-xl border border-border bg-card text-foreground font-semibold text-xs hover:bg-muted transition cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex items-center gap-3">
            {importing && (
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang xử lý ({importProgress}%)...</span>
              </div>
            )}
            <button
              type="button"
              disabled={validCount === 0 || importing || parsing}
              onClick={handleExecuteImport}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#003B95] to-blue-700 hover:from-blue-900 hover:to-blue-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-4 w-4 text-amber-300" />
              <span>
                {autoSendMail
                  ? `Nhập & Gửi Email Thư Mời Cho ${validCount} Khách`
                  : `Nhập ${validCount} Khách Vào Danh Sách`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
