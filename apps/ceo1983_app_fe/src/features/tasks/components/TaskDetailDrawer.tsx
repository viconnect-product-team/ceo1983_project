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
} from 'lucide-react';
import type { TaskItem, TaskStatus } from '../types';
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG, MEETING_PLATFORMS } from '../types';
import { toast } from 'sonner';

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
}: TaskDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

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
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-[#003B95] transition"
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
              className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition"
              title="Xóa công việc"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-600 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Chuyển nhanh trạng thái
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(TASK_STATUS_CONFIG).map(([stKey, cfg]) => {
              const active = task.status === stKey;
              return (
                <button
                  key={stKey}
                  type="button"
                  onClick={() => onStatusChange(task.id, stKey as TaskStatus)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                    active
                      ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-offset-1 ring-[#003B95]/30 font-bold shadow-xs`
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
      </div>
    </div>
  );
}
