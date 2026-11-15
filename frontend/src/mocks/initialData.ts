import { Task, Project, UserProfile, NotificationSettings, NotificationItem, ReportData } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  { id: 'study', name: 'Учёба' },
  { id: 'diploma', name: 'Диплом' },
  { id: 'personal', name: 'Личное' },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    name: 'Реферат по Истории',
    description: 'Написать реферат на тему “Реформы Петра I”, не менее 15 страниц, с оформлением по ГОСТ',
    deadline: '2025-05-12',
    priority: 'high',
    status: 'active',
    date_created: '2025-05-01',
    project_id: 'study',
    subtasks: [
      { id: 'sub-1', title: 'Собрать источники', completed: true },
      { id: 'sub-2', title: 'Составить план', completed: true },
      { id: 'sub-3', title: 'Написать введение и основную часть', completed: false },
      { id: 'sub-4', title: 'Оформить список литературы', completed: false },
    ],
  },
  {
    id: '2',
    name: 'Домашка по матану',
    description: 'Решить задачи 1 - 15 из сборника, оформить в тетради по образцу',
    deadline: '2025-05-15',
    priority: 'medium',
    status: 'active',
    date_created: '2025-05-02',
    project_id: 'study',
    subtasks: [],
  },
  {
    id: '3',
    name: 'Прочитать главу 3',
    description: 'Учебник по философии, глава “Экзистенциализм”, конспект тезисно',
    deadline: '2025-05-12',
    priority: 'low',
    status: 'active',
    date_created: '2025-05-03',
    project_id: 'study',
    subtasks: [],
  },
  {
    id: '4',
    name: 'Курсовая по БД',
    description: 'Проектирование базы данных для интернет-магазина',
    deadline: '2025-05-05',
    priority: 'high',
    status: 'completed',
    date_created: '2025-04-25',
    project_id: 'study',
    subtasks: [
      { id: 'sub-db-1', title: 'Концептуальная схема', completed: true },
      { id: 'sub-db-2', title: 'Реализация в PostgreSQL', completed: true },
    ],
  },
  {
    id: '5',
    name: 'Курсовая по БД',
    description: 'Проектирование базы данных для интернет-магазина',
    deadline: '2025-05-01',
    priority: 'high',
    status: 'deleted',
    date_created: '2025-04-20',
    project_id: 'study',
    subtasks: [],
  },
];

export const INITIAL_USER: UserProfile = {
  id: 1,
  login: 'ivan_i',
  name: 'Иван Иванов',
  email: 'Sergek27@mail.ru',
  phone: '88005553535',
  initials: 'ИИ.',
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Срок задачи близко',
    description: '«Реферат по истории» нужно сдать через 2 дня',
    unread: true,
    date: 'Сегодня',
  },
];

export const INITIAL_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailNotifications: false,
  pushNotifications: true,
  deadlineReminders: false,
  boardChanges: false,
};

export const INITIAL_REPORT: ReportData = {
  periodStart: '01.05.2025',
  periodEnd: '31.05.2025',
  totalTasks: 24,
  completedTasks: 18,
  progressPercent: 75,
  dailyStats: [
    { date: '01.05', percentage: 35 },
    { date: '04.05', percentage: 52 },
    { date: '07.05', percentage: 68 },
    { date: '10.05', percentage: 48 },
    { date: '13.05', percentage: 82 },
    { date: '16.05', percentage: 90 },
    { date: '19.05', percentage: 65 },
  ],
};
