import React, { useState } from 'react';
import { INITIAL_REPORT } from '../mocks/initialData';

interface ReportsPageProps {
  onBack: () => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onBack }) => {
  const [report] = useState(INITIAL_REPORT);
  const [startDate, setStartDate] = useState('01.05.2025');
  const [endDate, setEndDate] = useState('19.05.2025');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: подключить к API бэкенда для фильтрации отчетов за выбранный период
    console.log('Генерация отчета за период:', startDate, '—', endDate);
  };

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto max-w-5xl">
      {/* Back link */}
      <button
        onClick={onBack}
        className="text-[#1d5bd8] text-sm font-bold flex items-center gap-1.5 mb-6 hover:underline focus:outline-none"
      >
        <span>←</span>
        <span>Назад</span>
      </button>

      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
        Отчет за период: {report.periodStart} - {report.periodEnd}
      </h1>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Всего задач */}
        <div className="bg-white rounded-2xl p-6 border border-[#bfdbfe]/60 shadow-xs">
          <div className="text-sm font-semibold text-gray-500 mb-2">
            Всего задач
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            {report.totalTasks}
          </div>
        </div>

        {/* Card 2: Выполнено */}
        <div className="bg-white rounded-2xl p-6 border border-[#bfdbfe]/60 shadow-xs">
          <div className="text-sm font-semibold text-gray-500 mb-2">
            Выполнено
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            {report.completedTasks}
          </div>
        </div>

        {/* Card 3: Прогресс */}
        <div className="bg-white rounded-2xl p-6 border border-[#bfdbfe]/60 shadow-xs">
          <div className="text-sm font-semibold text-gray-500 mb-2">
            Прогресс
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            {report.progressPercent}%
          </div>
        </div>
      </div>

      {/* Chart: Динамика выполнения задач */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#bfdbfe]/60 shadow-xs mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-8">
          Динамика выполнения задач
        </h2>

        {/* Chart Container */}
        <div className="relative h-64 flex flex-col justify-between">
          {/* Y Axis Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-2">
            {[100, 75, 50, 25, 0].map((val) => (
              <div key={val} className="flex items-center w-full">
                <span className="w-10 text-[11px] text-gray-400 font-medium text-right pr-2">
                  {val}%
                </span>
                <div className="flex-1 border-b border-gray-200" />
              </div>
            ))}
          </div>

          {/* Bar Chart Columns */}
          <div className="relative h-full pl-12 flex items-end justify-around pt-3">
            {report.dailyStats.map((stat, idx) => (
              <div
                key={stat.date}
                className="flex flex-col items-center flex-1 max-w-[48px] h-full justify-end group cursor-pointer relative"
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Tooltip on hover */}
                {hoveredBar === idx && (
                  <div className="absolute -top-8 px-2 py-1 bg-gray-900 text-white text-[11px] font-bold rounded shadow-md z-10 whitespace-nowrap animate-in fade-in">
                    {stat.percentage}%
                  </div>
                )}

                {/* Vertical Bar */}
                <div
                  className="w-8 sm:w-10 bg-[#1d5bd8] rounded-t-lg transition-all duration-300 group-hover:bg-[#1a50c0]"
                  style={{ height: `${stat.percentage}%` }}
                />

                {/* X Axis Label */}
                <div className="text-[11px] text-gray-500 font-medium mt-3 whitespace-nowrap">
                  {stat.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bottom Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#bfdbfe]/60 shadow-xs">
        <form
          onSubmit={handleGenerate}
          className="flex flex-col sm:flex-row items-end gap-4 justify-between"
        >
          <div className="w-full sm:flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Начало периода
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="01.05.2025"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-[#1d5bd8] focus:border-[#1d5bd8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Конец периода
              </label>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="19.05.2025"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-[#1d5bd8] focus:border-[#1d5bd8]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1d5bd8] text-white text-sm font-bold shadow-sm hover:bg-[#1a50c0] transition-colors focus:outline-none shrink-0"
          >
            Сгенерировать отчет
          </button>
        </form>
      </div>
    </div>
  );
};
