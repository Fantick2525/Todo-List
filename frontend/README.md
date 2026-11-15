# 🖥️ TaskBoard Frontend

Клиентская часть приложения **TaskBoard** (Канбан-доска задач), разработанная в соответствии с дизайн-макетами Figma.

## Стек технологий
- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Lucide React**
- **Axios**

## Доступные команды

```bash
# Установка зависимостей
npm install

# Запуск локального сервера разработки (Vite)
npm run dev

# Сборка проекта (TypeScript проверка + Vite Build)
npm run build

# Предпросмотр продакшн сборки
npm run preview
```

## Интеграция с бэкендом
В `vite.config.ts` настроен прокси для локального сервера Go:
- `/api` -> `http://localhost:8080/api`
- `/login` -> `http://localhost:8080/login`
- `/register` -> `http://localhost:8080/register`

Если бэкенд не запущен, приложение автоматически использует локальный кэш/демо-режим без сбоев.
