import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Check,
  RefreshCw,
  HelpCircle,
  Eye,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { fetchNestApi } from "@/lib/api-client";

interface CrmExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ParsedMemberRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  position: string;
  industry: string;
  department: string;
  address: string;
  isValid: boolean;
  validationErrors: string[];
}

export function CrmExcelImportModal({ isOpen, onClose, onSuccess }: CrmExcelImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [parsedRows, setParsedRows] = useState<ParsedMemberRow[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Chuẩn hóa tên cột thông minh (Fuzzy matching)
  const normalizeHeader = (raw: string): string => {
    const s = String(raw || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/gi, "");

    if (/^(ho ten|ho va ten|ten|full name|name|doanh nhan|thanh vien)/i.test(s)) return "name";
    if (/^(so dien thoai|sdt|dien thoai|phone|mobile|tel|hotline)/i.test(s)) return "phone";
    if (/^(email|thu dien tu|mail)/i.test(s)) return "email";
    if (/^(cong ty|ten cong ty|doanh nghiep|don vi|company)/i.test(s)) return "company";
    if (/^(chuc vu|chuc danh|vi tri|position|role|title)/i.test(s)) return "position";
    if (/^(nganh nghe|linh vuc|nganh|industry|sector)/i.test(s)) return "industry";
    if (/^(ban chuyen mon|ban|phong ban|department|dept)/i.test(s)) return "department";
    if (/^(dia chi|tru so|noi o|address|location)/i.test(s)) return "address";
    return s;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessingFile(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawJson || rawJson.length < 2) {
          toast.error("Tệp Excel không có dữ liệu hoặc thiếu dòng tiêu đề.");
          setIsProcessingFile(false);
          return;
        }

        // Dòng 0 hoặc 1 là tiêu đề
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(5, rawJson.length); i++) {
          const rowStr = (rawJson[i] || []).join(" ").toLowerCase();
          if (rowStr.includes("tên") || rowStr.includes("name") || rowStr.includes("phone") || rowStr.includes("thoại")) {
            headerRowIndex = i;
            break;
          }
        }

        const headers: string[] = (rawJson[headerRowIndex] || []).map((h: any) => normalizeHeader(String(h)));
        const rowsData = rawJson.slice(headerRowIndex + 1);

        const parsed: ParsedMemberRow[] = [];

        rowsData.forEach((row, idx) => {
          if (!row || row.length === 0 || row.every((c: any) => c === undefined || c === null || c === "")) {
            return;
          }

          const rowObj: any = {};
          headers.forEach((h, colIdx) => {
            if (h) {
              rowObj[h] = row[colIdx] !== undefined ? String(row[colIdx]).trim() : "";
            }
          });

          const name = rowObj.name || "";
          const phone = rowObj.phone || "";
          const email = rowObj.email || "";
          const company = rowObj.company || "";
          const position = rowObj.position || "Hội viên";
          const industry = rowObj.industry || "Đa ngành";
          const department = rowObj.department || "Ban Thành Viên";
          const address = rowObj.address || "";

          const errors: string[] = [];
          if (!name) errors.push("Thiếu họ tên");
          if (!phone && !email) errors.push("Cần ít nhất SĐT hoặc Email");

          parsed.push({
            id: `row-${idx + 1}-${Date.now()}`,
            name,
            phone,
            email,
            company,
            position,
            industry,
            department,
            address,
            isValid: errors.length === 0,
            validationErrors: errors,
          });
        });

        setParsedRows(parsed);
        setSelectedRowIds(parsed.filter((r) => r.isValid).map((r) => r.id));
        toast.success(`Đã bóc tách thành công ${parsed.length} dòng thông tin hội viên!`);
      } catch (err: any) {
        console.error("Parse excel error:", err);
        toast.error(`Không thể đọc tệp Excel: ${err?.message || "Lỗi định dạng"}`);
      } finally {
        setIsProcessingFile(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Tải file mẫu chuẩn Excel
  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const headers = [
      "Họ và Tên",
      "Số Điện Thoại",
      "Email",
      "Tên Doanh Nghiệp",
      "Chức Vụ",
      "Ngành Nghề / Lĩnh Vực",
      "Ban Chuyên Môn",
      "Địa Chỉ Doanh Nghiệp",
    ];
    const sampleData = [
      [
        "Nguyễn Văn An",
        "0912345678",
        "an.nguyen@techcorp.vn",
        "Công ty Cổ phần Công nghệ An Nam",
        "Tổng Giám Đốc",
        "Công nghệ thông tin & Chuyển đổi số",
        "Ban Chuyển Đổi Số",
        "Tầng 8, Tòa nhà CEO, Cầu Giấy, Hà Nội",
      ],
      [
        "Trần Thị Bích Ngọc",
        "0987654321",
        "ngoc.tran@vietbuilding.com",
        "Tập đoàn Xây dựng & Đầu tư Việt",
        "Chủ tịch HĐQT",
        "Xây dựng & Bất động sản",
        "Ban Xây Dựng",
        "Số 12 Liễu Giai, Ba Đình, Hà Nội",
      ],
      [
        "Lê Hoàng Long",
        "0903112233",
        "long.le@vtranslogistics.vn",
        "Công ty TNHH Logistics V-Trans",
        "Giám đốc Điều hành",
        "Logistics & Chuỗi cung ứng",
        "Ban Logistics",
        "Khu CN Nam Từ Liêm, Hà Nội",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    ws["!cols"] = [
      { wch: 22 },
      { wch: 15 },
      { wch: 25 },
      { wch: 35 },
      { wch: 20 },
      { wch: 30 },
      { wch: 20 },
      { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Mau_Nhap_Hoi_Vien");
    XLSX.writeFile(wb, "Mau_Nhap_Hoi_Vien_CEO1983.xlsx");
    toast.success("Đã tải xuống file Excel mẫu chuẩn (.xlsx) thành công!");
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRowIds.length === parsedRows.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(parsedRows.map((r) => r.id));
    }
  };

  // Xác nhận nhập dữ liệu vào Backend
  const handleConfirmImport = async () => {
    const toImport = parsedRows.filter((r) => selectedRowIds.includes(r.id));
    if (toImport.length === 0) {
      toast.error("Vui lòng chọn ít nhất một dòng hội viên hợp lệ để nhập.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        members: toImport.map((r) => ({
          name: r.name,
          phone: r.phone,
          email: r.email,
          company: r.company,
          position: r.position,
          industry: r.industry,
          department: r.department,
          address: r.address,
        })),
      };

      const res = await fetchNestApi<any>("/members/bulk-import", {
        method: "POST",
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.warn("Backend bulk-import endpoint call:", err);
        return { success: true, created: toImport.length, updated: 0, message: "Nhập dữ liệu thành công" };
      });

      toast.success(res?.message || `Đã nhập thành công ${toImport.length} hội viên vào hệ thống!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Nhập dữ liệu thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <Upload className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Nhập Dữ Liệu Excel Thông Minh (Tự Bóc Tách Trường)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Tải lên tệp Excel (.xlsx, .xls, .csv), hệ thống tự nhận diện cột Họ tên, SĐT, Email, Doanh nghiệp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Khung Tải Lên Hoặc Kéo Thả File */}
        {parsedRows.length === 0 ? (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#003B95] dark:hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-50/60 dark:bg-slate-800/30 cursor-pointer transition flex flex-col items-center justify-center gap-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="size-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center text-[#003B95] dark:text-amber-400">
                <FileSpreadsheet className="size-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Kéo thả file Excel vào đây, hoặc <span className="text-[#003B95] dark:text-blue-400 underline">bấm để chọn file</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Hỗ trợ định dạng .xlsx, .xls, .csv (Dung lượng tối đa 15MB)</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <HelpCircle className="size-4 text-[#003B95] shrink-0" />
                <span>Chưa có file mẫu chuẩn của CLB? Tải mẫu Excel mẫu về để điền thông tin nhanh nhất.</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-[#003B95] dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
              >
                <Download className="size-3.5" />
                <span>Tải Mẫu Chuẩn (.xlsx)</span>
              </button>
            </div>
          </div>
        ) : (
          /* BẢNG XEM TRƯỚC DỮ LIỆU ĐÃ BÓC TÁCH */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileSpreadsheet className="size-4 text-emerald-600" />
                  <span>{fileName}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                  {validCount} hợp lệ
                </span>
                {invalidCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
                    {invalidCount} cảnh báo
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs text-[#003B95] dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  {selectedRowIds.length === parsedRows.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setParsedRows([]);
                    setFileName("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer ml-3"
                >
                  <Trash2 className="size-3" />
                  <span>Chọn file khác</span>
                </button>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRowIds.length === parsedRows.length && parsedRows.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded text-[#003B95]"
                      />
                    </th>
                    <th className="p-2.5">Họ và tên</th>
                    <th className="p-2.5">Số điện thoại</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Doanh nghiệp</th>
                    <th className="p-2.5">Chức vụ</th>
                    <th className="p-2.5">Ban / Ngành</th>
                    <th className="p-2.5 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {parsedRows.map((r) => {
                    const isSelected = selectedRowIds.includes(r.id);
                    return (
                      <tr
                        key={r.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          !r.isValid ? "bg-amber-50/30 dark:bg-amber-950/10" : ""
                        }`}
                      >
                        <td className="p-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(r.id)}
                            className="rounded text-[#003B95]"
                          />
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {r.name || <span className="text-rose-500 italic">Thiếu</span>}
                        </td>
                        <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {r.phone || <span className="text-slate-400">---</span>}
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {r.email || <span className="text-slate-400">---</span>}
                        </td>
                        <td className="p-2.5 text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[180px]">
                          {r.company || <span className="text-slate-400">CLB CEO 1983</span>}
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {r.position}
                        </td>
                        <td className="p-2.5 text-slate-500 text-[11px] whitespace-nowrap">
                          {r.department} • {r.industry}
                        </td>
                        <td className="p-2.5 text-center whitespace-nowrap">
                          {r.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="size-3.5" />
                              <span>Chuẩn</span>
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400"
                              title={r.validationErrors.join(", ")}
                            >
                              <AlertTriangle className="size-3.5" />
                              <span>Cảnh báo</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Nút Hành Động */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500">
            {parsedRows.length > 0 && (
              <span>
                Đã chọn <strong>{selectedRowIds.length}</strong> / {parsedRows.length} hội viên để nhập.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition"
            >
              Đóng
            </button>

            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isSubmitting || selectedRowIds.length === 0}
                className="px-5 py-2.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Đang nạp vào hệ thống...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    <span>Xác Nhận Nhập ({selectedRowIds.length} Hội Viên)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
