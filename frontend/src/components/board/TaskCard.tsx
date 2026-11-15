import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Task } from '../../types';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { useTasks } from '../../context/TaskContext';
import { useProjects } from '../../context/ProjectContext';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(task.name);
  const [editDesc, setEditDesc] = useState(task.description);
  const [editDeadline, setEditDeadline] = useState(task.deadline);
  const [showDeadlineInput, setShowDeadlineInput] = useState(false);

  const { deleteTask, restoreTask, toggleSubtask, addSubtask, updateTask } = useTasks();
  const { projects } = useProjects();

  const isCompleted = task.status === 'completed';
  const isDeleted = task.status === 'deleted';

  // Расчет прогресса по подзадачам
  const subtasks = task.subtasks || [];
  const completedCount = subtasks.filter((s) => s.completed).length;
  const totalSubtasks = subtasks.length;
  const calculatedProgress =
    isCompleted
      ? 100
      : totalSubtasks > 0
      ? (completedCount / totalSubtasks) * 100
      : 0;

  // Цвет левой полосы
  const getBorderColor = () => {
    if (isCompleted) return 'border-l-[#22c55e]';
    if (isDeleted) return 'border-l-[#94a3b8]';
    if (task.priority === 'high') return 'border-l-[#ef4444]';
    if (task.priority === 'medium') return 'border-l-[#f97316]';
    return 'border-l-[#3b82f6]';
  };

  // Форматирование даты
  const formatDisplayDate = (d: string) => {
    if (!d) return '12 мая';
    try {
      const parts = d.split('-');
      if (parts.length === 3) {
        const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
        const day = parseInt(parts[2], 10);
        const month = months[parseInt(parts[1], 10) - 1];
        return `${day} ${month}`;
      }
    } catch {
      // fallback
    }
    return d;
  };

  const currentProjectName = projects.find((p) => p.id === task.project_id)?.name || 'Учёба';

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    await addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTask(task.id, {
      name: editName,
      description: editDesc,
      deadline: editDeadline,
    });
    setIsEditing(false);
    setShowDeadlineInput(false);
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-xs border border-gray-200/90 border-l-[5px] ${getBorderColor()} p-4 transition-all duration-200 hover:shadow-md relative overflow-hidden`}
    >
      {/* Top Header: Badge */}
      <div className="flex items-center justify-between mb-2.5">
        <Badge
          type={
            isCompleted ? 'Готово' : isDeleted ? 'Удалена' : task.priority
          }
        />
      </div>

      {/* Editing Mode */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="space-y-3 mb-3">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm font-bold"
          />
          <textarea
            rows={2}
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-3 py-1 bg-[#1d5bd8] text-white text-xs font-semibold rounded-lg"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 border border-gray-300 text-xs rounded-lg"
            >
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Title */}
          <h4
            className={`font-bold text-gray-900 text-sm mb-1.5 leading-snug ${
              isCompleted || isDeleted ? 'line-through text-gray-500' : ''
            }`}
          >
            {task.name}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              {task.description}
            </p>
          )}
        </>
      )}

      {/* Progress Bar (not shown in deleted) */}
      {!isDeleted && (
        <div className="mb-3">
          <ProgressBar progress={calculatedProgress} />
        </div>
      )}

      {/* Footer / Action */}
      {isDeleted ? (
        <div className="pt-2">
          <button
            onClick={() => restoreTask(task.id)}
            className="text-xs font-bold text-[#1d5bd8] hover:underline transition-all"
          >
            Восстановить
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-1">
          <span
            className={`text-xs font-medium ${
              isExpanded ? 'text-[#ef4444]' : 'text-gray-600'
            }`}
          >
            {formatDisplayDate(task.deadline)}
          </span>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-900 transition-colors p-1"
            aria-label={isExpanded ? 'Свернуть' : 'Раскрыть'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      )}

      {/* Expanded Details Section */}
      {isExpanded && !isDeleted && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-3 animate-in fade-in duration-150">
          {/* Metadata */}
          <div className="space-y-0.5 text-[11px] text-gray-500">
            <div>Создана: {task.date_created || '1 мая 2025'}</div>
            <div>Доска: {currentProjectName}</div>
          </div>

          {/* Subtasks */}
          <div className="pt-1">
            <div className="flex items-center justify-between font-semibold text-gray-800 text-xs mb-2">
              <span>Подзадачи</span>
              <span className="text-gray-500">
                {completedCount}/{totalSubtasks}
              </span>
            </div>

            <div className="space-y-1.5">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => toggleSubtask(task.id, sub.id)}
                  className="flex items-center gap-2 cursor-pointer group select-none"
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                      sub.completed
                        ? 'bg-[#1d5bd8] text-white'
                        : 'border border-gray-300 group-hover:border-gray-400 bg-white'
                    }`}
                  >
                    {sub.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs transition-colors ${
                      sub.completed
                        ? 'line-through text-gray-400'
                        : 'text-gray-800 group-hover:text-gray-900'
                    }`}
                  >
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Add Subtask Link / Form */}
            {isAddingSubtask ? (
              <form onSubmit={handleAddSubtask} className="mt-2 flex gap-1">
                <input
                  type="text"
                  autoFocus
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Новая подзадача..."
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1d5bd8]"
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-[#1d5bd8] text-white text-xs font-semibold rounded-lg"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingSubtask(false)}
                  className="px-2 py-1 text-xs text-gray-500"
                >
                  ✕
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingSubtask(true)}
                className="mt-2 text-xs font-medium text-[#1d5bd8] hover:underline"
              >
                + Добавить подзадачу...
              </button>
            )}
          </div>

          {/* Change Deadline input if opened */}
          {showDeadlineInput && (
            <div className="pt-2 flex gap-2 items-center">
              <input
                type="text"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                placeholder="дд.мм.гггг"
                className="px-2 py-1 border border-gray-300 rounded text-xs flex-1"
              />
              <button
                onClick={async () => {
                  await updateTask(task.id, { deadline: editDeadline });
                  setShowDeadlineInput(false);
                }}
                className="px-2 py-1 bg-[#1d5bd8] text-white rounded text-xs"
              >
                ОК
              </button>
            </div>
          )}

          {/* Bottom Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-1 border-t border-gray-100">
            <button
              onClick={() => setIsEditing(true)}
              className="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-700 text-[11px] font-medium hover:bg-gray-50 transition-colors"
            >
              Редактировать
            </button>
            <button
              onClick={() => setShowDeadlineInput(!showDeadlineInput)}
              className="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-700 text-[11px] font-medium hover:bg-gray-50 transition-colors"
            >
              Изменить срок
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="px-2.5 py-1 rounded-lg border border-gray-200 text-[#ef4444] text-[11px] font-medium hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              Удалить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
