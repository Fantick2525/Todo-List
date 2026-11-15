import React, { useEffect, useRef } from 'react';
import { NotificationItem } from '../../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-base">Уведомления</h3>
      </div>

      <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">Нет новых уведомлений</div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-gray-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-900 text-sm">{item.title}</span>
                {item.unread && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
