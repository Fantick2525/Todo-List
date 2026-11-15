import React, { useState } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { useTasks } from '../../context/TaskContext';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
  const { createProject } = useProjects();
  const { setActiveProjectId } = useTasks();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const created = await createProject(name.trim());
      setActiveProjectId(created.id);
      setName('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Новый проект</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Математика"
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/30 focus:border-[#1d5bd8] transition-all"
            />
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
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
