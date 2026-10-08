import React, { useState, useRef } from 'react';
import {
  X,
  Calendar,
  Building,
  MessageSquare,
  Send,
  History,
  Edit2,
  Trash2,
  Flame,
  Check,
  Target,
  Video,
  ExternalLink,
  Copy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  Bell,
  RotateCcw,
  Sparkles,
  ArrowRight,
  UserCheck,
  ThumbsUp,
  AlertTriangle,
  FileSpreadsheet,
  Upload,
  Download,
  Paperclip,
  FileText,
  File,
  Eye,
  Award,
  TrendingUp,
  Shield,
  User,
  Plus,
} from 'lucide-react';
import type { TaskItem, TaskStatus, TaskAttachment, TaskProgressEvaluation } from '../types';
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG, MEETING_PLATFORMS } from '../types';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/use-role';
import {
  acceptTask,
  declineTask,
  submitTaskReview,
  evaluateTaskProgress,
  approveTask,
  requestTaskRework,
  remindTask,
  uploadTaskAttachment,
  deleteTaskAttachment,
} from '../api';
import { ExcelViewerModal } from './ExcelViewerModal';

interface TaskDetailDrawerProps {
  task: TaskItem | null;
  open: boolean;
  onClose: () => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
  onProgressChange: (taskId: string, progress: number) => Promise<void>;
  onToggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  onAddComment: (taskId: string, content: string) => Promise<void>;
  onTaskUpdated?: (updatedTask: TaskItem) => void;
}

