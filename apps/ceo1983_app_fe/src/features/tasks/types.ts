export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'OVERDUE';
export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface TaskSubtask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  assignee?: string;
}

export interface TaskComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  content: string;
  createdAt: string;
}

export interface TaskHistory {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
}

export interface TaskAttachment {
  name: string;
  url: string;
  size?: string;
  type?: string;
}

export type MeetingPlatform = 'ZOOM' | 'GOOGLE_MEET' | 'UNIWORK';

export interface TaskMeeting {
  enabled: boolean;
  platform: MeetingPlatform;
  link?: string;
  meetingTime?: string;
  note?: string;
}

export const MEETING_PLATFORMS: Record<
  MeetingPlatform,
  { label: string; shortName: string; bg: string; text: string; border: string; defaultUrl: string }
> = {
  ZOOM: {
    label: 'Zoom Meeting',
    shortName: 'Zoom',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    defaultUrl: 'https://zoom.us/j/',
  },
  GOOGLE_MEET: {
    label: 'Google Meet',
    shortName: 'Meet',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    defaultUrl: 'https://meet.google.com/',
  },
  UNIWORK: {
    label: 'UniWork Meeting',
    shortName: 'UniWork',
    bg: 'bg-[#003B95]/10 dark:bg-[#003B95]/30',
    text: 'text-[#003B95] dark:text-blue-300',
    border: 'border-[#003B95]/30 dark:border-[#003B95]/50',
    defaultUrl: 'https://uni-hrm.ubos.vn/meeting/',
  },
};

export interface TaskItem {
  id: string;
  code: string;
  title: string;
  department: string;
  assignee: {
    id?: string;
    name: string;
    avatar?: string;
    role?: string;
    email?: string;
  };
  supervisor: {
    id?: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  collaborators?: Array<{ id: string; name: string; avatar?: string }>;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  dueDate: string;
  progress: number;
  description: string;
  deliverables?: string;
  subtasks: TaskSubtask[];
  meeting?: TaskMeeting;
  attachments?: TaskAttachment[];
  comments: TaskComment[];
  history: TaskHistory[];
  createdAt: string;
  updatedAt: string;
}

export const TASK_DEPARTMENTS = [
  'Ban Thiện nguyện & An sinh Xã hội',
  'Ban Truyền thông',
  'Ban Thành viên',
  'Ban Sự kiện',
  'Ban Tài chính',
  'Ban Quản trị & Thư ký',
] as const;

export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  TODO: {
    label: 'Chờ xử lý',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  IN_PROGRESS: {
    label: 'Đang thực hiện',
    bg: 'bg-[#003B95]/10 dark:bg-[#003B95]/25',
    text: 'text-[#003B95] dark:text-blue-300',
    border: 'border-[#003B95]/20 dark:border-[#003B95]/40',
    dot: 'bg-[#003B95]',
  },
  REVIEW: {
    label: 'Chờ nghiệm thu',
    bg: 'bg-[#F59E0B]/10 dark:bg-[#F59E0B]/25',
    text: 'text-[#B45309] dark:text-amber-300',
    border: 'border-[#F59E0B]/30 dark:border-[#F59E0B]/40',
    dot: 'bg-[#F59E0B]',
  },
  DONE: {
    label: 'Đã hoàn thành',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  OVERDUE: {
    label: 'Quá hạn',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
};

export const TASK_PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; badge: string; iconColor: string }
> = {
  CRITICAL: {
    label: 'Khẩn cấp',
    badge: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800',
    iconColor: 'text-rose-500',
  },
  HIGH: {
    label: 'Cao',
    badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
    iconColor: 'text-amber-500',
  },
  MEDIUM: {
    label: 'Trung bình',
    badge: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
    iconColor: 'text-blue-500',
  },
  LOW: {
    label: 'Thấp',
    badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    iconColor: 'text-slate-400',
  },
};
