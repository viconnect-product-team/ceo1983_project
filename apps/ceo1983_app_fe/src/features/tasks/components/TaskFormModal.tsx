import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Building,
  User,
  CheckCircle2,
  Flame,
  FileText,
  Target,
  Video,
  Link as LinkIcon,
  Clock,
} from 'lucide-react';
import type { TaskItem, TaskPriority, TaskStatus, TaskSubtask, MeetingPlatform } from '../types';
import { TASK_DEPARTMENTS, TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG, MEETING_PLATFORMS } from '../types';
import { fetchNestApi } from '@/lib/api-client';

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TaskItem>) => Promise<void>;
  initialData?: TaskItem | null;
  defaultStatus?: TaskStatus;
  defaultDepartment?: string;
  defaultDate?: string;
}

export function TaskFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  defaultStatus = 'TODO',
  defaultDepartment,
  defaultDate,
}: TaskFormModalProps) {
  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [department, setDepartment] = useState<string>(defaultDepartment || TASK_DEPARTMENTS[0]);
  const [assigneeId, setAssigneeId] = useState('');
  const [assigneeEmail, setAssigneeEmail] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [assigneeRole, setAssigneeRole] = useState('Phụ trách ban');
  const [supervisorName, setSupervisorName] = useState('Ban Quản trị');
  const [memberList, setMemberList] = useState<any[]>([]);
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [startDate, setStartDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  );
  const [progress, setProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Meeting Integration State (Zoom, Google Meet, UniWork)
  const [meetingEnabled, setMeetingEnabled] = useState(false);
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>('UNIWORK');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingNote, setMeetingNote] = useState('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && memberList.length === 0) {
      fetchNestApi<any[]>('/members')
        .then((res) => {
          if (Array.isArray(res)) setMemberList(res);
        })
        .catch(() => {});
    }
  }, [open, memberList.length]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setCode(initialData.code || '');
      setDepartment(initialData.department || TASK_DEPARTMENTS[0]);
      setAssigneeId(initialData.assignee?.id || '');
      setAssigneeEmail(initialData.assignee?.email || '');
      setAssigneeName(initialData.assignee?.name || '');
      setAssigneeRole(initialData.assignee?.role || '');
      setSupervisorName(initialData.supervisor?.name || 'Ban Quản trị');
      setStatus(initialData.status || 'TODO');
      setPriority(initialData.priority || 'MEDIUM');
      setStartDate(initialData.startDate || new Date().toISOString().split('T')[0]);
      setDueDate(initialData.dueDate || new Date().toISOString().split('T')[0]);
      setProgress(initialData.progress ?? 0);
      setDescription(initialData.description || '');
      setDeliverables(initialData.deliverables || '');
      setSubtasks(initialData.subtasks || []);

      // Meeting
      if (initialData.meeting) {
        setMeetingEnabled(Boolean(initialData.meeting.enabled));
        setMeetingPlatform(initialData.meeting.platform || 'UNIWORK');
        setMeetingLink(initialData.meeting.link || '');
        setMeetingTime(initialData.meeting.meetingTime || '');
        setMeetingNote(initialData.meeting.note || '');
      } else {
        setMeetingEnabled(false);
        setMeetingPlatform('UNIWORK');
        setMeetingLink('');
        setMeetingTime('');
        setMeetingNote('');
      }
    } else {
      setTitle('');
      setCode('');
      setDepartment(defaultDepartment || TASK_DEPARTMENTS[0]);
      setAssigneeId('');
      setAssigneeEmail('');
      setAssigneeName('');
      setAssigneeRole('Phụ trách');
      setSupervisorName('Ban Quản trị');
      setStatus(defaultStatus);
      setPriority('MEDIUM');
      setStartDate(defaultDate || new Date().toISOString().split('T')[0]);
      setDueDate(
        defaultDate
          ? new Date(new Date(defaultDate).getTime() + 7 * 86400000).toISOString().split('T')[0]
          : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      );
      setProgress(0);
      setDescription('');
      setDeliverables('');
      setSubtasks([]);

      // Reset meeting
      setMeetingEnabled(false);
      setMeetingPlatform('UNIWORK');
      setMeetingLink('');
      setMeetingTime('');
      setMeetingNote('');
    }
  }, [initialData, defaultStatus, open]);

  if (!open) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      {
        id: `st-${Date.now()}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        code: code.trim() || undefined,
        title: title.trim(),
        department,
        assignee: {
          id: assigneeId || undefined,
          name: assigneeName.trim() || 'Người quản trị',
          email: assigneeEmail.trim() || undefined,
          role: assigneeRole.trim(),
        },
        supervisor: {
          name: supervisorName.trim() || 'Ban Quản trị',
          role: 'Giám sát',
        },
        status,
        priority,
        startDate,
        dueDate,
        progress: Number(progress),
        description: description.trim(),
        deliverables: deliverables.trim(),
        subtasks,
        meeting: {
          enabled: meetingEnabled,
          platform: meetingPlatform,
          link: meetingLink.trim() || undefined,
          meetingTime: meetingTime || undefined,
          note: meetingNote.trim() || undefined,
        },
        attachments: initialData?.attachments || [],
        comments: initialData?.comments || [],
        history: initialData?.history || [],
        delegation: initialData?.delegation,
        evaluations: initialData?.evaluations,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/40 dark:to-slate-900">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#003B95]" />
              {isEditing ? 'Chỉnh sửa Công việc' : 'Tạo Công việc Mới'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống điều phối và phân công nhiệm vụ hiệp hội CEO 1983
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tên công việc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Triển khai chiến dịch quyên góp quỹ thiện nguyện CEO 1983..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                Ban / Bộ phận phụ trách
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
              >
                {TASK_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Mức độ ưu tiên
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
              >
                {Object.entries(TASK_PRIORITY_CONFIG).map(([pKey, cfg]) => (
                  <option key={pKey} value={pKey}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Người chịu trách nhiệm chính
                </label>
                {assigneeEmail && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium truncate max-w-[160px]" title={assigneeEmail}>
                    {assigneeEmail}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {memberList.length > 0 && (
                  <select
                    value={assigneeId}
                    onChange={(e) => {
                      const selId = e.target.value;
                      setAssigneeId(selId);
                      const m = memberList.find((item) => item.id === selId);
                      if (m) {
                        setAssigneeName(m.name);
                        setAssigneeEmail(m.email || '');
                        setAssigneeRole(m.company || m.contact || 'Phụ trách');
                      }
                    }}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
                  >
                    <option value="">-- Chọn hội viên ({memberList.length}) --</option>
                    {memberList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code ? `[${m.code}] ` : ''}{m.name} {m.email ? `(${m.email})` : ''}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="text"
                  placeholder="Nhập tên người nhận việc..."
                  value={assigneeName}
                  onChange={(e) => {
                    setAssigneeName(e.target.value);
                    if (assigneeId) setAssigneeId('');
                  }}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Người giao việc / Giám sát
              </label>
              <input
                type="text"
                placeholder="VD: Ban Quản trị / Chủ tịch..."
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                Hạn hoàn thành (Deadline)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Trạng thái hiện tại
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
              >
                {Object.entries(TASK_STATUS_CONFIG).map(([stKey, cfg]) => (
                  <option key={stKey} value={stKey}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Tiến độ hoàn thành:</span>
                <span className="font-mono text-[#003B95] dark:text-blue-400 font-bold">{progress}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-[#003B95] cursor-pointer mt-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Mô tả chi tiết nội dung công việc
            </label>
            <textarea
              rows={3}
              placeholder="Nội dung triển khai, phạm vi công việc, tài nguyên yêu cầu..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              Kết quả đầu ra kỳ vọng (Deliverables / KPI)
            </label>
            <input
              type="text"
              placeholder="VD: 500 suất quà, 1 video 4K, bản báo cáo tài chính..."
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#003B95]" />
              Danh sách công việc con (Checklist)
            </label>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Nhập tên đầu việc con và nhấn Thêm..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold inline-flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 p-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700/60 text-xs"
                  >
                    <span className="text-slate-800 dark:text-slate-200 truncate">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cuộc họp trực tuyến trao đổi công việc (Zoom, Google Meet, UniWork) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#003B95] text-white shadow-xs">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <label
                    htmlFor="toggle-meeting"
                    className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer block"
                  >
                    Cuộc họp trao đổi công việc
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tích hợp phòng họp trực tuyến qua Zoom, Google Meet hoặc UniWork
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="toggle-meeting"
                  type="checkbox"
                  checked={meetingEnabled}
                  onChange={(e) => setMeetingEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#003B95]"></div>
              </label>
            </div>

            {meetingEnabled && (
              <div className="space-y-3 pt-3 border-t border-slate-200/80 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Hình thức cuộc họp <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['ZOOM', 'GOOGLE_MEET', 'UNIWORK'] as MeetingPlatform[]).map((platform) => {
                      const cfg = MEETING_PLATFORMS[platform];
                      const isSelected = meetingPlatform === platform;
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => {
                            setMeetingPlatform(platform);
                            if (!meetingLink || meetingLink.startsWith('https://')) {
                              setMeetingLink(cfg.defaultUrl);
                            }
                          }}
                          className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold border transition ${
                            isSelected
                              ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-offset-1 ring-[#003B95]/30 shadow-xs`
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                      Đường dẫn phòng họp (Link URL)
                    </label>
                    <input
                      type="url"
                      placeholder={MEETING_PLATFORMS[meetingPlatform].defaultUrl}
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Thời gian bắt đầu họp
                    </label>
                    <input
                      type="datetime-local"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ghi chú cuộc họp (Passcode, phòng thảo luận...)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Passcode: 1983 - Thảo luận phương án triển khai nhiệm vụ..."
                    value={meetingNote}
                    onChange={(e) => setMeetingNote(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002D73] shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo công việc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
