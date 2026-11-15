import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';

type AuthMode = 'login' | 'register' | 'forgot_password';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const { login, register } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Error states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<'email' | 'password' | 'all' | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearErrors = () => {
    setErrorMessage(null);
    setErrorField(null);
    setSuccessMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!email || !password) {
      setErrorField('all');
      setErrorMessage('Неверно введена почта или пароль');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setErrorField('all');
      setErrorMessage((err as Error).message || 'Неверно введена почта или пароль');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (password.length < 8) {
      setErrorField('password');
      setErrorMessage('Пароль должен содержать минимум 8 символов');
      return;
    }

    if (password !== confirmPassword) {
      setErrorField('password');
      setErrorMessage('Пароль введен неправильно');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: unknown) {
      const msg = (err as Error).message;
      if (msg.includes('уже есть') || msg.includes('заняты')) {
        setErrorField('email');
        setErrorMessage('Такой пользователь уже есть');
      } else {
        setErrorField('all');
        setErrorMessage(msg || 'Ошибка регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (password.length < 8) {
      setErrorField('password');
      setErrorMessage('Пароль должен содержать минимум 8 символов');
      return;
    }

    if (password !== confirmPassword) {
      setErrorField('password');
      setErrorMessage('Пароль введен неправильно');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(email, password);
      setSuccessMessage('Пароль успешно изменен! Выполняется вход...');
      setTimeout(() => {
        setMode('login');
      }, 1500);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Ошибка смены пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#edf2f9]">
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* App Title */}
        <h1 className="text-3xl font-extrabold text-center text-[#173778] mb-8 tracking-tight">
          TaskBoard
        </h1>

        {/* Toggle Pill (Вход / Регистрация) */}
        {mode !== 'forgot_password' && (
          <div className="bg-[#e9ecef] p-1.5 rounded-2xl flex items-center mb-8">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                clearErrors();
              }}
              className={`flex-1 py-2.5 text-center text-sm font-bold rounded-xl transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-white text-[#1d5bd8] shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                clearErrors();
              }}
              className={`flex-1 py-2.5 text-center text-sm font-bold rounded-xl transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-white text-[#1d5bd8] shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Регистрация
            </button>
          </div>
        )}

        {/* --- ВХОД --- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Почта
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearErrors();
                }}
                placeholder="You@student.ru"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                  errorField === 'email' || errorField === 'all'
                    ? 'border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]'
                    : 'border-gray-300 focus:border-[#1d5bd8] focus:ring-1 focus:ring-[#1d5bd8]'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Пароль
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearErrors();
                }}
                placeholder="********"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                  errorField === 'password' || errorField === 'all'
                    ? 'border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]'
                    : 'border-gray-300 focus:border-[#1d5bd8] focus:ring-1 focus:ring-[#1d5bd8]'
                }`}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setMode('forgot_password');
                  clearErrors();
                }}
                className="text-xs font-semibold text-[#1d5bd8] hover:underline"
              >
                Забыли пароль?
              </button>
            </div>

            {errorMessage && (
              <div className="text-center text-xs font-bold text-[#ef4444] animate-in fade-in">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#1d5bd8] text-white font-bold text-base shadow-md hover:bg-[#1a50c0] active:scale-[0.99] transition-all focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        )}

        {/* --- РЕГИСТРАЦИЯ --- */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Имя
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearErrors();
                }}
                placeholder="Иванов Иван"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm transition-all focus:outline-none focus:border-[#1d5bd8] focus:ring-1 focus:ring-[#1d5bd8]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Почта
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearErrors();
                }}
                placeholder="You@student.ru"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                  errorField === 'email' || errorField === 'all'
                    ? 'border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]'
                    : 'border-gray-300 focus:border-[#1d5bd8] focus:ring-1 focus:ring-[#1d5bd8]'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Пароль
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearErrors();
                }}
                placeholder="Минимум 8 символов"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                  errorField === 'password' || errorField === 'all'
                    ? 'border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]'
                    : 'border-gray-300 focus:border-[#1d5bd8] focus:ring-1 focus:ring-[#1d5bd8]'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Повторите пароль
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearErrors();
                }}
                placeholder="Минимум 8 символов"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                  errorField === 'password' || errorField === 'all'
                    ? 'border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]'
                    : 'border-gray-300 focus:border-[#1d5bd8] focus:ring-1 focus:ring-[#1d5bd8]'
                }`}
              />
            </div>

            {errorMessage && (
              <div className="text-center text-xs font-bold text-[#ef4444] animate-in fade-in pt-1">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-[#1d5bd8] text-white font-bold text-base shadow-md hover:bg-[#1a50c0] active:scale-[0.99] transition-all focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
        )}

        {/* --- СМЕНА ПАРОЛЯ --- */}
        {mode === 'forgot_password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Почта
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearErrors();
                }}
                placeholder="You@student.ru"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm transition-all focus:outline-none focus:border-[#1d5bd8] focus:ring-1 focus:ring-[#1d5bd8]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Новый пароль
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearErrors();
                }}
                placeholder="Минимум 8 символов"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                  errorField === 'password' || errorField === 'all'
                    ? 'border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]'
                    : 'border-gray-300 focus:border-[#1d5bd8] focus:ring-1 focus:ring-[#1d5bd8]'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Повторите пароль
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearErrors();
                }}
                placeholder="Минимум 8 символов"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                  errorField === 'password' || errorField === 'all'
                    ? 'border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]'
                    : 'border-gray-300 focus:border-[#1d5bd8] focus:ring-1 focus:ring-[#1d5bd8]'
                }`}
              />
            </div>

            {errorMessage && (
              <div className="text-center text-xs font-bold text-[#ef4444] animate-in fade-in pt-1">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="text-center text-xs font-bold text-[#16a34a] animate-in fade-in pt-1">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-[#1d5bd8] text-white font-bold text-base shadow-md hover:bg-[#1a50c0] active:scale-[0.99] transition-all focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Сменить пароль'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  clearErrors();
                }}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800"
              >
                Вернуться к входу
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
