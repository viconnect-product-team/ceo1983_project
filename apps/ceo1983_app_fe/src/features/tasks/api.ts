import { fetchNestApi } from '@/lib/api-client';
import type { TaskItem, TaskStatus, TaskPriority } from './types';

const LOCAL_STORAGE_KEY = 'ceo1983_tasks_cache_v1';

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
    if (Array.isArray(data) && data.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      }
      return data;
    }
  } catch (err) {
    console.warn('API /tasks not reachable, falling back to cached/local tasks', err);
  }

  // Fallback to local storage
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        let parsed = JSON.parse(raw) as TaskItem[];
        if (filters?.department && filters.department !== 'ALL') {
          parsed = parsed.filter((t) => t.department === filters.department);
        }
        if (filters?.status && filters.status !== 'ALL') {
          parsed = parsed.filter((t) => t.status === filters.status);
        }
        if (filters?.priority && filters.priority !== 'ALL') {
          parsed = parsed.filter((t) => t.priority === filters.priority);
        }
        if (filters?.keyword) {
          const q = filters.keyword.toLowerCase();
          parsed = parsed.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.code.toLowerCase().includes(q) ||
              t.assignee.name.toLowerCase().includes(q),
          );
        }
        return parsed;
      } catch {
        /* ignore */
      }
    }
  }

  return [];
}

export async function fetchTaskDetail(id: string): Promise<TaskItem | null> {
  try {
    return await fetchNestApi<TaskItem>(`/tasks/${id}`);
  } catch {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw) as TaskItem[];
        return list.find((t) => t.id === id || t.code === id) || null;
      }
    }
    return null;
  }
}

export async function createTask(data: Partial<TaskItem>): Promise<TaskItem> {
  try {
    const res = await fetchNestApi<TaskItem>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  } catch {
    const id = `task-${Date.now()}`;
    const nextNum = Math.floor(Math.random() * 900) + 100;
    const newTask: TaskItem = {
      id,
      code: `CV-1983-${nextNum}`,
      title: data.title || 'Công việc mới',
      department: data.department || 'Ban Quản trị & Thư ký',
      assignee: data.assignee || { name: 'Người quản trị', role: 'Phụ trách' },
      supervisor: data.supervisor || { name: 'Ban Quản trị', role: 'Giám sát' },
      status: (data.status as TaskStatus) || 'TODO',
      priority: (data.priority as TaskPriority) || 'MEDIUM',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      progress: data.progress ?? 0,
      description: data.description || '',
      deliverables: data.deliverables || '',
      subtasks: data.subtasks || [],
      attachments: data.attachments || [],
      comments: [],
      history: [
        {
          id: `h-${Date.now()}`,
          action: 'Tạo công việc mới',
          actor: 'Người quản trị',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(newTask);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    }
    return newTask;
  }
}

export async function updateTask(id: string, data: Partial<TaskItem>): Promise<TaskItem> {
  try {
    return await fetchNestApi<TaskItem>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  } catch {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw) as TaskItem[];
        const idx = list.findIndex((t) => t.id === id || t.code === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
          return list[idx];
        }
      }
    }
    throw new Error('Không thể cập nhật công việc');
  }
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<TaskItem> {
  try {
    return await fetchNestApi<TaskItem>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch {
    return updateTask(id, { status, progress: status === 'DONE' ? 100 : undefined });
  }
}

export async function updateTaskProgress(id: string, progress: number): Promise<TaskItem> {
  try {
    return await fetchNestApi<TaskItem>(`/tasks/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress }),
    });
  } catch {
    const status: TaskStatus = progress >= 100 ? 'DONE' : progress > 0 ? 'IN_PROGRESS' : 'TODO';
    return updateTask(id, { progress, status });
  }
}

export async function addCommentToTask(
  id: string,
  content: string,
  authorName = 'Người quản trị',
): Promise<TaskItem> {
  try {
    return await fetchNestApi<TaskItem>(`/tasks/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, authorName }),
    });
  } catch {
    const task = await fetchTaskDetail(id);
    if (task) {
      task.comments.push({
        id: `cm-${Date.now()}`,
        authorName,
        content,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      });
      return updateTask(id, { comments: task.comments });
    }
    throw new Error('Không tìm thấy công việc');
  }
}

export async function toggleSubtask(taskId: string, subtaskId: string): Promise<TaskItem> {
  try {
    return await fetchNestApi<TaskItem>(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`, {
      method: 'PATCH',
    });
  } catch {
    const task = await fetchTaskDetail(taskId);
    if (task) {
      const sub = task.subtasks.find((s) => s.id === subtaskId);
      if (sub) {
        sub.completed = !sub.completed;
        const comp = task.subtasks.filter((s) => s.completed).length;
        const progress = Math.round((comp / task.subtasks.length) * 100);
        return updateTask(taskId, { subtasks: task.subtasks, progress });
      }
    }
    throw new Error('Không tìm thấy mục công việc');
  }
}

export async function deleteTask(id: string): Promise<boolean> {
  try {
    const res = await fetchNestApi<{ success: boolean }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  } catch {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        let list = JSON.parse(raw) as TaskItem[];
        list = list.filter((t) => t.id !== id && t.code !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        return true;
      }
    }
    return false;
  }
}
