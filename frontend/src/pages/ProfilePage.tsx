import React, { useState } from 'react';
import { User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Switch } from '../components/ui/Switch';

interface ProfilePageProps {
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { user, updateUser, notificationSettings, updateNotificationSettings } = useAuth();

  // Profile form state
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [password, setPassword] = useState('***********************');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Notification settings state
  const [settings, setSettings] = useState(notificationSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser({
      name,
      email,
      phone,
    });
    await updateNotificationSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto max-w-4xl">
      {/* Back link */}
      <button
        onClick={onBack}
        className="text-[#1d5bd8] text-sm font-bold flex items-center gap-1.5 mb-6 hover:underline focus:outline-none"
      >
        <span>←</span>
        <span>Назад</span>
      </button>

      <form onSubmit={handleSaveAll} className="space-y-10">
        {/* Section: Личные данные */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <User className="w-6 h-6 text-gray-900" />
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Личные данные
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Avatar Column */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-[#1d5bd8] text-white flex items-center justify-center font-bold text-3xl shadow-md mb-5 select-none">
                {user.initials ? user.initials.replace('.', '') : 'ИИ'}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-full border border-gray-400 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  Загрузить
                </button>
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-full bg-[#ef4444] text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                >
                  Удалить
                </button>
              </div>
            </div>

            {/* Inputs Column */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  Имя профиля
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/30 focus:border-[#1d5bd8] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  Почта
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/30 focus:border-[#1d5bd8] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  Номер телефона
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/30 focus:border-[#1d5bd8] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  Пароль
                </label>
                <input
                  type="password"
                  value={isChangingPassword ? newPassword : password}
                  onChange={(e) => {
                    if (isChangingPassword) setNewPassword(e.target.value);
                    else setPassword(e.target.value);
                  }}
                  readOnly={!isChangingPassword}
                  placeholder={isChangingPassword ? 'Введите новый пароль' : ''}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d5bd8]/30 focus:border-[#1d5bd8] transition-all"
                />

                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="px-6 py-2 rounded-xl bg-[#1d5bd8] text-white text-xs font-bold hover:bg-[#1a50c0] transition-colors focus:outline-none"
                  >
                    {isChangingPassword ? 'Отменить смену' : 'Изменить пароль'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Уведомления */}
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-900" />
            <h2 className="text-xl font-bold text-gray-900">Уведомления</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs divide-y divide-gray-100 overflow-hidden">
            {/* Email */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-sm text-gray-900">Email - уведомления</div>
                <div className="text-xs text-gray-500">
                  Письма с напоминаниями на привязанную почту
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onChange={(checked) =>
                  setSettings((prev) => ({ ...prev, emailNotifications: checked }))
                }
              />
            </div>

            {/* Push */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-sm text-gray-900">Push - уведомления</div>
                <div className="text-xs text-gray-500">
                  Всплывающие уведомления в браузере и на мобильном устройстве
                </div>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onChange={(checked) =>
                  setSettings((prev) => ({ ...prev, pushNotifications: checked }))
                }
              />
            </div>

            {/* Deadline Reminders */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-sm text-gray-900">Напоминание о дедлайнах</div>
                <div className="text-xs text-gray-500">
                  Уведомлять заранее до истечения срока задач
                </div>
              </div>
              <Switch
                checked={settings.deadlineReminders}
                onChange={(checked) =>
                  setSettings((prev) => ({ ...prev, deadlineReminders: checked }))
                }
              />
            </div>

            {/* Board Changes */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-sm text-gray-900">Изменение на досках</div>
                <div className="text-xs text-gray-500">
                  Оповещения, когда вы или участники перемещают и меняют задачи
                </div>
              </div>
              <Switch
                checked={settings.boardChanges}
                onChange={(checked) =>
                  setSettings((prev) => ({ ...prev, boardChanges: checked }))
                }
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          {savedSuccess && (
            <span className="text-sm font-semibold text-[#16a34a] animate-in fade-in">
              Изменения успешно сохранены!
            </span>
          )}
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-2.5 rounded-full border border-gray-800 text-gray-800 text-sm font-semibold hover:bg-gray-50 transition-colors focus:outline-none"
          >
            Отменить
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 rounded-full bg-[#1d5bd8] text-white text-sm font-semibold hover:bg-[#1a50c0] transition-colors focus:outline-none"
          >
            Сохранить изменения
          </button>
        </div>
      </form>
    </div>
  );
};
