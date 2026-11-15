import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '' }) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#16a34a] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 font-medium w-8 text-right">
        {clamped}%
      </span>
    </div>
  );
};
