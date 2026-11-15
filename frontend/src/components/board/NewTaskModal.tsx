import React, { useState } from 'react';
import { ChevronDown, Folder } from 'lucide-react';
import { Priority } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { useProjects } from '../../context/ProjectContext';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose }) => {
  const { createTask, activeProjectId } = useTasks();
  const { projects } = useProjects();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [projectId, setProjectId] = useState(activeProjectId || 'study');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createTask({
        name: name.trim(),
        description: description.trim(),
        deadline: deadline || new Date().toISOString().split('T')[0],
        priority,
        status: 'active',
        project_id: projectId,
        subtasks: [],
      });
      setName('');
      setDescription('');
      setDeadline('');
      setPriority('medium');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 pb-4 border-b border-gray-200">
          Новая задача
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Название */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Название
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Подготовиться к экзамену"
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/30 focus:border-[#1d5bd8] transition-all"
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробности задачи..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/30 focus:border-[#1d5bd8] transition-all"
            />
          </div>

          {/* Row: Дедлайн и Приоритет */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Дедлайн
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="дд.мм.гггг"
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/30 focus:border-[#1d5bd8] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Приоритет
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full appearance-none px-4 py-3 rounded-2xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/30 focus:border-[#1d5bd8] transition-all cursor-pointer pr-10"
                >
                  <option value="high">🔴 Высокий</option>
                  <option value="medium">🟠 Средний</option>
                  <option value="low">🔵 Низкий</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Проект */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Проект
            </label>
            <div className="relative">
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full appearance-none px-4 py-3 pl-10 rounded-2xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/30 focus:border-[#1d5bd8] transition-all cursor-pointer pr-10"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Folder className="w-4 h-4 text-amber-500 fill-amber-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-2.5 rounded-full border border-gray-800 text-gray-800 text-sm font-semibold hover:bg-gray-50 transition-colors focus:outline-none"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-8 py-2.5 rounded-full bg-[#1d5bd8] text-white text-sm font-semibold hover:bg-[#1a50c0] transition-colors focus:outline-none disabled:opacity-50"
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
