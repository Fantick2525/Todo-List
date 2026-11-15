import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task } from '../types';
import { tasksApi } from '../api';

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  createTask: (data: Omit<Task, 'id' | 'date_created'>) => Promise<Task>;
  updateTask: (id: string | number, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string | number) => Promise<void>;
  restoreTask: (id: string | number) => Promise<Task>;
  toggleSubtask: (taskId: string | number, subtaskId: string) => Promise<Task>;
  addSubtask: (taskId: string | number, title: string) => Promise<Task>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('study');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const refreshTasks = async () => {
    const list = await tasksApi.getTasks();
    setTasks(list);
  };

  useEffect(() => {
    refreshTasks();
  }, []);

  const createTask = async (data: Omit<Task, 'id' | 'date_created'>) => {
    const created = await tasksApi.createTask(data);
    await refreshTasks();
    return created;
  };

  const updateTask = async (id: string | number, updates: Partial<Task>) => {
    const updated = await tasksApi.updateTask(id, updates);
    await refreshTasks();
    return updated;
  };

  const deleteTask = async (id: string | number) => {
    await tasksApi.deleteTask(id);
    await refreshTasks();
  };

  const restoreTask = async (id: string | number) => {
    const restored = await tasksApi.restoreTask(id);
    await refreshTasks();
    return restored;
  };

  const toggleSubtask = async (taskId: string | number, subtaskId: string) => {
    const updated = await tasksApi.toggleSubtask(taskId, subtaskId);
    await refreshTasks();
    return updated;
  };

  const addSubtask = async (taskId: string | number, title: string) => {
    const updated = await tasksApi.addSubtask(taskId, title);
    await refreshTasks();
    return updated;
  };

  // Фильтрация по текущему проекту и поисковому запросу
  const filteredTasks = tasks.filter((t) => {
    const matchesProject = !t.project_id || t.project_id === activeProjectId;
    const matchesSearch =
      !searchQuery.trim() ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesSearch;
  });

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        activeProjectId,
        setActiveProjectId,
        searchQuery,
        setSearchQuery,
        createTask,
        updateTask,
        deleteTask,
        restoreTask,
        toggleSubtask,
        addSubtask,
        refreshTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};
