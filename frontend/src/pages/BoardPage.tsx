import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useProjects } from '../context/ProjectContext';
import { KanbanColumn } from '../components/board/KanbanColumn';
import { NewTaskModal } from '../components/board/NewTaskModal';
import { NewProjectModal } from '../components/board/NewProjectModal';

interface BoardPageProps {
  isNewProjectModalOpen: boolean;
  setIsNewProjectModalOpen: (open: boolean) => void;
}

export const BoardPage: React.FC<BoardPageProps> = ({
  isNewProjectModalOpen,
  setIsNewProjectModalOpen,
}) => {
  const { filteredTasks } = useTasks();
  const { activeProject } = useProjects();
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // Группировка задач по статусам
  const activeTasks = filteredTasks.filter((t) => t.status === 'active' || !t.status);
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');
  const deletedTasks = filteredTasks.filter((t) => t.status === 'deleted');

  const projectName = activeProject ? activeProject.name : 'Учёба';
  const displayTitle = projectName === 'Учёба' ? 'Учёба - весенний семестр' : projectName;

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 font-medium mb-4">
        Мои проекты / {projectName}
      </div>

      {/* Title & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          {displayTitle}
        </h1>

        <button
          onClick={() => setIsNewTaskModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full bg-[#1d5bd8] text-white text-sm font-bold shadow-md hover:bg-[#1a50c0] hover:shadow-lg transition-all focus:outline-none shrink-0"
        >
          + Новая задача
        </button>
      </div>

      {/* 3 Kanban Columns */}
      <div className="flex flex-col lg:flex-row gap-6 items-start pb-12">
        <KanbanColumn
          status="active"
          title="Активные"
          tasks={activeTasks}
          dotColor="bg-[#2563eb]"
        />

        <KanbanColumn
          status="completed"
          title="Выполнены"
          tasks={completedTasks}
          dotColor="bg-[#22c55e]"
        />

        <KanbanColumn
          status="deleted"
          title="Удалены"
          tasks={deletedTasks}
          dotColor="bg-[#9ca3af]"
        />
      </div>

      {/* Modals */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
      />

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </div>
  );
};
