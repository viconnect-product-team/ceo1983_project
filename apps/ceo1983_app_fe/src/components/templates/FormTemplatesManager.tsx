import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Receipt,
  RotateCcw,
  Save,
  CheckCircle2,
  Sliders,
  Eye,
  Plus,
  Trash2,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchFormTemplates,
  saveFormTemplate,
  resetFormTemplates,
  DEFAULT_FORM_TEMPLATES,
} from "@/lib/form-templates";
import type {
  FormTemplatesCollection,
  FinanceReportTemplate,
  InvoiceTemplate,
  MemberFeeTemplate,
  ColumnFormatConfig,
} from "@/types/form-template.types";

export function FormTemplatesManager() {
  const [templates, setTemplates] = useState<FormTemplatesCollection>(DEFAULT_FORM_TEMPLATES);
  const [selectedCode, setSelectedCode] = useState<keyof FormTemplatesCollection>("FINANCE_REPORT_EXCEL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states for FINANCE_REPORT_EXCEL
  const [financeForm, setFinanceForm] = useState<FinanceReportTemplate>(
    DEFAULT_FORM_TEMPLATES.FINANCE_REPORT_EXCEL
  );

  // Form states for INVOICE_RECEIPT_PDF
  const [invoiceForm, setInvoiceForm] = useState<InvoiceTemplate>(
    DEFAULT_FORM_TEMPLATES.INVOICE_RECEIPT_PDF
  );

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await fetchFormTemplates();
      setTemplates(data);
      if (data.FINANCE_REPORT_EXCEL) setFinanceForm(data.FINANCE_REPORT_EXCEL);
      if (data.INVOICE_RECEIPT_PDF) setInvoiceForm(data.INVOICE_RECEIPT_PDF);
    } catch {
      toast.error("Không thể tải cấu hình biểu mẫu, sử dụng bộ mẫu mặc định");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFinance = async () => {
    setSaving(true);
    try {
      await saveFormTemplate("FINANCE_REPORT_EXCEL", financeForm);
      toast.success("Đã lưu định dạng Biểu mẫu Báo cáo Tài chính thành công! Khi xuất Excel tại trang Báo cáo Tài chính, hệ thống sẽ áp dụng ngay format này.");
    } catch {
      toast.error("Lỗi khi lưu biểu mẫu");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInvoice = async () => {
    setSaving(true);
    try {
      await saveFormTemplate("INVOICE_RECEIPT_PDF", invoiceForm);
      toast.success("Đã lưu định dạng Mẫu Hóa đơn & Phiếu thu thành công!");
    } catch {
      toast.error("Lỗi khi lưu biểu mẫu hóa đơn");
    } finally {
      setSaving(false);
    }
  };

  const handleResetAll = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn khôi phục toàn bộ định dạng biểu mẫu về tiêu chuẩn mặc định của CEO 1983 không?")) {
      return;
    }
    setSaving(true);
    try {
      await resetFormTemplates();
      setTemplates(DEFAULT_FORM_TEMPLATES);
      setFinanceForm(DEFAULT_FORM_TEMPLATES.FINANCE_REPORT_EXCEL);
      setInvoiceForm(DEFAULT_FORM_TEMPLATES.INVOICE_RECEIPT_PDF);
      toast.success("Đã khôi phục biểu mẫu về cấu hình mặc định!");
    } catch {
      toast.error("Lỗi khi khôi phục biểu mẫu");
    } finally {
      setSaving(false);
    }
  };

  // Cột thao tác cho Excel
  const toggleColumn = (idx: number) => {
    setFinanceForm((prev) => {
      const nextCols = [...prev.columns];
      nextCols[idx] = { ...nextCols[idx], enabled: !nextCols[idx].enabled };
      return { ...prev, columns: nextCols };
    });
  };

  const updateColumnLabel = (idx: number, label: string) => {
    setFinanceForm((prev) => {
      const nextCols = [...prev.columns];
      nextCols[idx] = { ...nextCols[idx], label };
      return { ...prev, columns: nextCols };
    });
  };

  const updateColumnWidth = (idx: number, width: number) => {
    setFinanceForm((prev) => {
      const nextCols = [...prev.columns];
      nextCols[idx] = { ...nextCols[idx], width };
      return { ...prev, columns: nextCols };
    });
  };

  // Người ký
  const updateSigner = (idx: number, val: string) => {
    setFinanceForm((prev) => {
      const signers = [...prev.signerTitles];
      signers[idx] = val;
      return { ...prev, signerTitles: signers };
    });
  };

  const addSigner = () => {
    setFinanceForm((prev) => ({
      ...prev,
      signerTitles: [...prev.signerTitles, "CHỨC DANH MỚI"],
    }));
  };

  const removeSigner = (idx: number) => {
    setFinanceForm((prev) => ({
      ...prev,
      signerTitles: prev.signerTitles.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Banner Giới Thiệu Chức Năng Biểu Mẫu */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 dark:border-blue-900/50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#003B95] text-white shadow-xs">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Thiết Lập Format Định Dạng Biểu Mẫu (Không Hardcode)
              </h2>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                Tất cả format định dạng tiêu đề, căn cứ thông tư Bộ Tài chính, cơ cấu cột Excel và chức danh ký duyệt tại chức năng <strong>Báo cáo Tài chính</strong>, <strong>Hóa đơn</strong>, <strong>Bảng kê thu phí</strong> sẽ được lấy động từ cấu hình dưới đây thay vì fix cứng trong mã nguồn.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetAll}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Mặc định</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Chọn Loại Biểu Mẫu */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setSelectedCode("FINANCE_REPORT_EXCEL")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            selectedCode === "FINANCE_REPORT_EXCEL"
              ? "bg-[#003B95] text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Mẫu Báo Cáo Tài Chính (Excel)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCode("INVOICE_RECEIPT_PDF")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            selectedCode === "INVOICE_RECEIPT_PDF"
              ? "bg-[#003B95] text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Mẫu Phiếu Thu & Hóa Đơn (PDF / In)</span>
        </button>
      </div>

      {/* NỘI DUNG 1: CẤU HÌNH BIỂU MẪU BÁO CÁO TÀI CHÍNH (EXCEL) */}
      {selectedCode === "FINANCE_REPORT_EXCEL" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái: Form điều chỉnh thông số format (7 cột) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Khối 1: Thông tin định danh & Căn cứ pháp lý */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Building2 className="h-4 w-4 text-[#003B95]" />
                  <span>1. Tiêu Đề Báo Cáo & Căn Cứ Ban Hành</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  Định dạng .XLSX
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tiêu đề chính báo cáo (Title) *
                  </label>
                  <input
                    type="text"
                    value={financeForm.title}
                    onChange={(e) => setFinanceForm({ ...financeForm, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003B95]"
                    placeholder="BÁO CÁO TỔNG HỢP KIỂM TOÁN TÀI CHÍNH"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tiêu đề phụ / Diễn giải hệ thống
                  </label>
                  <input
                    type="text"
                    value={financeForm.subtitle}
                    onChange={(e) => setFinanceForm({ ...financeForm, subtitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003B95]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Đơn vị ban hành (Organization)
                  </label>
                  <input
                    type="text"
                    value={financeForm.organization}
                    onChange={(e) => setFinanceForm({ ...financeForm, organization: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003B95]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Địa chỉ / Trụ sở
                  </label>
                  <input
                    type="text"
                    value={financeForm.address}
                    onChange={(e) => setFinanceForm({ ...financeForm, address: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003B95]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mã mẫu số chứng từ
                  </label>
                  <input
                    type="text"
                    value={financeForm.circularCode}
                    onChange={(e) => setFinanceForm({ ...financeForm, circularCode: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003B95]"
                    placeholder="Mẫu số S07-DN"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Căn cứ thông tư / Quyết định
                  </label>
                  <input
                    type="text"
                    value={financeForm.circularNote}
                    onChange={(e) => setFinanceForm({ ...financeForm, circularNote: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003B95]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Loại quỹ / Nguồn kinh phí
                  </label>
                  <input
                    type="text"
                    value={financeForm.fundType}
                    onChange={(e) => setFinanceForm({ ...financeForm, fundType: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003B95]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Đơn vị tiền tệ hạch toán
                  </label>
                  <input
                    type="text"
                    value={financeForm.currencyUnit}
                    onChange={(e) => setFinanceForm({ ...financeForm, currencyUnit: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003B95]"
                    placeholder="VNĐ"
                  />
                </div>
              </div>
            </div>

            {/* Khối 2: Cấu hình Bật / Tắt và Đổi Tên Cột Excel */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Sliders className="h-4 w-4 text-[#003B95]" />
                  <span>2. Cấu Hình Cột Bảng Excel (Bật / Tắt & Tiêu Đề Cột)</span>
                </div>
                <span className="text-xs text-slate-500">
                  {financeForm.columns.filter((c) => c.enabled).length}/{financeForm.columns.length} cột bật
                </span>
              </div>

              <div className="space-y-2.5">
                {financeForm.columns.map((col, idx) => (
                  <div
                    key={col.key}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition ${
                      col.enabled
                        ? "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                        : "bg-slate-100/40 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={col.enabled}
                        onChange={() => toggleColumn(idx)}
                        className="h-4 w-4 rounded text-[#003B95] focus:ring-[#003B95] cursor-pointer"
                        id={`col-${col.key}`}
                      />
                      <label htmlFor={`col-${col.key}`} className="text-xs font-mono text-slate-500 w-24 truncate">
                        {col.key}
                      </label>
                      <input
                        type="text"
                        value={col.label}
                        onChange={(e) => updateColumnLabel(idx, e.target.value)}
                        disabled={!col.enabled}
                        className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white disabled:opacity-50"
                        placeholder="Tiêu đề cột..."
                      />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] text-slate-400">Rộng:</span>
                      <input
                        type="number"
                        value={col.width}
                        onChange={(e) => updateColumnWidth(idx, Number(e.target.value) || 10)}
                        disabled={!col.enabled}
                        className="w-14 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1.5 py-1 text-xs text-center font-mono disabled:opacity-50"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Khối 3: Chức Danh Ký Duyệt */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <ShieldCheck className="h-4 w-4 text-[#003B95]" />
                  <span>3. Chức Danh Ký Duyệt Chân Trang</span>
                </div>
                <button
                  type="button"
                  onClick={addSigner}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#003B95] hover:underline cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Thêm người ký</span>
                </button>
              </div>

              <div className="space-y-2">
                {financeForm.signerTitles.map((title, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-6 text-center">#{idx + 1}</span>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => updateSigner(idx, e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white"
                    />
                    {financeForm.signerTitles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSigner(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                        title="Xóa người ký này"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Nút lưu cấu hình */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveFinance}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] px-5 py-2.5 text-xs font-bold text-white shadow-sm cursor-pointer transition"
              >
                <Save className="h-4 w-4" />
                <span>Lưu Format Biểu Mẫu Báo Cáo Tài Chính</span>
              </button>
            </div>
          </div>

          {/* Cột phải: Khung Mô Phỏng Xem Trước (Live Preview Excel) (5 cột) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  <Eye className="h-4 w-4 text-emerald-600" />
                  <span>Mô Phỏng Trực Quan File Excel Sẽ Xuất</span>
                </div>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 px-2 py-0.5 rounded font-mono">
                  Live Preview
                </span>
              </div>

              {/* Sheet Excel Mô Phỏng */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4 font-sans text-xs space-y-3 shadow-inner overflow-x-auto">
                {/* Header đơn vị */}
                <div className="flex justify-between items-start text-[11px] leading-tight text-slate-700 dark:text-slate-300">
                  <div>
                    <div className="font-bold uppercase">{financeForm.organization}</div>
                    <div className="text-[10px] text-slate-500">{financeForm.address}</div>
                  </div>
                  <div className="text-right text-[10px]">
                    <div className="font-bold">{financeForm.circularCode}</div>
                    <div className="text-slate-500 text-[9px] max-w-[180px]">{financeForm.circularNote}</div>
                  </div>
                </div>

                {/* Tiêu đề chính */}
                <div className="text-center pt-2 pb-1">
                  <div className="text-sm font-black text-[#003B95] uppercase tracking-wide">
                    {financeForm.title || "BÁO CÁO TÀI CHÍNH"}
                  </div>
                  <div className="text-[11px] text-slate-500 italic mt-0.5">{financeForm.subtitle}</div>
                  <div className="text-[10px] text-slate-600 mt-1 font-semibold">
                    Loại quỹ: {financeForm.fundType} | Đơn vị tính: {financeForm.currencyUnit}
                  </div>
                </div>

                {/* Bảng các cột được bật */}
                <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 text-[10px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#003B95] text-white">
                        {financeForm.columns
                          .filter((c) => c.enabled)
                          .map((col) => (
                            <th key={col.key} className="p-1.5 border-r border-blue-900 last:border-none font-bold">
                              {col.label}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                        {financeForm.columns
                          .filter((c) => c.enabled)
                          .map((col, i) => (
                            <td key={col.key} className="p-1.5 border-r border-slate-100 dark:border-slate-800 last:border-none">
                              {i === 0 ? "TX-2026-001" : i === 1 ? "17/11/2026" : "Dữ liệu mẫu..."}
                            </td>
                          ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Dòng tổng kết */}
                <div className="bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-lg space-y-1 text-[11px] font-bold text-slate-700 dark:text-slate-200">
                  <div className="flex justify-between">
                    <span>{financeForm.summaryLabels.totalIn}</span>
                    <span className="text-emerald-600 font-mono">150.000.000 đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{financeForm.summaryLabels.totalOut}</span>
                    <span className="text-rose-600 font-mono">45.000.000 đ</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-300 pt-1 text-slate-900 dark:text-white">
                    <span>{financeForm.summaryLabels.net}</span>
                    <span className="text-blue-600 font-mono">105.000.000 đ</span>
                  </div>
                </div>

                {/* Chân trang chữ ký */}
                <div className="grid grid-cols-3 gap-2 pt-3 text-center text-[10px]">
                  {financeForm.signerTitles.map((signer, idx) => (
                    <div key={idx} className="space-y-6">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{signer}</div>
                      <div className="text-[9px] text-slate-400 italic">(Ký, họ tên)</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center pt-2">
                <a
                  href="/finance-report"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003B95] hover:underline"
                >
                  <span>Chuyển tới Báo Cáo Tài Chính để xuất thử file</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NỘI DUNG 2: CẤU HÌNH BIỂU MẪU HÓA ĐƠN & PHIẾU THU (PDF / IN) */}
      {selectedCode === "INVOICE_RECEIPT_PDF" && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-6 max-w-4xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Receipt className="h-4 w-4 text-amber-500" />
              <span>Thiết Lập Mẫu Phiếu Thu Tiền & Hóa Đơn Điện Tử</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
              Định dạng PDF & In nhiệt
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tiêu đề phiếu thu / hóa đơn *
              </label>
              <input
                type="text"
                value={invoiceForm.invoiceTitle}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceTitle: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003B95]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tên tổ chức phát hành
              </label>
              <input
                type="text"
                value={invoiceForm.orgName}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, orgName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mã số thuế / Đăng ký kinh doanh
              </label>
              <input
                type="text"
                value={invoiceForm.taxCode}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, taxCode: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mẫu số hóa đơn (Form Number)
              </label>
              <input
                type="text"
                value={invoiceForm.invoiceFormNumber}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceFormNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ký hiệu hóa đơn (Serial)
              </label>
              <input
                type="text"
                value={invoiceForm.invoiceSerial}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceSerial: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ghi chú chân trang phiếu thu
              </label>
              <textarea
                rows={2}
                value={invoiceForm.footerNote}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, footerNote: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveInvoice}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] px-5 py-2.5 text-xs font-bold text-white shadow-sm cursor-pointer transition"
            >
              <Save className="h-4 w-4" />
              <span>Lưu Cấu Hình Mẫu Hóa Đơn & Phiếu Thu</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
