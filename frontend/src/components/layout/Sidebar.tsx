import React from 'react';
import { Folder, BarChart2 } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { useTasks } from '../../context/TaskContext';

interface SidebarProps {
  currentPage: 'board' | 'profile' | 'reports';
  onNavigate: (page: 'board' | 'profile' | 'reports') => void;
  onOpenNewProjectModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  onOpenNewProjectModal,
}) => {
  const { projects } = useProjects();
  const { activeProjectId, setActiveProjectId } = useTasks();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-[calc(100vh-4.5rem)] p-5 flex flex-col gap-6 shrink-0">
      {/* Section: Мои проекты */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-3 px-2">
          Мои проекты
        </h2>

        <div className="flex flex-col gap-1.5">
          {projects.map((project) => {
            const isActive = currentPage === 'board' && activeProjectId === project.id;
            return (
              <button
                key={project.id}
                onClick={() => {
                  setActiveProjectId(project.id);
                  onNavigate('board');
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                  isActive
                    ? 'bg-[#cfe0fc] text-[#1d4ed8]'
                    : 'text-gray-700 hover:bg-gray-100/70'
                }`}
              >
                <Folder className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b] shrink-0" />
                <span className="truncate">{project.name}</span>
              </button>
            );
          })}

          {/* "+ Новый проект" Button with dashed border */}
          <button
            onClick={onOpenNewProjectModal}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-400/80 rounded-xl text-xs font-semibold text-gray-600 hover:border-gray-500 hover:bg-gray-50 transition-all"
          >
            + Новый проект
          </button>
        </div>
      </div>

      {/* Section: Общее */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-3 px-2">
          Общее
        </h2>

        <button
          onClick={() => onNavigate('reports')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
            currentPage === 'reports'
              ? 'bg-[#cfe0fc] text-[#1d4ed8]'
              : 'text-gray-700 hover:bg-gray-100/70'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-gray-600 shrink-0" />
          <span>Отчёты</span>
        </button>
      </div>
    </aside>
  );
};