export function TaskDetailDrawer({
  task,
  open,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onProgressChange,
  onToggleSubtask,
  onAddComment,
  onTaskUpdated,
}: TaskDetailDrawerProps) {
  const { user } = useAuth();
  const { isAdmin, isBQT, isPlatformAdmin } = useRole();

  const [activeTab, setActiveTab] = useState<'details' | 'attachments' | 'comments' | 'history'>('details');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Delegation Action Dialog states
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewDeliverables, setReviewDeliverables] = useState('');
  const [reviewNote, setReviewNote] = useState('');

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveRating, setApproveRating] = useState<number>(5);
  const [approveFeedback, setApproveFeedback] = useState('');

  const [reworkDialogOpen, setReworkDialogOpen] = useState(false);
  const [reworkReason, setReworkReason] = useState('');

  // Progress Evaluation Dialog states
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const [evalRating, setEvalRating] = useState<number>(5);
  const [evalAssessment, setEvalAssessment] = useState<'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'AHEAD'>('ON_TRACK');
  const [evalFeedback, setEvalFeedback] = useState('');

  // Excel In-App Viewer Modal states
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [previewFileName, setPreviewFileName] = useState('');
  const [previewFileUrl, setPreviewFileUrl] = useState('');

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadIsDeliverable, setUploadIsDeliverable] = useState(false);

  if (!open || !task) return null;

  // Current User Identification
  const currentUserName = user?.name || user?.user_metadata?.full_name || user?.username || 'Hội viên';
  const currentUserId = user?.id || '';
  const currentUserEmail = user?.email || '';

  // Permission & Role Checks
  const isManager = isAdmin || isBQT || isPlatformAdmin;

  const isTaskSupervisor =
    isManager ||
    Boolean(task.supervisor?.id && task.supervisor.id === currentUserId) ||
    Boolean(task.supervisor?.name && currentUserName && task.supervisor.name.toLowerCase() === currentUserName.toLowerCase());

  const isTaskAssignee =
    Boolean(task.assignee?.id && task.assignee.id === currentUserId) ||
    Boolean(task.assignee?.email && currentUserEmail && task.assignee.email.toLowerCase() === currentUserEmail.toLowerCase()) ||
    Boolean(task.assignee?.name && currentUserName && task.assignee.name.toLowerCase() === currentUserName.toLowerCase());

  const isTaskCollaborator = Boolean(
    task.collaborators?.some(
      (c) => c.id === currentUserId || (c.name && c.name.toLowerCase() === currentUserName.toLowerCase())
    )
  );

  const canSupervise = isTaskSupervisor || isManager;
  const canExecute = isTaskAssignee || (isTaskCollaborator && !canSupervise);
  const isReadOnly = !canSupervise && !canExecute;

  const priorityInfo = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.MEDIUM;

  const isExcelFile = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext === 'xlsx' || ext === 'xls' || ext === 'csv';
  };

  const handleOpenExcel = (name: string, url: string) => {
    setPreviewFileName(name);
    setPreviewFileUrl(url);
    setExcelModalOpen(true);
  };

  const handleDownloadFile = (name: string, url: string) => {
    if (url && url.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
    } else if (url && url !== '#') {
      window.open(url, '_blank');
    } else {
      toast.info(`Đang mở tải file "${name}"`);
    }
  };

  const triggerUploadPicker = (isDeliverable: boolean) => {
    setUploadIsDeliverable(isDeliverable);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error('Dung lượng file tối đa là 25MB');
      return;
    }

    setActionLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const sizeFormatted =
            file.size > 1024 * 1024
              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
              : `${Math.round(file.size / 1024)} KB`;

          const updated = await uploadTaskAttachment(task.id, {
            name: file.name,
            url: dataUrl,
            size: sizeFormatted,
            type: file.type || 'application/octet-stream',
            isDeliverable: uploadIsDeliverable,
            actorName: currentUserName,
          });

          toast.success(
            uploadIsDeliverable
              ? `Đã nộp thành công file kết quả "${file.name}"!`
              : `Đã đính kèm tài liệu "${file.name}"!`
          );
          onTaskUpdated?.(updated);
        } catch (err: any) {
          toast.error(err?.message || 'Lỗi khi lưu file đính kèm');
        } finally {
          setActionLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi đọc file');
      setActionLoading(false);
    }
  };

  const handleDeleteAttachment = async (idx: number, attName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa file "${attName}"?`)) return;
    setActionLoading(true);
    try {
      const updated = await deleteTaskAttachment(task.id, idx, currentUserName);
      toast.success('Đã xóa file thành công');
      onTaskUpdated?.(updated);
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi xóa file đính kèm');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await onAddComment(task.id, commentText.trim());
      setCommentText('');
    } finally {
      setSubmittingComment(false);
    }
  };

  // 1. Tiếp nhận nhiệm vụ
  const handleAccept = async () => {
    setActionLoading(true);
    try {
      const updated = await acceptTask(task.id, currentUserName);
      toast.success('Đã tiếp nhận công việc thành công!');
      onTaskUpdated?.(updated);
      await onStatusChange(task.id, 'IN_PROGRESS');
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi tiếp nhận công việc');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Từ chối tiếp nhận
  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    setActionLoading(true);
    try {
      const updated = await declineTask(task.id, declineReason.trim(), currentUserName);
      toast.success('Đã gửi phản hồi từ chối tiếp nhận công việc');
      setDeclineDialogOpen(false);
      setDeclineReason('');
      onTaskUpdated?.(updated);
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi từ chối công việc');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Gửi báo cáo nghiệm thu
  const handleSubmitReview = async () => {
    setActionLoading(true);
    try {
      const updated = await submitTaskReview(task.id, {
        deliverables: reviewDeliverables.trim() || undefined,
        note: reviewNote.trim() || undefined,
        actorName: currentUserName,
      });
      toast.success('Đã nộp báo cáo nghiệm thu hoàn thành!');
      setReviewDialogOpen(false);
      onTaskUpdated?.(updated);
      await onStatusChange(task.id, 'REVIEW');
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi nộp nghiệm thu');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Đánh giá tiến độ (Progress Evaluation)
  const handleEvaluateProgress = async () => {
    if (!evalFeedback.trim()) {
      toast.error('Vui lòng nhập nhận xét / đánh giá tiến độ');
      return;
    }
    setActionLoading(true);
    try {
      const updated = await evaluateTaskProgress(task.id, {
        rating: evalRating,
        statusAssessment: evalAssessment,
        feedback: evalFeedback.trim(),
        actorName: currentUserName,
      });
      toast.success('Đã ghi nhận đánh giá tiến độ thành công!');
      setEvaluationDialogOpen(false);
      setEvalFeedback('');
      onTaskUpdated?.(updated);
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi ghi nhận đánh giá');
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Phê duyệt hoàn thành (1-5 sao)
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const updated = await approveTask(task.id, {
        rating: approveRating,
        feedback: approveFeedback.trim() || 'Nghiệm thu đạt chuẩn yêu cầu',
        actorName: currentUserName,
      });
      toast.success(`Đã nghiệm thu và phê duyệt hoàn thành (${approveRating}★)!`);
      setApproveDialogOpen(false);
      onTaskUpdated?.(updated);
      await onStatusChange(task.id, 'DONE');
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi phê duyệt');
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Yêu cầu làm lại / Chỉnh sửa
  const handleRequestRework = async () => {
    if (!reworkReason.trim()) {
      toast.error('Vui lòng nhập yêu cầu chỉnh sửa');
      return;
    }
    setActionLoading(true);
    try {
      const updated = await requestTaskRework(task.id, reworkReason.trim(), currentUserName);
      toast.success('Đã gửi yêu cầu chỉnh sửa lại công việc');
      setReworkDialogOpen(false);
      setReworkReason('');
      onTaskUpdated?.(updated);
      await onStatusChange(task.id, 'IN_PROGRESS');
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi gửi yêu cầu làm lại');
    } finally {
      setActionLoading(false);
    }
  };

  // 7. Nhắc nhở hạn chót & đôn đốc tiến độ
  const handleRemind = async () => {
    setActionLoading(true);
    try {
      const updated = await remindTask(task.id, currentUserName);
      toast.success('Đã gửi thông báo nhắc nhở hạn chót & đôn đốc tiến độ!');
      onTaskUpdated?.(updated);
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi gửi nhắc nhở');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        
        {/* Hidden File Input for Deliverables & Attachments */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
        />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#003B95] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900">
              {task.code}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold border ${priorityInfo.badge}`}
            >
              {task.priority === 'CRITICAL' && <Flame className="w-3 h-3 text-rose-500" />}
              {priorityInfo.label}
            </span>

            {/* Current User Role Badge */}
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-slate-200/70 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200">
              {canSupervise ? (
                <>
                  <Shield className="w-3 h-3 text-[#003B95]" />
                  <span>Người giao việc / Giám sát</span>
                </>
              ) : canExecute ? (
                <>
                  <User className="w-3 h-3 text-emerald-600" />
                  <span>Người phụ trách</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span>Quan sát (Chỉ xem)</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Sửa và Xóa: CHỈ HIỂN THỊ VỚI NGƯỜI GIAO VIỆC / BQT */}
            {canSupervise && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-[#003B95] transition cursor-pointer"
                  title="Chỉnh sửa công việc"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này không?')) {
                      onDelete(task.id);
                      onClose();
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition cursor-pointer"
                  title="Xóa công việc"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-600 transition ml-1 cursor-pointer"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KHỐI QUY TRÌNH GIAO VIỆC & THAO TÁC NGHIỆM THU */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#003B95]" />
              Quy trình giao việc &amp; Nghiệm thu
            </div>
            {/* Nhắn tin trao đổi công việc (CRM Messaging Link) */}
            <a
              href={`/network?peerName=${encodeURIComponent(task.assignee?.name || '')}&taskContext=${encodeURIComponent(task.code + ': ' + task.title)}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-300 font-bold text-[11px] border border-blue-200 hover:bg-blue-100 transition shadow-2xs"
              title="Nhắn tin trao đổi công việc này trực tiếp qua CRM Chat"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Trao đổi qua Chat</span>
            </a>
          </div>

          {/* Stepper lifecycle */}
          <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
            <div
              className={`p-1.5 rounded-lg font-semibold border ${
                task.status === 'TODO'
                  ? 'bg-blue-100 border-blue-300 text-[#003B95] dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              1. Giao việc
            </div>
            <div
              className={`p-1.5 rounded-lg font-semibold border ${
                task.status === 'IN_PROGRESS'
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              2. Đang làm
            </div>
            <div
              className={`p-1.5 rounded-lg font-semibold border ${
                task.status === 'REVIEW'
                  ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              3. Nghiệm thu
            </div>
            <div
              className={`p-1.5 rounded-lg font-semibold border ${
                task.status === 'DONE'
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              4. Hoàn thành
            </div>
          </div>

          {/* Action buttons based on lifecycle & VALIDATED ROLE */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* 1. GIAI ĐOẠN TODO: GIAO VIỆC & TIẾP NHẬN */}
            {task.status === 'TODO' && (
              <>
                {canExecute && (
                  <>
                    <button
                      type="button"
                      onClick={handleAccept}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Tiếp nhận nhiệm vụ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeclineDialogOpen(true)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-xs transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Từ chối tiếp nhận</span>
                    </button>
                  </>
                )}

                {canSupervise && !canExecute && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200">
                      Chờ {task.assignee.name} tiếp nhận công việc
                    </span>
                    <button
                      type="button"
                      onClick={handleRemind}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                      title="Gửi chuông thông báo nhắc nhở tiếp nhận việc"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Đôn đốc / Nhắc nhận việc</span>
                    </button>
                  </div>
                )}

                {isReadOnly && (
                  <span className="text-xs text-slate-500 italic">
                    Công việc đang chờ người phụ trách ({task.assignee.name}) tiếp nhận.
                  </span>
                )}
              </>
            )}

            {/* 2. GIAI ĐOẠN IN_PROGRESS HOẶC OVERDUE: THỰC HIỆN, ĐÁNH GIÁ & NỘP BÁO CÁO */}
            {(task.status === 'IN_PROGRESS' || task.status === 'OVERDUE') && (
              <>
                {canExecute && (
                  <>
                    <button
                      type="button"
                      onClick={() => setReviewDialogOpen(true)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002b6d] text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Nộp báo cáo &amp; Đề xuất nghiệm thu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerUploadPicker(true)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-300 text-[#003B95] dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-semibold text-xs transition cursor-pointer"
                      title="Nộp file kết quả công việc (Excel, PDF, Word...)"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Nộp file kết quả</span>
                    </button>
                  </>
                )}

                {canSupervise && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEvaluationDialogOpen(true)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Đánh giá tiến độ</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemind}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-700 dark:text-amber-300 hover:bg-amber-100 font-semibold text-xs transition cursor-pointer"
                      title="Gửi chuông thông báo đôn đốc tiến độ"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Đôn đốc tiến độ {task.delegation?.reminderCount ? `(${task.delegation.reminderCount})` : ''}</span>
                    </button>
                  </>
                )}

                {isReadOnly && (
                  <span className="text-xs text-slate-500 italic">
                    Công việc đang được thực hiện bởi {task.assignee.name} (Tiến độ {task.progress}%).
                  </span>
                )}
              </>
            )}

            {/* 3. GIAI ĐOẠN REVIEW: THẨM ĐỊNH NGHIỆM THU & PHÊ DUYỆT */}
            {task.status === 'REVIEW' && (
              <>
                {canSupervise ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setApproveDialogOpen(true)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Phê duyệt nghiệm thu (100%)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReworkDialogOpen(true)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-semibold text-xs transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Yêu cầu chỉnh sửa / Làm lại</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-3 py-1.5 rounded-xl border border-amber-200">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>Đã nộp báo cáo. Đang chờ Ban Quản trị / Người giao việc phê duyệt nghiệm thu.</span>
                  </div>
                )}
              </>
            )}

            {/* 4. GIAI ĐOẠN DONE: HOÀN THÀNH */}
            {task.status === 'DONE' && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Nhiệm vụ đã được phê duyệt nghiệm thu hoàn thành</span>
                {task.delegation?.approvalRating && (
                  <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold ml-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {task.delegation.approvalRating}/5 sao
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chuyển trạng thái linh hoạt: CHỈ RENDER CHO NGƯỜI GIAO VIỆC / BQT */}
        {canSupervise && (
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Trạng thái (Giám sát):
            </span>
            <div className="flex flex-wrap gap-1">
              {Object.entries(TASK_STATUS_CONFIG).map(([stKey, cfg]) => {
                const active = task.status === stKey;
                return (
                  <button
                    key={stKey}
                    type="button"
                    onClick={() => onStatusChange(task.id, stKey as TaskStatus)}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                      active
                        ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-1 ring-offset-1 ring-[#003B95]/30 font-bold shadow-2xs`
                        : 'border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-[#003B95] text-[#003B95] dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Chi tiết nhiệm vụ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attachments')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'attachments'
                ? 'border-[#003B95] text-[#003B95] dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            Tài liệu &amp; Nộp file ({task.attachments?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'border-[#003B95] text-[#003B95] dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Thảo luận ({task.comments?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-[#003B95] text-[#003B95] dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Lịch sử thao tác
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md mb-2">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  {task.department}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {task.title}
                </h2>
              </div>

              {/* Progress Slider (Interactive for Assignee/Supervisor, Static for Viewer) */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <span>Tiến độ thực hiện:</span>
                  <span className="font-mono text-[#003B95] dark:text-blue-400 text-sm">
                    {task.progress}%
                  </span>
                </div>
                {canExecute || canSupervise ? (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={task.progress}
                    onChange={(e) => onProgressChange(task.id, Number(e.target.value))}
                    className="w-full accent-[#003B95] cursor-pointer"
                  />
                ) : (
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#003B95] h-full rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Latest Progress Evaluation Card if available */}
              {task.evaluations && task.evaluations.length > 0 && (
                <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span>Đánh giá tiến độ gần nhất</span>
                    </div>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400">
                      {task.evaluations[0].evaluatedAt.replace('T', ' ').substring(0, 16)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-200/80 dark:bg-purple-900 text-purple-900 dark:text-purple-200">
                      {task.evaluations[0].statusAssessment === 'ON_TRACK' && 'Đúng tiến độ'}
                      {task.evaluations[0].statusAssessment === 'AHEAD' && 'Vượt tiến độ'}
                      {task.evaluations[0].statusAssessment === 'AT_RISK' && 'Có nguy cơ trễ hạn'}
                      {task.evaluations[0].statusAssessment === 'DELAYED' && 'Chậm tiến độ'}
                    </span>
                    {task.evaluations[0].rating && (
                      <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {task.evaluations[0].rating}/5 sao
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-purple-950 dark:text-purple-200 italic leading-relaxed">
                    "{task.evaluations[0].feedback}"
                  </p>
                  <div className="text-[10px] text-purple-700/80 dark:text-purple-400">
                    Đánh giá bởi: <span className="font-semibold">{task.evaluations[0].evaluatorName}</span>
                  </div>
                </div>
              )}

              {/* People & Dates Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                  <div className="text-slate-400 font-medium mb-1">Người chịu trách nhiệm</div>
                  <div className="flex items-center gap-2">
                    {task.assignee.avatar ? (
                      <img
                        src={task.assignee.avatar}
                        alt={task.assignee.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#003B95] text-white flex items-center justify-center text-[10px] font-bold">
                        {task.assignee.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {task.assignee.name}
                      </div>
                      {task.assignee.role && (
                        <div className="text-[10px] text-slate-400">{task.assignee.role}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                  <div className="text-slate-400 font-medium mb-1">Người giao việc / Giám sát</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {task.supervisor?.name || 'Ban Quản trị'}
                  </div>
                  {task.supervisor?.role && (
                    <div className="text-[10px] text-slate-400">{task.supervisor.role}</div>
                  )}
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                  <div className="text-slate-400 font-medium mb-1">Ngày bắt đầu</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {task.startDate}
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                  <div className="text-slate-400 font-medium mb-1">Hạn hoàn thành</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    {task.dueDate}
                  </div>
                </div>
              </div>

              {/* Online Meeting Section */}
              {task.meeting?.enabled && task.meeting?.link && (
                <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#003B95] text-white">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>Cuộc họp trực tuyến: {MEETING_PLATFORMS[task.meeting.platform]?.label}</span>
                          <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-[#003B95] dark:bg-blue-900/60 dark:text-blue-300">
                            {MEETING_PLATFORMS[task.meeting.platform]?.shortName}
                          </span>
                        </div>
                        {task.meeting.meetingTime && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Lịch họp: {task.meeting.meetingTime.replace('T', ' lúc ')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <a
                      href={task.meeting.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002D73] shadow-xs transition"
                    >
                      <span>Vào phòng họp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/60 text-xs">
                    <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[340px]">
                      {task.meeting.link}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(task.meeting?.link || '');
                        toast.success('Đã sao chép link cuộc họp');
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                      title="Sao chép link"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Description */}
              {task.description && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Nội dung công việc
                  </h4>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 whitespace-pre-wrap">
                    {task.description}
                  </div>
                </div>
              )}

              {/* Deliverables Expectation */}
              {task.deliverables && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    Kết quả đầu ra kỳ vọng
                  </h4>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                    {task.deliverables}
                  </div>
                </div>
              )}

              {/* Subtasks Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                  <span>Checklist công việc con ({task.subtasks?.length || 0})</span>
                  <span>
                    {task.subtasks?.filter((s) => s.completed).length || 0}/
                    {task.subtasks?.length || 0} xong
                  </span>
                </h4>

                {task.subtasks && task.subtasks.length > 0 ? (
                  <div className="space-y-2">
                    {task.subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => {
                          if (canExecute || canSupervise) {
                            onToggleSubtask(task.id, sub.id);
                          }
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          canExecute || canSupervise ? 'cursor-pointer hover:border-[#003B95]' : 'cursor-default'
                        } ${
                          sub.completed
                            ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                            : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            sub.completed
                              ? 'bg-[#003B95] border-[#003B95] text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {sub.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium">{sub.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Chưa có mục con nào.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ATTACHMENTS & DELIVERABLES (FILE NỘP & XEM EXCEL) */}
          {activeTab === 'attachments' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-[#003B95]" />
                    Tài liệu &amp; File nộp nghiệm thu
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bao gồm tài liệu giao việc và file kết quả nghiệm thu (Excel, Word, PDF...)
                  </p>
                </div>

                {/* Upload Buttons */}
                <div className="flex gap-2">
                  {canExecute && (
                    <button
                      type="button"
                      onClick={() => triggerUploadPicker(true)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Nộp file kết quả</span>
                    </button>
                  )}
                  {canSupervise && (
                    <button
                      type="button"
                      onClick={() => triggerUploadPicker(false)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002b6d] text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm tài liệu giao việc</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Attachments List */}
              {task.attachments && task.attachments.length > 0 ? (
                <div className="space-y-3">
                  {task.attachments.map((att, idx) => {
                    const isXls = isExcelFile(att.name);
                    const isDeliverable = att.isDeliverable;

                    return (
                      <div
                        key={att.id || idx}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isDeliverable
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60'
                            : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* File Icon */}
                          <div
                            className={`p-2.5 rounded-xl shrink-0 ${
                              isXls
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                                : att.name.endsWith('.pdf')
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                            }`}
                          >
                            {isXls ? (
                              <FileSpreadsheet className="w-5 h-5" />
                            ) : att.name.endsWith('.pdf') ? (
                              <FileText className="w-5 h-5" />
                            ) : (
                              <File className="w-5 h-5" />
                            )}
                          </div>

                          {/* File Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[220px] sm:max-w-xs">
                                {att.name}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  isDeliverable
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {isDeliverable ? 'File nghiệm thu' : 'Tài liệu giao việc'}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              {att.size && <span>{att.size}</span>}
                              {att.uploadedBy && (
                                <>
                                  <span>•</span>
                                  <span>Tải bởi: {att.uploadedBy}</span>
                                </>
                              )}
                              {att.uploadedAt && (
                                <>
                                  <span>•</span>
                                  <span>{att.uploadedAt}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* File Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* NÚT XEM EXCEL TRỰC TIẾP */}
                          {isXls && (
                            <button
                              type="button"
                              onClick={() => handleOpenExcel(att.name, att.url)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                              title="Xem trực tiếp bảng tính Excel ngay trong ứng dụng"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Xem Excel</span>
                            </button>
                          )}

                          {/* Download Button */}
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(att.name, att.url)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                            title="Tải file về máy"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Delete File Button (Uploader or Supervisor) */}
                          {(canSupervise || att.uploadedBy === currentUserName) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAttachment(idx, att.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition cursor-pointer"
                              title="Xóa file đính kèm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <FileSpreadsheet className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Chưa có tài liệu đính kèm hoặc file kết quả nào
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    Hỗ trợ định dạng bảng tính Excel (.xlsx, .xls, .csv), PDF, Word (.docx) dung lượng tối đa 25MB.
                  </p>
                  {canExecute && (
                    <button
                      type="button"
                      onClick={() => triggerUploadPicker(true)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Nộp file kết quả ngay</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMMENTS & DISCUSSIONS */}
          {activeTab === 'comments' && (
            <div className="flex flex-col h-full space-y-4">
              <div className="flex-1 space-y-3 overflow-y-auto">
                {task.comments && task.comments.length > 0 ? (
                  task.comments.map((cm) => (
                    <div
                      key={cm.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {cm.authorName}
                          {cm.authorRole && (
                            <span className="font-normal text-slate-400 ml-1.5">
                              ({cm.authorRole})
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{cm.createdAt}</div>
                      </div>
                      <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {cm.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Chưa có ý kiến trao đổi nào. Hãy là người đầu tiên để lại phản hồi!
                  </div>
                )}
              </div>

              <form onSubmit={handleSendComment} className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Viết phản hồi / báo cáo tiến độ..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002D73] disabled:opacity-50 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" /> Gửi
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {task.history && task.history.length > 0 ? (
                task.history.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#003B95] mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {h.action}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Thực hiện bởi: <span className="font-medium text-slate-600 dark:text-slate-300">{h.actor}</span> • {h.timestamp}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">Chưa có lịch sử ghi nhận.</div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* MODALS CHO LUỒNG GIAO VIỆC - NHẬN VIỆC - ĐÁNH GIÁ TIẾN ĐỘ - NGHIỆM THU   */}
        {/* ========================================================================= */}

        {/* 1. Modal Từ chối tiếp nhận (Assignee) */}
        {declineDialogOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Từ chối tiếp nhận nhiệm vụ</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDeclineDialogOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="py-4 space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Vui lòng cung cấp lý do từ chối để người giao việc và Ban điều hành có phương án phân công phù hợp.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lý do từ chối <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="VD: Khối lượng công việc hiện tại quá tải, trùng lịch công tác hoặc cần người có chuyên môn phù hợp..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-slate-100 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeclineDialogOpen(false)}
                  disabled={actionLoading}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleDecline}
                  disabled={actionLoading || !declineReason.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-xs font-bold text-white transition flex items-center gap-1.5"
                >
                  {actionLoading ? 'Đang gửi...' : 'Xác nhận từ chối'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Modal Nộp báo cáo & Đề xuất nghiệm thu (Assignee) */}
        {reviewDialogOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-[#003B95] dark:text-blue-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Nộp báo cáo &amp; Đề xuất nghiệm thu</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewDialogOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="py-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Link bàn giao sản phẩm / tài liệu đính kèm (nếu có)
                  </label>
                  <input
                    type="url"
                    value={reviewDeliverables}
                    onChange={(e) => setReviewDeliverables(e.target.value)}
                    placeholder="https://drive.google.com/... hoặc link github/figma"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ghi chú tóm tắt kết quả hoàn thành
                  </label>
                  <textarea
                    rows={3}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="VD: Đã hoàn tất đúng theo mục tiêu, đính kèm file báo cáo tài chính và danh sách tài trợ..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-slate-100 focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95] outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReviewDialogOpen(false)}
                  disabled={actionLoading}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-[#003B95] hover:bg-[#002D73] disabled:opacity-50 text-xs font-bold text-white transition flex items-center gap-1.5"
                >
                  {actionLoading ? 'Đang nộp...' : 'Nộp duyệt ngay'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Modal Đánh giá tiến độ (Supervisor) */}
        {evaluationDialogOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>Đánh giá tiến độ thực hiện định kỳ</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEvaluationDialogOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="py-4 space-y-4">
                {/* Trạng thái tiến độ */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Thẩm định tiến độ hiện tại <span className="text-purple-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'ON_TRACK', label: 'Đúng tiến độ', color: 'border-emerald-300 text-emerald-700 bg-emerald-50' },
                      { key: 'AHEAD', label: 'Vượt tiến độ', color: 'border-blue-300 text-blue-700 bg-blue-50' },
                      { key: 'AT_RISK', label: 'Có nguy cơ trễ', color: 'border-amber-300 text-amber-700 bg-amber-50' },
                      { key: 'DELAYED', label: 'Chậm tiến độ', color: 'border-rose-300 text-rose-700 bg-rose-50' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setEvalAssessment(opt.key as any)}
                        className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          evalAssessment === opt.key
                            ? `${opt.color} ring-2 ring-purple-600`
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chấm điểm sao */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Điểm đánh giá chất lượng
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEvalRating(star)}
                        className="p-1 text-amber-400 hover:scale-115 transition cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= evalRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-2">
                      {evalRating}/5 sao
                    </span>
                  </div>
                </div>

                {/* Nhận xét chỉ đạo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nhận xét &amp; Chỉ đạo tiến độ <span className="text-purple-600">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={evalFeedback}
                    onChange={(e) => setEvalFeedback(e.target.value)}
                    placeholder="VD: Cần đẩy nhanh liên hệ các nhà cung cấp trước thứ 6, chuẩn bị sẵn phương án dự phòng..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEvaluationDialogOpen(false)}
                  disabled={actionLoading}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleEvaluateProgress}
                  disabled={actionLoading || !evalFeedback.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-xs font-bold text-white transition flex items-center gap-1.5"
                >
                  {actionLoading ? 'Đang lưu...' : 'Lưu đánh giá tiến độ'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Modal Phê duyệt nghiệm thu (Supervisor) */}
        {approveDialogOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Phê duyệt nghiệm thu (Hoàn thành 100%)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setApproveDialogOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="py-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Đánh giá chất lượng thực hiện (sao)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setApproveRating(star)}
                        className="p-1 text-amber-400 hover:scale-115 transition cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= approveRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-2">
                      {approveRating === 5 ? 'Xuất sắc' : approveRating === 4 ? 'Tốt' : approveRating === 3 ? 'Đạt' : 'Cần cải thiện'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nhận xét &amp; Lời khen gửi đến nhân sự
                  </label>
                  <textarea
                    rows={3}
                    value={approveFeedback}
                    onChange={(e) => setApproveFeedback(e.target.value)}
                    placeholder="VD: Nhiệm vụ hoàn thành xuất sắc, đúng tiến độ và chất lượng cao..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setApproveDialogOpen(false)}
                  disabled={actionLoading}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold text-white transition flex items-center gap-1.5"
                >
                  {actionLoading ? 'Đang duyệt...' : 'Phê duyệt hoàn thành'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Modal Yêu cầu làm lại / Chỉnh sửa (Supervisor) */}
        {reworkDialogOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                  <RotateCcw className="w-4 h-4" />
                  <span>Yêu cầu chỉnh sửa / Làm lại</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReworkDialogOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="py-4 space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Nhiệm vụ sẽ chuyển lại trạng thái Đang thực hiện. Vui lòng ghi rõ những điểm cần bổ sung hoặc sửa đổi.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nội dung yêu cầu chỉnh sửa <span className="text-amber-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={reworkReason}
                    onChange={(e) => setReworkReason(e.target.value)}
                    placeholder="VD: Cần bổ sung thêm phụ lục chi phí và làm rõ điều khoản 4 trong hợp đồng..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReworkDialogOpen(false)}
                  disabled={actionLoading}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleRequestRework}
                  disabled={actionLoading || !reworkReason.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-xs font-bold text-white transition flex items-center gap-1.5"
                >
                  {actionLoading ? 'Đang gửi...' : 'Gửi yêu cầu chỉnh sửa'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. Excel In-App Viewer Modal */}
        <ExcelViewerModal
          open={excelModalOpen}
          onClose={() => setExcelModalOpen(false)}
          fileName={previewFileName}
          fileUrl={previewFileUrl}
        />
      </div>
    </div>
  );
}
