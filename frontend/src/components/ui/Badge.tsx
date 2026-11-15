import React from 'react';
import { Priority, TaskStatus } from '../../types';

interface BadgeProps {
  type: Priority | TaskStatus | 'Готово' | 'Удалена';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, className = '' }) => {
  let text = '';
  let colorClasses = '';

  switch (type) {
    case 'high':
      text = 'Высокий';
      colorClasses = 'bg-[#ffe4e6] text-[#e11d48]'; // soft pink/red
      break;
    case 'medium':
      text = 'Средний';
      colorClasses = 'bg-[#ffedd5] text-[#ea580c]'; // soft orange
      break;
    case 'low':
      text = 'Низкий';
      colorClasses = 'bg-[#dbeafe] text-[#2563eb]'; // soft blue
      break;
    case 'completed':
    case 'Готово':
      text = 'Готово';
      colorClasses = 'bg-[#dcfce7] text-[#16a34a]'; // soft green
      break;
    case 'deleted':
    case 'Удалена':
      text = 'Удалена';
      colorClasses = 'bg-[#e2e8f0] text-[#64748b]'; // soft gray
      break;
    default:
      text = type;
      colorClasses = 'bg-gray-100 text-gray-700';
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${colorClasses} ${className}`}
    >
      {text}
    </span>
  );
};
