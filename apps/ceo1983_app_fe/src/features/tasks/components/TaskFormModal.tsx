import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Building,
  User,
  Users,
  UserCheck,
  CheckCircle2,
  Flame,
  FileText,
  Target,
  Video,
  Link as LinkIcon,
  Clock,
  FileSpreadsheet,
  Paperclip,
  UploadCloud,
  ShieldCheck,
  AlertCircle,
  Coins,
  Download,
  Image as ImageIcon,
  ExternalLink,
  Layers,
  ListChecks,
  Check,
  Search,
} from 'lucide-react';
import type { TaskItem, TaskPriority, TaskStatus, TaskSubtask, TaskAttachment, MeetingPlatform } from '../types';
import { TASK_DEPARTMENTS, TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG, MEETING_PLATFORMS } from '../types';
import { fetchNestApi, uploadFileToNest } from '@/lib/api-client';
import { useRole } from '@/hooks/use-role';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export const TASK_CATEGORIES = [
  'Chung',
  'Hành chính & Vận hành',
  'Sự kiện & Hội thảo',
  'Thiện nguyện & Xã hội',
  'Xúc tiến thương mại & B2B',
  'Tài chính & Kế toán',
  'Đào tạo & Phát triển',
  'Truyền thông & Báo chí',
  'Đối ngoại & Hợp tác',
] as const;

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
  const { user } = useAuth();
  const {
    isPresident,
    isAdmin,
    isGeneralSecretary,
    isDepartmentLeader,
    userDepartment,
  } = useRole();

  // Basic task attributes
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<string>('Chung');
  const [department, setDepartment] = useState<string>(defaultDepartment || TASK_DEPARTMENTS[0]);
  const [assigneeId, setAssigneeId] = useState('');
  const [assigneeEmail, setAssigneeEmail] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [assigneeRole, setAssigneeRole] = useState('Phụ trách');
  const [assignees, setAssignees] = useState<Array<{ id?: string; name: string; avatar?: string; role?: string; email?: string }>>([]);
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState('');
  const [customAssigneeInput, setCustomAssigneeInput] = useState('');
  const [supervisorName, setSupervisorName] = useState('Ban Điều Hành');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [startDate, setStartDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  );
  const [progress, setProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [deliverables, setDeliverables] = useState('');

  // Dynamic Task attributes: Budget, Attachments
  const [estimatedBudget, setEstimatedBudget] = useState<string>('');
  const [actualBudget, setActualBudget] = useState<string>('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subtasks Checklist
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Online Meeting Integration
  const [meetingEnabled, setMeetingEnabled] = useState(false);
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>('UNIWORK');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingNote, setMeetingNote] = useState('');

  // Delegation Scope & Assignable Members state
  const [allowedDepartments, setAllowedDepartments] = useState<string[]>([...TASK_DEPARTMENTS]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(() => {
    if (defaultDepartment) return [defaultDepartment];
    return [TASK_DEPARTMENTS[0]];
  });
  const [canAssignAll, setCanAssignAll] = useState(true);
  const [memberList, setMemberList] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Automatic Creator Name and Role/Title (Requirement 4)
  const creatorName = useMemo(() => {
    return user?.fullName || user?.name || user?.username || 'Ban Quản trị';
  }, [user]);

  const creatorRole = useMemo(() => {
    if (user?.title) return user.title;
    if (isPresident) return 'Chủ tịch Hiệp hội';
    if (isAdmin) return 'Quản trị viên';
    if (isGeneralSecretary) return 'Tổng thư ký';
    if (isDepartmentLeader) return `Trưởng ${userDepartment || 'Ban chuyên môn'}`;
    if (user?.role === 'quan_tri') return 'Ban Quản trị';
    if (user?.role === 'ban_dieu_hanh') return 'Ban Điều Hành';
    return user?.role || 'Ban Điều Hành';
  }, [user, isPresident, isAdmin, isGeneralSecretary, isDepartmentLeader, userDepartment]);

  // Dynamic API call to fetch members of selected department(s)
  const loadMembersForDepartments = useCallback(async (depts: string[]) => {
    if (!depts || depts.length === 0) return;
    setLoadingMembers(true);
    try {
      const q = encodeURIComponent(depts.join(','));
      const res: any = await fetchNestApi(`/tasks/assignable-members?department=${q}`).catch(() => null);
      if (res && Array.isArray(res.members) && res.members.length > 0) {
        setMemberList(res.members);
      } else {
        const fallback: any = await fetchNestApi(`/members?department=${q}`).catch(() => null);
        if (Array.isArray(fallback) && fallback.length > 0) {
          setMemberList(fallback);
        } else {
          const allMems: any = await fetchNestApi(`/members`).catch(() => []);
          if (Array.isArray(allMems)) {
            const filtered = allMems.filter((m) => {
              const d = (m.department || '').toLowerCase();
              return depts.some((target) => d.includes(target.toLowerCase()) || target.toLowerCase().includes(d));
            });
            setMemberList(filtered.length > 0 ? filtered : allMems);
          }
        }
      }
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  const handleToggleDept = (deptName: string) => {
    setSelectedDepartments((prev) => {
      let next: string[];
      if (prev.includes(deptName)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        next = prev.filter((d) => d !== deptName);
      } else {
        next = [...prev, deptName];
      }
      setDepartment(next.join(', '));
      void loadMembersForDepartments(next);
      return next;
    });
  };

  const handleDepartmentChange = (deptName: string) => {
    setDepartment(deptName);
    setSelectedDepartments([deptName]);
    void loadMembersForDepartments([deptName]);
  };

  // Fetch assignable members & allowed departments from backend
  useEffect(() => {
    if (!open) return;

    setLoadingMembers(true);
    fetchNestApi<any>('/tasks/assignable-members')
      .then((res) => {
        if (res) {
          if (Array.isArray(res.allowedDepartments) && res.allowedDepartments.length > 0) {
            setAllowedDepartments(res.allowedDepartments);
            if (!initialData && !defaultDepartment) {
              setDepartment(res.allowedDepartments[0]);
              setSelectedDepartments([res.allowedDepartments[0]]);
            }
          }
          if (Array.isArray(res.members)) {
            setMemberList(res.members);
          }
          if (typeof res.canAssignAll === 'boolean') {
            setCanAssignAll(res.canAssignAll);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not fetch assignable members, falling back to all members:', err);
        fetchNestApi<any[]>('/members')
          .then((res) => {
            if (Array.isArray(res)) setMemberList(res);
          })
          .catch(() => {});
      })
      .finally(() => {
        setLoadingMembers(false);
      });
  }, [open, initialData, defaultDepartment]);

  // Load initial data or reset state
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setCode(initialData.code || '');
      setCategory(initialData.category || 'Chung');
      setDepartment(initialData.department || TASK_DEPARTMENTS[0]);
      setAssigneeId(initialData.assignee?.id || '');
      setAssigneeEmail(initialData.assignee?.email || '');
      setAssigneeName(initialData.assignee?.name || '');
      setAssigneeRole(initialData.assignee?.role || '');
      if (initialData.assignees && initialData.assignees.length > 0) {
        setAssignees(initialData.assignees);
      } else if (initialData.assignee?.name) {
        setAssignees([initialData.assignee]);
      } else {
        setAssignees([]);
      }
      setSupervisorName(initialData.supervisor?.name || 'Ban Điều Hành');
      setStatus(initialData.status || 'TODO');
      setPriority(initialData.priority || 'MEDIUM');
      setStartDate(initialData.startDate || new Date().toISOString().split('T')[0]);
      setDueDate(initialData.dueDate || new Date().toISOString().split('T')[0]);
      setProgress(initialData.progress ?? 0);
      setDescription(initialData.description || '');
      setDeliverables(initialData.deliverables || '');
      setSubtasks(initialData.subtasks || []);
      setAttachments(initialData.attachments || []);
      setEstimatedBudget(
        initialData.budget?.estimated !== undefined ? String(initialData.budget.estimated) : '',
      );
      setActualBudget(
        initialData.budget?.actual !== undefined ? String(initialData.budget.actual) : '',
      );

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
      setCategory('Chung');
      setDepartment(defaultDepartment || allowedDepartments[0] || TASK_DEPARTMENTS[0]);
      setAssigneeId('');
      setAssigneeEmail('');
      setAssigneeName('');
      setAssigneeRole('Phụ trách');
      setAssignees([]);
      setSelectedMemberToAdd('');
      setCustomAssigneeInput('');
      setSupervisorName(creatorName);
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
      setAttachments([]);
      setEstimatedBudget('');
      setActualBudget('');

      // Reset meeting
      setMeetingEnabled(false);
      setMeetingPlatform('UNIWORK');
      setMeetingLink('');
      setMeetingTime('');
      setMeetingNote('');
    }
  }, [initialData, defaultStatus, open, defaultDepartment, creatorName, allowedDepartments]);

  // Filter members list by currently selected department (Requirement 1)
  const deptMembers = useMemo(() => {
    return memberList.filter((m) => {
      if (!department || department === 'ALL') return true;
      const deptNormalized = department.replace(/^Ban\s+/i, '').toLowerCase().replace(/quản trị/g, 'điều hành').trim();
      const mDept = (m.department || '').toLowerCase().replace(/quản trị/g, 'điều hành');
      const mExec = (m.executive_role || m.executiveRole || '').toLowerCase().replace(/quản trị/g, 'điều hành');
      const matched = mDept.includes(deptNormalized) || mExec.includes(deptNormalized) || deptNormalized.includes(mDept) || (deptNormalized.includes('thành viên') && mDept.includes('hội viên'));
      if (!matched && !canAssignAll) return false;
      if (!memberSearchQuery.trim()) return matched || canAssignAll;
      const q = memberSearchQuery.toLowerCase().trim();
      return (
        (m.name || '').toLowerCase().includes(q) ||
        (m.code || '').toLowerCase().includes(q) ||
        (m.position || '').toLowerCase().includes(q) ||
        (m.company || '').toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q)
      );
    });
  }, [memberList, department, canAssignAll, memberSearchQuery]);

  if (!open) return null;

  const toggleAssignee = (m: any) => {
    const isAlreadySelected = assignees.some(
      (a) => (a.id && a.id === m.id) || (a.name && a.name.toLowerCase() === m.name.toLowerCase())
    );
    if (isAlreadySelected) {
      setAssignees((prev) => prev.filter((a) => (a.id ? a.id !== m.id : a.name.toLowerCase() !== m.name.toLowerCase())));
    } else {
      setAssignees((prev) => [
        ...prev,
        {
          id: m.id,
          name: m.name,
          avatar: m.avatar_url || m.avatarUrl || m.avatar,
          role: m.position || m.company || m.executive_role || 'Phụ trách',
          email: m.email || '',
        },
      ]);
    }
  };

  // Handle Subtasks
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

  const handleAddMemberToAssignees = (memberId: string) => {
    if (!memberId) return;
    const m = memberList.find((item) => item.id === memberId);
    if (!m) return;
    if (assignees.some((a) => (a.id && a.id === m.id) || a.name.toLowerCase() === m.name.toLowerCase())) {
      toast.info('Người này đã có trong danh sách');
      return;
    }
    setAssignees((prev) => [
      ...prev,
      {
        id: m.id,
        name: m.name,
        avatar: m.avatar_url || m.avatarUrl || m.avatar,
        role: m.position || m.company || m.executive_role || 'Phụ trách',
        email: m.email || '',
      },
    ]);
    setSelectedMemberToAdd('');
  };

  const handleAddCustomAssignee = () => {
    if (!customAssigneeInput.trim()) return;
    const trimmed = customAssigneeInput.trim();
    if (assignees.some((a) => a.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.info('Người này đã có trong danh sách');
      return;
    }
    setAssignees((prev) => [
      ...prev,
      {
        name: trimmed,
        role: 'Phụ trách',
      },
    ]);
    setCustomAssigneeInput('');
  };

  const handleRemoveAssignee = (index: number) => {
    setAssignees((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleQuickProgress = (val: number) => {
    setProgress(val);
    if (val === 100) {
      setStatus('DONE');
    } else if (val > 0 && status === 'TODO') {
      setStatus('IN_PROGRESS');
    }
  };


  // Handle Multi-format File Upload
  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const detectFileType = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'doc' || ext === 'docx') return 'WORD';
    if (ext === 'xls' || ext === 'xlsx') return 'EXCEL';
    if (ext === 'pdf') return 'PDF';
    if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext || '')) return 'IMAGE';
    return 'FILE';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 30 * 1024 * 1024) {
          toast.error(`File "${file.name}" vượt quá giới hạn 30MB`);
          continue;
        }

        const uploadedUrl = await uploadFileToNest(file, 'tasks');
        const fileType = detectFileType(file.name);
        const newAttachment: TaskAttachment = {
          id: `att-${Date.now()}-${i}`,
          name: file.name,
          url: uploadedUrl,
          size: formatFileSize(file.size),
          type: fileType,
          uploadedBy: user?.name || 'Người dùng',
          uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          isDeliverable: false,
        };

        setAttachments((prev) => [...prev, newAttachment]);
      }
      toast.success('Tải tệp đính kèm lên thành công');
    } catch (err: any) {
      console.error('Lỗi tải tệp:', err);
      toast.error(err?.message || 'Không thể tải file lên hệ thống');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (attId?: string, attName?: string) => {
    setAttachments((prev) => prev.filter((a) => (attId ? a.id !== attId : a.name !== attName)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên công việc');
      return;
    }

    setSubmitting(true);
    try {
      const budgetObj =
        estimatedBudget || actualBudget
          ? {
              estimated: estimatedBudget ? Number(estimatedBudget) : undefined,
              actual: actualBudget ? Number(actualBudget) : undefined,
              currency: 'VND',
            }
          : undefined;

      const primaryAssignee = assignees[0] || {
        id: assigneeId || undefined,
        name: assigneeName.trim() || 'Người quản trị',
        email: assigneeEmail.trim() || undefined,
        role: assigneeRole.trim(),
      };

      await onSubmit({
        code: code.trim() || undefined,
        title: title.trim(),
        category,
        department,
        budget: budgetObj,
        assignee: primaryAssignee,
        assignees: assignees.length > 0 ? assignees : [primaryAssignee],
        creator: {
          id: user?.id,
          name: creatorName,
          role: creatorRole,
        },
        supervisor: {
          name: supervisorName.trim() || creatorName,
          role: creatorRole || 'Giám sát',
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
        attachments,
        comments: initialData?.comments || [],
        history: initialData?.history || [],
        delegation: initialData?.delegation,
        evaluations: initialData?.evaluations,
      });
      toast.success(isEditing ? 'Đã cập nhật công việc' : 'Đã tạo công việc thành công');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra khi lưu công việc');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-blue-50/20 dark:from-slate-800/60 dark:to-slate-900">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#003B95] shadow-xs" />
              {isEditing ? 'Chỉnh sửa công việc' : 'Giao việc mới'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân công nhiệm vụ và theo dõi tiến độ
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Title & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tên công việc <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Tổ chức Gala Gặp gỡ Hội viên Quý 4/2026..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mã công việc
              </label>
              <input
                type="text"
                placeholder="CV-1983-XX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none font-mono"
              />
            </div>
          </div>

          {/* Department Selection (Requirement 1) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#003B95]" />
                <span>Ban / Bộ phận phụ trách</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-muted-foreground">Tự động tải danh sách hội viên theo ban</span>
            </div>

            <select
              value={department}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-medium focus:border-[#003B95] outline-none"
            >
              {allowedDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#003B95]" />
                Phân loại công việc
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
              >
                {TASK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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

          {/* Creator Information & Authority (Requirement 4) */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#003B95]/10 dark:bg-[#003B95]/30 flex items-center justify-center text-[#003B95] dark:text-blue-300 flex-shrink-0 font-black text-sm">
                <UserCheck className="w-4 h-4 text-[#003B95] dark:text-blue-300" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5 flex-wrap">
                  <span>Người giao việc:</span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#ffffff]/10 text-[#003B95] dark:text-blue-300 font-extrabold px-2 py-0.5 text-[11px] border border-[#003B95]/20">
                    {creatorRole}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                  {creatorName}
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 italic hidden sm:block flex-shrink-0">
              Tự động ghi nhận danh tính &amp; đẩy thông báo
            </div>
          </div>

          {/* People: Assignee Multi-Select for Selected Department (Requirement 1) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#003B95]" />
                <span>Hội viên thuộc ban &amp; Người xử lý công việc ({assignees.length})</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-muted-foreground">Chọn hội viên trong ban</span>
            </div>

            {/* Selected Assignees Chips */}
            <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 min-h-[46px]">
              {assignees.length === 0 ? (
                <span className="text-xs text-slate-400 italic">
                  Chưa chọn người xử lý. Bấm vào hội viên bên dưới để chọn.
                </span>
              ) : (
                assignees.map((a, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-900 dark:text-blue-200"
                  >
                    {a.avatar ? (
                      <img src={a.avatar} alt={a.name} className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-[#003B95] text-white text-[9px] flex items-center justify-center font-bold">
                        {a.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-semibold">{a.name}</span>
                    {a.role && <span className="text-[10px] text-blue-600/70 dark:text-blue-300/70">({a.role})</span>}
                    <button
                      type="button"
                      onClick={() => handleRemoveAssignee(idx)}
                      className="text-slate-400 hover:text-rose-500 transition cursor-pointer ml-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Department Members Multi-select List / Grid */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900/50 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>Danh sách hội viên {department ? `(${department})` : ''}:</span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#ffffff]/10 text-[#003B95] dark:text-blue-300 font-extrabold px-2 py-0.5 text-[11px] border border-[#003B95]/20">
                    {deptMembers.length} người
                  </span>
                </span>
                <div className="relative w-44 sm:w-52">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-[#003B95]"
                  />
                </div>
              </div>

              {loadingMembers ? (
                <div className="py-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-[#003B95] border-t-transparent rounded-full animate-spin" />
                  <span>Đang tải danh sách hội viên theo ban...</span>
                </div>
              ) : deptMembers.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400 italic">
                  Không tìm thấy hội viên nào thuộc ban này hoặc phù hợp từ khóa. Bạn có thể nhập tên bên dưới.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {deptMembers.map((m: any) => {
                    const isSelected = assignees.some(
                      (a) => (a.id && a.id === m.id) || (a.name && a.name.toLowerCase() === m.name.toLowerCase())
                    );
                    return (
                      <button
                        key={m.id || m.email || m.name}
                        type="button"
                        onClick={() => toggleAssignee(m)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition cursor-pointer border ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-[#003B95]/40 text-[#003B95] dark:text-blue-200'
                            : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {m.avatar_url || m.avatarUrl || m.avatar ? (
                            <img
                              src={m.avatar_url || m.avatarUrl || m.avatar}
                              alt={m.name}
                              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[#003B95] text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                              {m.name ? m.name.charAt(0) : 'U'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">
                              {m.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {m.position || m.company || m.executive_role || m.department || 'Hội viên'}
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0 ml-2">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                              isSelected
                                ? 'bg-[#003B95] border-[#003B95] text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Custom assignee fallback */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Hoặc nhập tên người nhận việc ngoài danh sách..."
                  value={customAssigneeInput}
                  onChange={(e) => setCustomAssigneeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomAssignee();
                    }
                  }}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAssignee}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>

          {/* Timeline & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tiến độ: <span className="font-mono text-[#003B95] dark:text-blue-400 font-black">{progress}%</span>
              </label>
              <div className="flex items-center gap-1">
                {[0, 25, 50, 75, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickProgress(val)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                      progress === val
                        ? 'bg-[#003B95] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => handleQuickProgress(Number(e.target.value))}
              className="w-full accent-[#003B95] cursor-pointer mt-1"
            />
          </div>

          {/* Dynamic Budget (Dự toán & Kinh phí) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>Dự toán &amp; Kinh phí triển khai (Nếu có)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Dự toán ngân sách (VNĐ)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  placeholder="VD: 50000000"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono focus:border-[#003B95] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Kinh phí thực tế giải ngân (VNĐ)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  placeholder="VD: 45000000"
                  value={actualBudget}
                  onChange={(e) => setActualBudget(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono focus:border-[#003B95] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Mô tả chi tiết nội dung công việc
            </label>
            <textarea
              rows={3}
              placeholder="Nội dung triển khai, phạm vi công việc, mục tiêu cần đạt, lưu ý đặc biệt..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
            />
          </div>

          {/* Deliverables */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              Kết quả đầu ra kỳ vọng (Deliverables / KPI)
            </label>
            <input
              type="text"
              placeholder="VD: 500 suất quà, 1 video 4K, bản báo cáo tài chính kiểm toán..."
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
            />
          </div>


          {/* Subtasks (Checklist) */}
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

          {/* Multi-format File Attachments (Word, Excel, PDF, Images) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-[#003B95]" />
                  Tài liệu đính kèm giao việc (Word, Excel, PDF, Hình ảnh)
                </label>
                <p className="text-[11px] text-slate-500">
                  Hỗ trợ định dạng .doc, .docx, .xls, .xlsx, .pdf, .png, .jpg (Tối đa 30MB/file)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".doc,.docx,.xls,.xlsx,.pdf,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={handleFileUpload}
              />

              <button
                type="button"
                onClick={handleTriggerUpload}
                disabled={uploadingFile}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-2xs transition"
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#003B95]" />
                <span>{uploadingFile ? 'Đang tải...' : 'Tải file đính kèm'}</span>
              </button>
            </div>

            {attachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {attachments.map((att, idx) => {
                  const isXls = att.name.endsWith('.xls') || att.name.endsWith('.xlsx');
                  const isPdf = att.name.endsWith('.pdf');
                  const isWord = att.name.endsWith('.doc') || att.name.endsWith('.docx');
                  const isImg = att.type === 'IMAGE' || /\.(png|jpe?g|webp|gif)$/i.test(att.name);

                  return (
                    <div
                      key={att.id || idx}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${
                            isXls
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : isPdf
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : isWord
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          }`}
                        >
                          {isXls ? (
                            <FileSpreadsheet className="w-4 h-4" />
                          ) : isPdf ? (
                            <FileText className="w-4 h-4" />
                          ) : isWord ? (
                            <FileText className="w-4 h-4" />
                          ) : (
                            <ImageIcon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]" title={att.name}>
                            {att.name}
                          </p>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                            {att.size && <span>{att.size}</span>}
                            <span className="uppercase font-bold text-[9px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {isXls ? 'Excel' : isPdf ? 'PDF' : isWord ? 'Word' : 'Ảnh'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {att.url && att.url !== '#' && (
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Tải xuống / Xem trước"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id, att.name)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="Xóa tệp"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                onClick={handleTriggerUpload}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#003B95] dark:hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer transition bg-white/50 dark:bg-slate-800/50"
              >
                <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  Nhấp để tải lên tệp Word, Excel, PDF hoặc tài liệu minh chứng
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Người nhận việc sẽ dễ dàng tải về hoặc mở xem trực tiếp trên hệ thống CRM
                </p>
              </div>
            )}
          </div>

          {/* Cuộc họp trực tuyến trao đổi công việc (Zoom, Google Meet, UniWork) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40 space-y-3">
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
                    Cuộc họp trao đổi công việc trực tuyến
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
                    Ghi chú cuộc họp (Passcode, nội dung thảo luận...)
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

          {/* Form Actions */}
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
              {submitting ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Giao việc ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
