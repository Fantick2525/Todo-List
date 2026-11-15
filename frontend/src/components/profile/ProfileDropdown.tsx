import React, { useEffect, useRef } from 'react';
import { User, BarChart2, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: 'board' | 'profile' | 'reports') => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

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
      className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* User Info Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-[#ef4444] text-white flex items-center justify-center font-bold text-sm shrink-0">
          {user.initials || 'ИИ.'}
        </div>
        <div className="overflow-hidden">
          <div className="font-bold text-gray-900 text-sm truncate">{user.name}</div>
          <div className="text-xs text-gray-500 truncate">{user.email}</div>
        </div>
      </div>

      <div className="border-t border-gray-100 my-1" />

      {/* Navigation Links */}
      <div className="py-1">
        <button
          onClick={() => {
            onNavigate('profile');
            onClose();
          }}
          className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-800 hover:bg-gray-50 transition-colors text-left"
        >
          <User className="w-4 h-4 text-gray-700" />
          <span className="font-medium">Профиль</span>
        </button>

        <button
          onClick={() => {
            onNavigate('reports');
            onClose();
          }}
          className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-800 hover:bg-gray-50 transition-colors text-left"
        >
          <BarChart2 className="w-4 h-4 text-gray-700" />
          <span className="font-medium">Отчеты</span>
        </button>
      </div>

      <div className="border-t border-gray-100 my-1" />

      {/* Logout */}
      <div className="p-2">
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="w-full px-3 py-2 flex items-center gap-2 text-sm text-[#ef4444] font-medium hover:bg-red-50 rounded-lg transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Выйти из аккаунта</span>
        </button>
      </div>
    </div>
  );
};
