import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, NotificationSettings } from '../types';
import { authApi, userApi } from '../api';
import { INITIAL_USER, INITIAL_NOTIFICATION_SETTINGS } from '../mocks/initialData';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile;
  token: string | null;
  login: (loginOrEmail: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => Promise<void>;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (data: Partial<NotificationSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token') || 'demo_token');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(INITIAL_NOTIFICATION_SETTINGS);

  useEffect(() => {
    // Загрузка профиля и настроек
    userApi.getProfile().then(setUser);
    userApi.getNotificationSettings().then(setNotificationSettings);
  }, []);

  const login = async (loginOrEmail: string, password: string) => {
    const res = await authApi.login(loginOrEmail, password);
    setToken(res.token);
    // Обновим имя или email если применимо
    if (loginOrEmail.includes('@')) {
      setUser((prev) => ({ ...prev, email: loginOrEmail }));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    await authApi.register(name, email, password);
    // После успешной регистрации логинимся
    await login(email, password);
    setUser((prev) => ({ ...prev, name, email }));
  };

  const logout = () => {
    authApi.logout();
    setToken(null);
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    const updated = await userApi.updateProfile(data);
    setUser(updated);
  };

  const updateNotificationSettings = async (data: Partial<NotificationSettings>) => {
    const updated = await userApi.updateNotificationSettings(data);
    setNotificationSettings(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        user,
        token,
        login,
        register,
        logout,
        updateUser,
        notificationSettings,
        updateNotificationSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
