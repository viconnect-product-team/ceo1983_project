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
  id?: string;
  name: string;
  url: string;
  size?: string;
  type?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  isDeliverable?: boolean;
}

export interface TaskMeeting {
  enabled: boolean;
  platform: 'ZOOM' | 'GOOGLE_MEET' | 'UNIWORK';
  link?: string;
  meetingTime?: string;
  note?: string;
}

export interface TaskProgressEvaluation {
  id: string;
  evaluatedAt: string;
  evaluatorName: string;
  evaluatorRole?: string;
  rating?: number; // 1-5 sao
  statusAssessment: 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'AHEAD';
  feedback: string;
}

export interface TaskDelegation {
  acceptedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  submittedAt?: string;
  submissionNote?: string;
  submissionDeliverables?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvalRating?: number; // 1-5 sao
  approvalFeedback?: string;
  reworkRequestedAt?: string;
  reworkReason?: string;
  lastRemindedAt?: string;
  reminderCount?: number;
  lastEvaluatedAt?: string;
  lastEvaluationAssessment?: 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'AHEAD';
}

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
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'OVERDUE';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
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
  delegation?: TaskDelegation;
  evaluations?: TaskProgressEvaluation[];
  createdAt: string;
  updatedAt: string;
}

export class TaskFilterDto {
  department?: string;
  status?: string;
  priority?: string;
  keyword?: string;
}

export class CreateTaskDto {
  title!: string;
  department?: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'OVERDUE';
  progress?: number;
  assignee?: any;
  supervisor?: any;
  collaborators?: any[];
  deliverables?: string;
  subtasks?: TaskSubtask[];
  meeting?: TaskMeeting;
  attachments?: TaskAttachment[];
}

export class UpdateTaskDto {
  title?: string;
  department?: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'OVERDUE';
  progress?: number;
  assignee?: any;
  supervisor?: any;
  collaborators?: any[];
  deliverables?: string;
  subtasks?: TaskSubtask[];
  meeting?: TaskMeeting;
  attachments?: TaskAttachment[];
  delegation?: TaskDelegation;
}

export class AddCommentDto {
  content!: string;
  authorName?: string;
  authorAvatar?: string;
  authorRole?: string;
}

export class AddSubtaskDto {
  title!: string;
  assignee?: string;
  dueDate?: string;
}
