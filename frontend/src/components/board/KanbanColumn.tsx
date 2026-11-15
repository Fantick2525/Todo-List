import React from 'react';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  dotColor: string;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  tasks,
  dotColor,
}) => {
  return (
    <div className="flex-1 min-w-[280px] max-w-[380px] flex flex-col gap-3">
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-1 px-1">
        <span className={`w-3 h-3 rounded-full ${dotColor} shrink-0`} />
        <h3 className="font-bold text-gray-900 text-base">{title}</h3>
        <span className="bg-[#cbd5e1]/80 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-0.5">
          {tasks.length}
        </span>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-3 min-h-[300px]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};
