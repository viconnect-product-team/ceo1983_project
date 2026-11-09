import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  Building,
  Calendar,
  Clock,
  ArrowRight,
  ListTodo,
  Layers,
  ChevronRight,
  RefreshCw,
  Plus,
  Flame,
  ShieldCheck,
  Check,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { toast } from 'sonner';
import { fetchNestApi } from '@/lib/api-client';
import { createTask } from '../api';
import type { TaskItem, TaskPriority } from '../types';
import { TASK_DEPARTMENTS } from '../types';

interface AiTaskExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTasksCreated: () => void;
  initialDepartment?: string;
}

interface ExtractedTaskItem {
  id: string;
  selected: boolean;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  department: string;
  assignee: {
    id: string;
    name: string;
    role: string;
  };
  dueDate: string;
  deliverables?: string;
  subtasks: { id: string; title: string; completed: boolean }[];
}

export function AiTaskExtractorModal({
  isOpen,
  onClose,
  onTasksCreated,
  initialDepartment = 'Ban Điều Hành',
}: AiTaskExtractorModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [selectedDept, setSelectedDept] = useState<string>(initialDepartment || 'Ban Điều Hành');
  const [documentText, setDocumentText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<'excel' | 'word' | 'text' | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Analysis result states
  const [analysisResult, setAnalysisResult] = useState<{
    meetingSummary: string;
    suggestedSolutions: string[];
    department: string;
    assignedMembersCount: number;
    tasks: ExtractedTaskItem[];
  } | null>(null);

  if (!isOpen) return null;

  // Handle file drop / upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
  };

  const processUploadedFile = async (file: File) => {
    setIsReadingFile(true);
    setFileName(file.name);

    try {
      const lowerName = file.name.toLowerCase();

      // 1. File Excel (.xlsx, .xls, .csv)
      if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv')) {
        setFileType('excel');
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        let extracted = `TÊN TỆP EXCEL: ${file.name}\n\n`;

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
          extracted += `--- SHEET: ${sheetName} ---\n`;
          rows.forEach((row) => {
            if (row && row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== '')) {
              extracted += row.map((cell) => (cell !== null && cell !== undefined ? String(cell) : '')).join(' | ') + '\n';
            }
          });
          extracted += '\n';
        });

        setDocumentText(extracted);
        toast.success(`Đã đọc dữ liệu thành công từ file Excel: ${file.name}`);
      }
      // 2. File Word (.docx)
      else if (lowerName.endsWith('.docx')) {
        setFileType('word');
        const buffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(buffer);
        const docXmlFile = zip.file('word/document.xml');

        if (docXmlFile) {
          const xmlText = await docXmlFile.async('text');
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
          const paragraphs = xmlDoc.getElementsByTagName('w:p');
          const lines: string[] = [];

          for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs[i];
            const textNodes = p.getElementsByTagName('w:t');
            let pText = '';
            for (let j = 0; j < textNodes.length; j++) {
              pText += textNodes[j].textContent || '';
            }
            if (pText.trim()) {
              lines.push(pText.trim());
            }
          }

          const extracted = `TÊN VĂN BẢN WORD: ${file.name}\n\n` + lines.join('\n');
          setDocumentText(extracted);
          toast.success(`Đã bóc tách nội dung thành công từ file Word: ${file.name}`);
        } else {
          throw new Error('Không tìm thấy cấu trúc văn bản document.xml trong file .docx');
        }
      }
      // 3. Text file (.txt)
      else {
        setFileType('text');
        const text = await file.text();
        setDocumentText(text);
        toast.success(`Đã đọc nội dung file văn bản: ${file.name}`);
      }
    } catch (err: any) {
      console.error('Lỗi đọc file:', err);
      toast.error(`Không thể đọc file: ${err.message || 'Định dạng file không hỗ trợ'}`);
    } finally {
      setIsReadingFile(false);
    }
  };

  // Run AI Task Extraction
  const handleAnalyze = async () => {
    if (!documentText.trim()) {
      toast.error('Vui lòng tải lên file hoặc nhập nội dung báo cáo cuộc họp trước khi phân tích!');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetchNestApi<any>('/ai/extract-tasks-from-document', {
        method: 'POST',
        body: JSON.stringify({
          documentText,
          fileName,
          department: selectedDept,
          customPrompt,
        }),
      });

      const data = res?.data || res;
      if (data && Array.isArray(data.extractedTasks)) {
        const tasksWithSelection: ExtractedTaskItem[] = data.extractedTasks.map((t: any, idx: number) => ({
          id: `ai-item-${Date.now()}-${idx}`,
          selected: true,
          title: t.title,
          description: t.description || '',
          priority: t.priority || 'MEDIUM',
          department: t.department || selectedDept,
          assignee: t.assignee || { id: `m-${idx}`, name: 'Thành viên Ban', role: 'Phụ trách' },
          dueDate: t.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          deliverables: t.deliverables || '',
          subtasks: Array.isArray(t.subtasks)
            ? t.subtasks.map((st: any, sIdx: number) => ({
                id: `st-${Date.now()}-${sIdx}`,
                title: typeof st === 'string' ? st : st.title,
                completed: false,
              }))
            : [],
        }));

        setAnalysisResult({
          meetingSummary: data.meetingSummary || 'Phân tích báo cáo cuộc họp thành công.',
          suggestedSolutions: data.suggestedSolutions || [],
          department: data.department || selectedDept,
          assignedMembersCount: data.assignedMembersCount || 1,
          tasks: tasksWithSelection,
        });

        toast.success(`🎉 AI đã phân tích thành công và bóc tách được ${tasksWithSelection.length} công việc!`);
      } else {
        throw new Error('Dữ liệu trả về từ AI không đúng định dạng');
      }
    } catch (err: any) {
      console.error('AI Extraction Error:', err);
      toast.error(`Lỗi phân tích AI: ${err.message || 'Không thể kết nối đến máy chủ AI'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toggle selection of a task
  const toggleTaskSelection = (id: string) => {
    if (!analysisResult) return;
    setAnalysisResult({
      ...analysisResult,
      tasks: analysisResult.tasks.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t)),
    });
  };

  const toggleSelectAll = () => {
    if (!analysisResult) return;
    const allSelected = analysisResult.tasks.every((t) => t.selected);
    setAnalysisResult({
      ...analysisResult,
      tasks: analysisResult.tasks.map((t) => ({ ...t, selected: !allSelected })),
    });
  };

  // Update a single task in review
  const updateTaskField = (id: string, field: keyof ExtractedTaskItem, value: any) => {
    if (!analysisResult) return;
    setAnalysisResult({
      ...analysisResult,
      tasks: analysisResult.tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    });
  };

  // Submit and create all selected tasks
  const handleCreateSelectedTasks = async () => {
    if (!analysisResult) return;
    const selected = analysisResult.tasks.filter((t) => t.selected);

    if (selected.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 công việc để tạo!');
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;

    try {
      for (const t of selected) {
        await createTask({
          title: t.title,
          description: t.description,
          priority: t.priority as TaskPriority,
          department: t.department,
          assignee: t.assignee,
          dueDate: t.dueDate,
          deliverables: t.deliverables,
          subtasks: t.subtasks,
          status: 'TODO',
          progress: 0,
        });
        successCount++;
      }

      toast.success(`🎉 Đã tạo thành công ${successCount} công việc mới và phân bổ cho ${analysisResult.department}!`);
      onTasksCreated();
      onClose();
    } catch (err: any) {
      console.error('Error creating tasks:', err);
      toast.error(`Có lỗi xảy ra: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCount = analysisResult?.tasks.filter((t) => t.selected).length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-900 via-[#003B95] to-indigo-900 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-amber-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                Trợ Lý AI Bóc Tách Task Từ Báo Cáo Cuộc Họp
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-extrabold tracking-wide uppercase">
                  Super AI
                </span>
              </h2>
              <p className="text-xs text-blue-100 opacity-90">
                Tự động phân tích biên bản Word, Excel, gợi ý giải pháp và chia task cho từng người trong Ban
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: Input source */}
          {!analysisResult && (
            <div className="space-y-5">
              {/* Select Department */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#003B95] dark:text-blue-400" />
                  1. Chọn Ban Chuyên Trách Nhận Công Việc (Call API Phân Bổ Nhân Sự):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {TASK_DEPARTMENTS.map((dept) => {
                    const isSelected = selectedDept === dept;
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => setSelectedDept(dept)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition text-left cursor-pointer ${
                          isSelected
                            ? 'bg-[#003B95] text-white border-[#003B95] shadow-sm font-bold ring-2 ring-blue-300 dark:ring-blue-600'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                        }`}
                      >
                        <span className="truncate">{dept}</span>
                        {isSelected && <Check className="w-4 h-4 text-white flex-shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#003B95] dark:text-blue-400" />
                  2. Tải Lên File Báo Cáo Ý Kiến Họp (.xlsx, .xls, .docx, .txt):
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx,.xls,.csv,.docx,.doc,.txt"
                  className="hidden"
                />

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                    fileName
                      ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-slate-300 dark:border-slate-700 hover:border-[#003B95] bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shadow-xs">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div className="p-3 rounded-2xl bg-blue-100 text-[#003B95] dark:bg-blue-950 dark:text-blue-300 shadow-xs">
                      <FileText className="w-6 h-6" />
                    </div>
                  </div>

                  {fileName ? (
                    <div>
                      <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {fileName}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Nhấn vào đây để tải lên tệp khác hoặc chỉnh sửa văn bản bên dưới
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Kéo thả file Báo cáo tổng hợp ý kiến họp hoặc click để chọn file
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Hỗ trợ định dạng Excel (.xlsx, .xls, .csv), Word (.docx) và file văn bản (.txt)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Text Preview / Manual Paste */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#003B95] dark:text-blue-400" />
                    3. Nội Dung Văn Bản Báo Cáo (Xem trước / Có thể dán trực tiếp):
                  </span>
                  {documentText && (
                    <span className="text-[11px] font-mono text-slate-500">
                      {documentText.length} ký tự
                    </span>
                  )}
                </label>
                <textarea
                  rows={7}
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  placeholder="Dán nội dung biên bản cuộc họp, ý kiến kết luận của Chủ tịch/Tổng thư ký hoặc nội dung file báo cáo vào đây..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#003B95]"
                />
              </div>

              {/* Custom Guidance Prompt for AI */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Yêu Cầu Bổ Sung Cho AI (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="VD: Ưu tiên bóc tách các đầu việc gấp trước ngày 20/11, giao việc nòng cốt cho Tổng Thư Ký..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#003B95]"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Analysis Results & Task Review */}
          {analysisResult && (
            <div className="space-y-6">
              {/* Back to input / re-analyze bar */}
              <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Ban được gán:</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#003B95] text-white font-bold text-[11px]">
                    {analysisResult.department}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Phân công cho {analysisResult.assignedMembersCount} nhân sự
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAnalysisResult(null)}
                  className="text-xs text-[#003B95] dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Tải file khác / Phân tích lại
                </button>
              </div>

              {/* AI Strategic Analysis Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-blue-500/10 to-indigo-500/10 border border-amber-300/40 dark:border-amber-700/40 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>Phân Tích Bối Cảnh & Đề Xuất Giải Pháp Của Trợ Lý AI:</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                  {analysisResult.meetingSummary}
                </p>

                {analysisResult.suggestedSolutions.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-amber-200/50 dark:border-amber-800/50">
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Gợi Ý Giải Pháp Thực Thi Cấp Thiết:
                    </p>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {analysisResult.suggestedSolutions.map((sol, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{sol}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-[#003B95] dark:text-blue-400" />
                    Danh Sách Công Việc Được AI Bóc Tách & Chia Người ({analysisResult.tasks.length} việc)
                  </h3>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-xs text-[#003B95] dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    {analysisResult.tasks.every((t) => t.selected) ? 'Bỏ chọn tất cả' : 'Chọn tất cả việc'}
                  </button>
                </div>

                <div className="space-y-3">
                  {analysisResult.tasks.map((task, idx) => {
                    const isCrit = task.priority === 'CRITICAL';
                    const isHigh = task.priority === 'HIGH';

                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-xl border transition-all ${
                          task.selected
                            ? 'border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-900 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-70'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={task.selected}
                            onChange={() => toggleTaskSelection(task.id)}
                            className="mt-1 w-4 h-4 rounded text-[#003B95] focus:ring-blue-500 cursor-pointer"
                          />

                          {/* Task details */}
                          <div className="flex-1 space-y-2.5 min-w-0">
                            {/* Title & Priority */}
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <input
                                type="text"
                                value={task.title}
                                onChange={(e) => updateTaskField(task.id, 'title', e.target.value)}
                                className="font-bold text-sm text-slate-900 dark:text-slate-100 flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#003B95] focus:outline-hidden"
                              />

                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                    isCrit
                                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                      : isHigh
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                      : 'bg-blue-100 text-[#003B95] dark:bg-blue-950 dark:text-blue-300'
                                  }`}
                                >
                                  {isCrit && <Flame className="w-2.5 h-2.5" />}
                                  {task.priority}
                                </span>
                              </div>
                            </div>

                            {/* Description */}
                            <textarea
                              rows={2}
                              value={task.description}
                              onChange={(e) => updateTaskField(task.id, 'description', e.target.value)}
                              className="w-full text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200 dark:border-slate-700/60 focus:outline-hidden"
                            />

                            {/* Assignee & Due Date Row */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                              {/* Assignee Badge */}
                              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900">
                                <Users className="w-3.5 h-3.5 text-[#003B95] dark:text-blue-400" />
                                <span className="text-slate-500 font-medium">Người phụ trách:</span>
                                <span className="font-bold text-[#003B95] dark:text-blue-300">
                                  {task.assignee.name}
                                </span>
                                <span className="text-[10px] text-slate-400">({task.assignee.role})</span>
                              </div>

                              {/* Due Date */}
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-slate-500 font-medium">Hạn hoàn thành:</span>
                                <input
                                  type="date"
                                  value={task.dueDate}
                                  onChange={(e) => updateTaskField(task.id, 'dueDate', e.target.value)}
                                  className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden"
                                />
                              </div>
                            </div>

                            {/* Subtasks summary */}
                            {task.subtasks.length > 0 && (
                              <div className="text-[11px] text-slate-500 bg-slate-100/70 dark:bg-slate-800/40 p-2 rounded-lg">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {task.subtasks.length} bước triển khai con:
                                </span>{' '}
                                {task.subtasks.map((s) => s.title).join(' • ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between flex-shrink-0 flex-wrap gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            Đóng
          </button>

          {!analysisResult ? (
            <button
              type="button"
              disabled={isAnalyzing || isReadingFile || !documentText.trim()}
              onClick={handleAnalyze}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 shadow-md cursor-pointer ${
                isAnalyzing || isReadingFile || !documentText.trim()
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#003B95] to-blue-700 hover:opacity-90'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI Đang Phân Tích & Bóc Tách Task...</span>
                </>
              ) : isReadingFile ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang Đọc File...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Bắt Đầu Phân Tích AI & Bóc Tách Task</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSubmitting || selectedCount === 0}
                onClick={handleCreateSelectedTasks}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 shadow-md cursor-pointer ${
                  isSubmitting || selectedCount === 0
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang Tạo Công Việc...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tạo Hàng Loạt ({selectedCount}) Công Việc Vào Hệ Thống</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
