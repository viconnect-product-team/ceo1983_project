import React, { useState } from 'react';
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
} from 'lucide-react';
import type { TaskItem, TaskStatus } from '../types';
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG, MEETING_PLATFORMS } from '../types';
import { toast } from 'sonner';
import {
  acceptTask,
  declineTask,
  submitTaskReview,
  approveTask,
  requestTaskRework,
  remindTask,
} from '../api';

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
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');
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

  if (!open || !task) return null;

  const priorityInfo = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.MEDIUM;

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
      const updated = await acceptTask(task.id);
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
      const updated = await declineTask(task.id, declineReason.trim());
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

  // 4. Phê duyệt hoàn thành
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const updated = await approveTask(task.id, {
        rating: approveRating,
        feedback: approveFeedback.trim() || 'Nghiệm thu đạt chuẩn yêu cầu',
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

  // 5. Yêu cầu làm lại
  const handleRequestRework = async () => {
    if (!reworkReason.trim()) {
      toast.error('Vui lòng nhập yêu cầu chỉnh sửa');
      return;
    }
    setActionLoading(true);
    try {
      const updated = await requestTaskRework(task.id, reworkReason.trim());
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

  // 6. Nhắc nhở hạn chót
  const handleRemind = async () => {
    setActionLoading(true);
    try {
      const updated = await remindTask(task.id);
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
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
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
          </div>

          <div className="flex items-center gap-1">
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
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-600 transition ml-1 cursor-pointer"
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
            <div className={`p-1.5 rounded-lg font-semibold border ${
              task.status === 'TODO'
                ? 'bg-blue-100 border-blue-300 text-[#003B95] dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}>
              1. Giao việc
            </div>
            <div className={`p-1.5 rounded-lg font-semibold border ${
              task.status === 'IN_PROGRESS'
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}>
              2. Đang làm
            </div>
            <div className={`p-1.5 rounded-lg font-semibold border ${
              task.status === 'REVIEW'
                ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}>
              3. Nghiệm thu
            </div>
            <div className={`p-1.5 rounded-lg font-semibold border ${
              task.status === 'DONE'
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}>
              4. Hoàn thành
            </div>
          </div>

          {/* Action buttons based on lifecycle */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {task.status === 'TODO' && (
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
                <button
                  type="button"
                  onClick={handleRemind}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-700 dark:text-amber-300 hover:bg-amber-100 font-semibold text-xs transition cursor-pointer"
                  title="Gửi chuông thông báo nhắc nhở hạn chót"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Nhắc nhở người nhận</span>
                </button>
              </>
            )}

            {task.status === 'IN_PROGRESS' && (
              <>
                <button
                  type="button"
                  onClick={() => setReviewDialogOpen(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002b6d] text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Nộp báo cáo nghiệm thu</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemind}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-700 dark:text-amber-300 hover:bg-amber-100 font-semibold text-xs transition cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Đôn đốc tiến độ</span>
                </button>
              </>
            )}

            {task.status === 'REVIEW' && (
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
                  <span>Yêu cầu chỉnh sửa</span>
                </button>
              </>
            )}

            {task.status === 'DONE' && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Nhiệm vụ đã được phê duyệt nghiệm thu</span>
                {task.delegation?.approvalRating && (
                  <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold ml-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {task.delegation.approvalRating}/5
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chuyển trạng thái linh hoạt */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Trạng thái:
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

        <div className="flex-1 overflow-y-auto p-5">
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

              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <span>Tiến độ thực hiện:</span>
                  <span className="font-mono text-[#003B95] dark:text-blue-400 text-sm">
                    {task.progress}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={task.progress}
                  onChange={(e) => onProgressChange(task.id, Number(e.target.value))}
                  className="w-full accent-[#003B95] cursor-pointer"
                />
              </div>

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

                  {task.meeting.note && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/40">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Ghi chú:</span> {task.meeting.note}
                    </div>
                  )}
                </div>
              )}

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
                        onClick={() => onToggleSubtask(task.id, sub.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          sub.completed
                            ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                            : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-[#003B95]'
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

        {/* 1. Modal Từ chối tiếp nhận */}
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
                  Vui lòng cung cấp lý do từ chối để người giao việc và Ban điều hành có phương án phân công phù hợp hoặc hỗ trợ thêm nguồn lực.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lý do từ chối <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="VD: Trùng lịch công tác, khối lượng công việc hiện tại quá tải, hoặc chưa đúng ban chuyên môn..."
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

        {/* 2. Modal Nộp báo cáo nghiệm thu */}
        {reviewDialogOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-[#003B95] dark:text-blue-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Nộp báo cáo & đề xuất nghiệm thu</span>
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
                    Link bàn giao sản phẩm / tài liệu đính kèm
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
                    placeholder="VD: Đã hoàn tất ký kết 3 hợp đồng tài trợ và gửi danh sách chi tiết kèm theo..."
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

        {/* 3. Modal Phê duyệt nghiệm thu (100%) */}
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
                    Nhận xét & Lời khen gửi đến nhân sự
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

        {/* 4. Modal Yêu cầu làm lại / Chỉnh sửa */}
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
      </div>
    </div>
  );
}
