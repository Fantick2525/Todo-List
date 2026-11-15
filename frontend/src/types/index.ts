export type Priority = 'high' | 'medium' | 'low';

export type TaskStatus = 'active' | 'completed' | 'deleted';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string | number;
  user_id?: number;
  name: string;
  description: string;
  deadline: string; // ISO string or YYYY-MM-DD
  priority: Priority;
  status: TaskStatus;
  date_created: string;
  project_id: string;
  subtasks?: SubTask[];
}

export interface Project {
  id: string;
  name: string;
  badge?: string;
}

export interface UserProfile {
  id: string | number;
  login?: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  deadlineReminders: boolean;
  boardChanges: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  unread: boolean;
  date?: string;
}

export interface ReportData {
  periodStart: string;
  periodEnd: string;
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
  dailyStats: {
    date: string;
    percentage: number;
  }[];
}
