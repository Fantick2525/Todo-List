import React, { useState } from 'react';
import { Search, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { ProfileDropdown } from '../profile/ProfileDropdown';
import { INITIAL_NOTIFICATIONS } from '../../mocks/initialData';

interface HeaderProps {
  onNavigate: (page: 'board' | 'profile' | 'reports') => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useTasks();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications] = useState(INITIAL_NOTIFICATIONS);

  const hasUnread = notifications.some((n) => n.unread);

  return (
    <header className="h-18 bg-white border-b border-gray-100 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Brand Logo */}
      <div className="flex items-center gap-8">
        <button
          onClick={() => onNavigate('board')}
          className="text-2xl font-extrabold text-[#173778] tracking-tight hover:opacity-90 transition-opacity focus:outline-none"
        >
          TaskBoard
        </button>

        {/* Search Bar */}
        <div className="relative w-64 md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск задач..."
            className="block w-full pl-10 pr-4 py-2 border border-[#bfdbfe]/60 rounded-xl bg-[#eef4ff]/50 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/30 focus:border-[#1d5bd8] transition-all"
          />
        </div>
      </div>

      {/* Right: Notifications & User profile */}
      <div className="flex items-center gap-4 relative">
        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors relative focus:outline-none"
            aria-label="Уведомления"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ef4444] ring-2 ring-white" />
            )}
          </button>

          <NotificationDropdown
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            notifications={notifications}
          />
        </div>

        {/* User Pill / Profile Button */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-gray-50 transition-colors focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-[#ef4444] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user.initials || 'ИИ.'}
            </div>
            <span className="font-semibold text-gray-900 text-sm hidden sm:inline">
              {user.name.split(' ')[0]} {user.name.split(' ')[1] ? user.name.split(' ')[1][0] + '.' : ''}
            </span>
            {isProfileOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-700" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-700" />
            )}
          </button>

          <ProfileDropdown
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </header>
  );
};
