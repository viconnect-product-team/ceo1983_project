import { fetchNestApi } from '@/lib/api-client';
import type { TaskItem, TaskStatus, TaskPriority } from './types';

export async function fetchTasks(filters?: {
  department?: string;
  status?: string;
  priority?: string;
  keyword?: string;
}): Promise<TaskItem[]> {
  const query = new URLSearchParams();
  if (filters?.department && filters.department !== 'ALL') query.set('department', filters.department);
  if (filters?.status && filters.status !== 'ALL') query.set('status', filters.status);
  if (filters?.priority && filters.priority !== 'ALL') query.set('priority', filters.priority);
  if (filters?.keyword) query.set('keyword', filters.keyword);

  const endpoint = `/tasks${query.toString() ? `?${query.toString()}` : ''}`;
  try {
    const data = await fetchNestApi<TaskItem[]>(endpoint);
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (err) {
    console.warn('API /tasks không phản hồi:', err);
    return [];
  }
}

export async function fetchTaskDetail(id: string): Promise<TaskItem | null> {
  try {
    return await fetchNestApi<TaskItem>(`/tasks/${id}`);
  } catch {
    return null;
  }
}

export async function createTask(data: Partial<TaskItem>): Promise<TaskItem> {
  const res = await fetchNestApi<TaskItem>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}

export async function updateTask(id: string, data: Partial<TaskItem>): Promise<TaskItem> {
  return await fetchNestApi<TaskItem>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<TaskItem> {
  return await fetchNestApi<TaskItem>(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function updateTaskProgress(id: string, progress: number): Promise<TaskItem> {
  return await fetchNestApi<TaskItem>(`/tasks/${id}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({ progress }),
  });
}

export async function addCommentToTask(
  id: string,
  content: string,
  authorName = 'Người quản trị',
): Promise<TaskItem> {
  return await fetchNestApi<TaskItem>(`/tasks/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, authorName }),
  });
}

export async function toggleSubtask(taskId: string, subtaskId: string): Promise<TaskItem> {
  return await fetchNestApi<TaskItem>(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`, {
    method: 'PATCH',
  });
}

export async function acceptTask(id: string, actorName?: string): Promise<TaskItem> {
  return fetchNestApi<TaskItem>(`/tasks/${id}/accept`, {
    method: 'POST',
    body: JSON.stringify({ actorName }),
  });
}

export async function declineTask(id: string, reason: string, actorName?: string): Promise<TaskItem> {
  return fetchNestApi<TaskItem>(`/tasks/${id}/decline`, {
    method: 'POST',
    body: JSON.stringify({ reason, actorName }),
  });
}

export async function submitTaskReview(
  id: string,
  payload: { deliverables?: string; note?: string; actorName?: string },
): Promise<TaskItem> {
  return fetchNestApi<TaskItem>(`/tasks/${id}/submit-review`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function evaluateTaskProgress(
  id: string,
  payload: {
    rating?: number;
    statusAssessment: 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'AHEAD';
    feedback: string;
    actorName?: string;
  },
): Promise<TaskItem> {
  return fetchNestApi<TaskItem>(`/tasks/${id}/evaluate-progress`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function approveTask(
  id: string,
  payload: { approvedBy?: string; rating?: number; feedback?: string; actorName?: string },
): Promise<TaskItem> {
  return fetchNestApi<TaskItem>(`/tasks/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function requestTaskRework(
  id: string,
  payloadOrReason: string | { reworkReason: string; actorName?: string },
  actorName?: string,
): Promise<TaskItem> {
  const body = typeof payloadOrReason === 'string'
    ? { reworkReason: payloadOrReason, actorName }
    : payloadOrReason;
  return fetchNestApi<TaskItem>(`/tasks/${id}/request-rework`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function sendTaskReminder(id: string, actorName?: string): Promise<TaskItem> {
  return fetchNestApi<TaskItem>(`/tasks/${id}/remind`, {
    method: 'POST',
    body: JSON.stringify({ actorName }),
  });
}

export const remindTask = sendTaskReminder;

export async function uploadTaskAttachment(
  taskId: string,
  payload: { name: string; url: string; size?: string; type?: string; isDeliverable?: boolean; uploadedBy?: string; actorName?: string },
): Promise<TaskItem> {
  return fetchNestApi<TaskItem>(`/tasks/${taskId}/attachments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteTaskAttachment(
  taskId: string,
  attachmentIndex: number | string,
  actorName?: string,
): Promise<TaskItem> {
  const query = actorName ? `?actorName=${encodeURIComponent(actorName)}` : '';
  return fetchNestApi<TaskItem>(`/tasks/${taskId}/attachments/${attachmentIndex}${query}`, {
    method: 'DELETE',
  });
}

export async function addSubtaskToTask(
  taskId: string,
  title: string,
  assignee?: string,
  dueDate?: string,
): Promise<TaskItem> {
  return fetchNestApi<TaskItem>(`/tasks/${taskId}/subtasks`, {
    method: 'POST',
    body: JSON.stringify({ title, assignee, dueDate }),
  });
}

export async function deleteTask(id: string): Promise<boolean> {
  const res = await fetchNestApi<{ success: boolean }>(`/tasks/${id}`, {
    method: 'DELETE',
  });
  return res.success;
}

export async function fetchAssignableMembers(department?: string): Promise<{
  allowedDepartments: string[];
  members: any[];
  canAssignAll: boolean;
  currentRole: string;
  currentDepartment: string;
}> {
  const query = department && department !== 'ALL' ? `?department=${encodeURIComponent(department)}` : '';
  return fetchNestApi<{
    allowedDepartments: string[];
    members: any[];
    canAssignAll: boolean;
    currentRole: string;
    currentDepartment: string;
  }>(`/tasks/assignable-members${query}`);
}
