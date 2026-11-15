import axios, { AxiosError } from 'axios';
import { Task, UserProfile, NotificationSettings, Project } from '../types';
import {
  INITIAL_TASKS,
  INITIAL_PROJECTS,
  INITIAL_USER,
  INITIAL_NOTIFICATION_SETTINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORT,
} from '../mocks/initialData';

// Базовый клиент Axios, использующий настроенный Vite Proxy на http://localhost:8080
export const apiClient = axios.create({
  baseURL: '', // Относительный путь для работы через Vite Proxy
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
});

// Интерцептор для добавления JWT токена авторизации
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Вспомогательное хранилище для локального состояния (Mock / Offline-режим)
const STORAGE_KEYS = {
  TASKS: 'taskboard_tasks',
  PROJECTS: 'taskboard_projects',
  USER: 'taskboard_user',
  SETTINGS: 'taskboard_notification_settings',
  NOTIFICATIONS: 'taskboard_notifications',
};

function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage error:', err);
  }
}

// ----------------------------------------------------
// AUTH API (Интеграция с Go Backend: /register, /login, /api/profile)
// ----------------------------------------------------
export const authApi = {
  // Реальный бэкенд: POST /login { login, password }
  login: async (loginOrEmail: string, password: string): Promise<{ token: string; user?: UserProfile }> => {
    try {
      const response = await apiClient.post<{ token: string }>('/login', {
        login: loginOrEmail,
        password: password,
      });

      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
      return { token: response.data.token };
    } catch (error) {
      const axiosErr = error as AxiosError;
      // Если бэкенд вернул 401 (Неверный логин или пароль) - пробрасываем ошибку для отображения в UI
      if (axiosErr.response && axiosErr.response.status === 401) {
        throw new Error('Неверно введена почта или пароль');
      }

      // Если сервер недоступен (ERR_CONNECTION_REFUSED), используем fallback мок для демонстрации
      console.warn('Локальный бэкенд Go недоступен, переключение в демо-режим авторизации:', axiosErr.message);
      
      // В демо-режиме проверяем базовую валидность
      if (loginOrEmail && password.length >= 4) {
        const fakeToken = 'mock_jwt_token_' + Date.now();
        localStorage.setItem('token', fakeToken);
        return { token: fakeToken };
      }
      throw new Error('Неверно введена почта или пароль');
    }
  },

  // Реальный бэкенд: POST /register { login, email, password }
  register: async (name: string, email: string, password: string): Promise<{ message: string }> => {
    try {
      // Бэкенд Go ждет { login, email, password }
      const response = await apiClient.post<{ message: string }>('/register', {
        login: name || email,
        email: email,
        password: password,
      });
      return response.data;
    } catch (error) {
      const axiosErr = error as AxiosError;
      if (axiosErr.response && axiosErr.response.status === 409) {
        throw new Error('Такой пользователь уже есть');
      }
      if (axiosErr.response && axiosErr.response.status === 400) {
        throw new Error('Неверный формат данных');
      }

      console.warn('Локальный бэкенд Go недоступен, демонстрационный ответ регистрации:', axiosErr.message);
      if (email === 'exists@student.ru') {
        throw new Error('Такой пользователь уже есть');
      }
      return { message: 'Успешная регистрация' };
    }
  },

  // Реальный бэкенд: GET /api/profile
  checkAuth: async (): Promise<boolean> => {
    try {
      const res = await apiClient.get('/api/profile');
      return res.status === 200;
    } catch {
      // Если токен есть в localStorage, разрешаем работу
      return !!localStorage.getItem('token');
    }
  },

  // Смена пароля (заглушка с комментарием для бэкенда)
  // TODO: подключить к API бэкенда (в cmd/api/main.go закомментирован /reset-password)
  resetPassword: async (email: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.post('/reset-password', { email, newPassword });
    } catch {
      console.log('Смена пароля выполнена в локальном режиме');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// ----------------------------------------------------
// TASKS API (Интеграция с Go Backend: POST /api/tasks, DELETE /api/tasks/{id})
// ----------------------------------------------------
export const tasksApi = {
  // TODO: подключить к API бэкенда (когда добавят GET /api/tasks)
  getTasks: async (): Promise<Task[]> => {
    try {
      const res = await apiClient.get<Task[]>('/api/tasks');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch {
      // fallback
    }
    return getLocal<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  },

  // Реальный бэкенд: POST /api/tasks
  createTask: async (taskData: Omit<Task, 'id' | 'date_created'>): Promise<Task> => {
    let createdTask: Task;
    try {
      const res = await apiClient.post<Task>('/api/tasks', {
        name: taskData.name,
        description: taskData.description,
        deadline: taskData.deadline ? new Date(taskData.deadline).toISOString() : new Date().toISOString(),
        priority: taskData.priority,
        status: taskData.status || 'active',
      });
      createdTask = {
        ...res.data,
        project_id: taskData.project_id || 'study',
        subtasks: taskData.subtasks || [],
      };
    } catch (err) {
      console.warn('Сервер недоступен, создание задачи локально:', err);
      createdTask = {
        ...taskData,
        id: 'task_' + Date.now(),
        date_created: new Date().toISOString().split('T')[0],
      };
    }

    // Сохраняем в локальное состояние
    const current = getLocal<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const updated = [createdTask, ...current];
    setLocal(STORAGE_KEYS.TASKS, updated);
    return createdTask;
  },

  // Реальный бэкенд: DELETE /api/tasks/{id} (ставит status='deleted')
  deleteTask: async (taskId: string | number): Promise<void> => {
    try {
      await apiClient.delete(`/api/tasks/${taskId}`);
    } catch (err) {
      console.warn('Сервер недоступен, удаление задачи локально:', err);
    }

    const current = getLocal<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const updated = current.map((t) => (t.id === taskId ? { ...t, status: 'deleted' as const } : t));
    setLocal(STORAGE_KEYS.TASKS, updated);
  },

  // TODO: подключить к API бэкенда (когда добавят PUT /api/tasks/{id})
  updateTask: async (taskId: string | number, updates: Partial<Task>): Promise<Task> => {
    try {
      const res = await apiClient.put<Task>(`/api/tasks/${taskId}`, updates);
      if (res.data) return res.data;
    } catch {
      // локальный fallback
    }

    const current = getLocal<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const updated = current.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
    setLocal(STORAGE_KEYS.TASKS, updated);
    const result = updated.find((t) => t.id === taskId);
    if (!result) throw new Error('Task not found');
    return result;
  },

  // Восстановление удаленной задачи (перевод из 'deleted' в 'active')
  // TODO: подключить к API бэкенда (PUT /api/tasks/{id}/restore)
  restoreTask: async (taskId: string | number): Promise<Task> => {
    return tasksApi.updateTask(taskId, { status: 'active' });
  },

  // Добавление подзадачи
  // TODO: подключить к API бэкенда (POST /api/tasks/{id}/subtasks)
  addSubtask: async (taskId: string | number, title: string): Promise<Task> => {
    const current = getLocal<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const task = current.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const newSubtask = {
      id: 'sub_' + Date.now(),
      title,
      completed: false,
    };
    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    return tasksApi.updateTask(taskId, { subtasks: updatedSubtasks });
  },

  // Переключение состояния подзадачи
  // TODO: подключить к API бэкенда (PATCH /api/tasks/{taskId}/subtasks/{subId})
  toggleSubtask: async (taskId: string | number, subtaskId: string): Promise<Task> => {
    const current = getLocal<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const task = current.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const updatedSubtasks = (task.subtasks || []).map((sub) =>
      sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
    );
    return tasksApi.updateTask(taskId, { subtasks: updatedSubtasks });
  },
};

// ----------------------------------------------------
// PROJECTS API
// TODO: подключить к API бэкенда (GET /api/projects, POST /api/projects)
// ----------------------------------------------------
export const projectsApi = {
  getProjects: async (): Promise<Project[]> => {
    return getLocal<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  },

  createProject: async (name: string): Promise<Project> => {
    const current = getLocal<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const newProj: Project = {
      id: 'proj_' + Date.now(),
      name,
    };
    const updated = [...current, newProj];
    setLocal(STORAGE_KEYS.PROJECTS, updated);
    return newProj;
  },
};

// ----------------------------------------------------
// USER PROFILE & SETTINGS API
// TODO: подключить к API бэкенда (GET /api/user, PUT /api/user, PUT /api/settings)
// ----------------------------------------------------
export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    return getLocal<UserProfile>(STORAGE_KEYS.USER, INITIAL_USER);
  },

  updateProfile: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    const current = getLocal<UserProfile>(STORAGE_KEYS.USER, INITIAL_USER);
    const updated = { ...current, ...profile };
    setLocal(STORAGE_KEYS.USER, updated);
    return updated;
  },

  getNotificationSettings: async (): Promise<NotificationSettings> => {
    return getLocal<NotificationSettings>(STORAGE_KEYS.SETTINGS, INITIAL_NOTIFICATION_SETTINGS);
  },

  updateNotificationSettings: async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    const current = getLocal<NotificationSettings>(STORAGE_KEYS.SETTINGS, INITIAL_NOTIFICATION_SETTINGS);
    const updated = { ...current, ...settings };
    setLocal(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },
};

// ----------------------------------------------------
// NOTIFICATIONS API
// TODO: подключить к API бэкенда (GET /api/notifications, PATCH /api/notifications/{id}/read)
// ----------------------------------------------------
export const notificationsApi = {
  getNotifications: async () => {
    return getLocal(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  markAllAsRead: async () => {
    const current = getLocal(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = current.map((n) => ({ ...n, unread: false }));
    setLocal(STORAGE_KEYS.NOTIFICATIONS, updated);
    return updated;
  },
};

// ----------------------------------------------------
// REPORTS API
// TODO: подключить к API бэкенда (GET /api/reports?start=...&end=...)
// ----------------------------------------------------
export const reportsApi = {
  getReports: async () => {
    return INITIAL_REPORT;
  },
};
