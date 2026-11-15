# 📋 TaskBoard (Lean Todo List)

> Современная и интуитивная система управления задачами и проектами (Канбан-доска) с аналитикой, подзадачами и синхронизацией с бэкендом.

---

## 👥 Команда разработки

| Имя | GitHub | Роль |
| :--- | :--- | :--- |
| **Немцев Арсений** | [@Fantick2525](https://github.com/Fantick2525) | Team Lead / Backend |
| **Малахов Александр** | [@MrSashaassasin](https://github.com/MrSashaassasin) | Frontend Lead / Fullstack Integration |
| **Сендир-Оол Сергек** | [@Sergek06](https://github.com/Sergek06) | Backend Developer |
| **Кириченко Дмитрий** | [@Arruski](https://github.com/Arruski) | QA / Testing & Docs |

---

## 🚀 Технологический стек

### Frontend
- **Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Pixel-Perfect верстка по дизайн-макетам Figma)
- **Icons:** [Lucide React](https://lucide.dev/)
- **API Client:** [Axios](https://axios-http.com/) (с автоматическим переключением в Offline/Mock режим при недоступности локального бэкенда)

### Backend
- **Язык:** [Go (Golang)](https://go.dev/)
- **Роутинг:** `net/http` + CORS Middleware
- **Аутентификация:** JWT (`golang-jwt/jwt/v5`), хеширование паролей `bcrypt`
- **База данных:** [PostgreSQL 15](https://www.postgresql.org/)
- **Контейнеризация:** Docker & Docker Compose

---

## 🎨 Возможности и функционал (UI / UX)

1. **Канбан-доска задач:**
   - 3 колонки статусов: **Активные**, **Выполнены**, **Удалены**.
   - Приоритеты задач: **Высокий** (🔴), **Средний** (🟠), **Низкий** (🔵).
   - Интерактивный расчет прогресса в реальном времени на основе подзадач.
   - Раскрывающиеся карточки с чек-листом подзадач, метаданными и действиями.
   - Быстрое восстановление удаленных задач в один клик.
2. **Живой поиск:**
   - Мгновенная фильтрация задач по названию и описанию.
3. **Управление проектами:**
   - Проекты «Учёба», «Диплом», «Личное» и создание новых проектов через модальное окно.
4. **Аналитика и отчёты:**
   - Сводные карточки метрик: *Всего задач*, *Выполнено*, *Прогресс*.
   - Столбчатая интерактивная диаграмма динамики выполнения задач.
   - Фильтрация отчетов по диапазону дат.
5. **Профиль и уведомления:**
   - Просмотр и редактирование личных данных, смена пароля.
   - Тонкая настройка уведомлений: Email, Push, напоминания о дедлайнах, оповещения об изменениях.
   - Центр уведомлений в хедере с индикатором непрочитанных сообщений.
6. **Авторизация:**
   - Экраны Входа, Регистрации и Смены пароля с валидацией полей и отображением ошибок.

---

## 📁 Структура проекта

```
Todo-List/
├── backend/                  # Серверная часть на Go
│   ├── cmd/api/main.go       # Точка входа, CORS, роутинг
│   ├── internal/
│   │   ├── database/db.go    # Инициализация PostgreSQL и схемы
│   │   ├── handlers/         # Обработчики (auth, tasks)
│   │   ├── middleware/       # JWT Auth Middleware
│   │   └── models/           # Модели данных (User, Task)
│   ├── .env.example          # Пример переменных окружения
│   └── go.mod
│
├── frontend/                 # Клиентская часть на React + Vite
│   ├── src/
│   │   ├── api/              # Axios клиент и интеграция с бэкендом
│   │   ├── components/       # Переиспользуемые UI компоненты
│   │   │   ├── board/        # Канбан-колонки, карточки, модалки
│   │   │   ├── layout/       # Хедер, сайдбар
│   │   │   ├── notifications/# Выпадающее окно уведомлений
│   │   │   ├── profile/      # Меню профиля
│   │   │   └── ui/           # Базовые контролы (Badge, Switch, ProgressBar)
│   │   ├── context/          # Контексты React (Auth, Task, Project)
│   │   ├── pages/            # Страницы (Board, Auth, Profile, Reports)
│   │   └── types/            # TypeScript типы
│   ├── vite.config.ts        # Конфигурация Vite с Proxy на Go бэкенд
│   └── tailwind.config.js    # Настройки дизайн-системы
│
├── doc/                      # Документация проекта
├── docker-compose.yml        # Контейнер базы данных PostgreSQL
└── README.md
```

---

## 🛠️ Инструкция по запуску

### 1. Запуск базы данных
```bash
docker compose up -d
```
> Запускает PostgreSQL 15 на порту `5436` (пользователь `todo_user`, пароль `todo_password`, база `todo_db`).

### 2. Запуск бэкенда (Go)
```bash
cd backend
cp .env.example .env
go run cmd/api/main.go
```
> Бэкенд запустится на порту `http://localhost:8080`.

### 3. Запуск фронтенда (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
> Фронтенд запустится на `http://localhost:5173` с автоматическим проксированием запросов на бэкенд.
