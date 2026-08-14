# Nexus — Messenger для портфолио

Красивый, минималистичный мессенджер в тёмной теме (в духе Discord/Telegram), работающий в реальном времени. Полноценный full-stack проект: **React + TypeScript + Vite + Tailwind** на фронтенде и **Node.js + Express + Socket.IO + SQLite** на бэкенде — в одном репозитории, но с возможностью деплоя по отдельности.

> Это рабочий продукт, а не учебный прототип: регистрация, JWT-авторизация, личные чаты, история сообщений, статусы «в сети», счётчики непрочитанного — всё реально работает и хранится в базе данных.

## Содержание

- [Возможности](#возможности)
- [Технологии](#технологии)
- [Структура проекта](#структура-проекта)
- [API](#api)
- [База данных](#база-данных)
- [Безопасность](#безопасность)
- [Запуск локально](#запуск-локально)
- [Как создать базу данных](#как-создать-базу-данных)
- [Публикация на GitHub & GitHub Pages](#публикация-на-github--github-pages)
- [Deploy бэкенда](#deploy-бэкенда)
- [Screenshots](#screenshots)
- [Future improvements](#future-improvements)

## Возможности

- **Регистрация и авторизация** с валидацией (email, длина и подтверждение пароля, уникальность username/email), пароли только в виде **bcrypt-хеша**.
- **JWT-авторизация**: токен в `localStorage`, сессия сохраняется после перезагрузки, защищённые роуты, выход.
- **Реальное время через Socket.IO**: сообщения появляются мгновенно у отправителя и получателя.
- **Личные чаты**: список диалогов, поиск собеседников, новый чат, аватар/username собеседника, статус.
- **История сообщений с пагинацией** («Загрузить ранее», по 30 штук).
- **Непрочитанные сообщения**: счётчик в списке чатов, «галочки прочитано».
- **Статусы**: онлайн / офлайн / был недавно — автоматически через вебсокет.
- **Профиль**: аватар (буква) + username, изменение данных.
- **Современный тёмный интерфейс**: адаптивность, hover-эффекты, анимации, skeleton loading, тосты.
- **CI на GitHub Actions**: lint, typecheck, сборка клиента и сервера при каждом push.

## Технологии

**Frontend (`client/`)** — React 18 + TypeScript, Vite, Tailwind CSS, React Router, Axios, Socket.IO Client.

**Backend (`server/`)** — Node.js + Express 4, TypeScript (`tsx`), Socket.IO, better-sqlite3, bcryptjs, jsonwebtoken, Zod, helmet + cors.
## Структура проекта

```
.
├── client/                     # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat/          # ChatList, ChatWindow, MessageBubble...
│   │   │   ├── common/        # Avatar, Spinner, Skeleton, Modal, Toast...
│   │   │   └── layout/        # Sidebar, UserMenu
│   │   ├── pages/             # Login, Register, Chat, Profile
│   │   ├── hooks/             # useAuth, useSocket, useToast
│   │   ├── services/          # api, auth, chats, users
│   │   ├── types/
│   │   └── utils/             # constants, format, validation
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── .env.example
│
├── server/                     # Node + Express backend
│   ├── src/
│   │   ├── controllers/       # auth, user, chat, message
│   │   ├── routes/            # REST-маршруты (+ index)
│   │   ├── middleware/        # auth (JWT), validate (Zod), errors
│   │   ├── models/            # user, conversation, message
│   │   ├── services/          # бизнес-логика
│   │   ├── database/          # connection, schema, seed
│   │   ├── socket/            # Socket.IO + online/emitter
│   │   └── utils/             # config, errors, validators
│   ├── .env.example
│   └── tsconfig.json
│
├── .github/workflows/ci.yml     # GitHub Actions CI
├── package.json                 # скрипты-помощники
└── README.md
```

## API

Все маршруты (кроме `auth/login`, `auth/register`) защищены middleware **JWT** — заголовок `Authorization: Bearer <token>`.

| Метод | Маршрут                                  | Описание                          |
|-------|------------------------------------------|-----------------------------------|
| POST  | `/api/auth/register`                     | Регистрация (username, email, password) |
| POST  | `/api/auth/login`                        | Вход (email, password)            |
| GET   | `/api/auth/me`                           | Текущий пользователь              |
| PUT   | `/api/auth/profile`                      | Обновить username/аватар          |
| GET   | `/api/users?search=`                     | Список пользователей + поиск      |
| GET   | `/api/users/:id`                         | Детали пользователя               |
| GET   | `/api/chats`                             | Список чатов (lastMessage, unread)|
| POST  | `/api/chats` `{userId}`                  | Создать/найти чат с пользователем |
| GET   | `/api/chats/:id/messages?before=&limit=` | История сообщений (пагинация)     |
| POST  | `/api/chats/:id/messages` `{content}`    | Отправить сообщение               |
| GET   | `/api/health`                            | Здоровье сервера                  |

**События Socket.IO:** `message:new` (новое сообщение), `message:read` (собеседник прочитал), `user:status` (онлайн/офлайн).
## База данных

Используется **better-sqlite3**, схема создаётся автоматически при старте сервера.

- `users` — id, username (unique), email (unique), password_hash, avatar, created_at, updated_at, last_seen
- `conversations` — id, created_at
- `conversation_members` — conversation_id + user_id (составной PK, связь многие-ко-многим)
- `messages` — id, conversation_id (FK), sender_id (FK), content, created_at, is_read

Включены внешние ключи (`foreign_keys = ON`) и индексы для частых запросов: по пользователю в чатах, по `(conversation_id, created_at)` для истории, частичный индекс для непрочитанных.

## Безопасность

- Пароли хранятся только как `bcrypt`-хеши (10 раундов).
- Авторизация через `jsonwebtoken`, секрет из `.env`.
- `helmet` + `cors` только для разрешённых origins.
- Валидация всех входных данных через **Zod**, ограничение размера JSON-тела.
- Секреты не лежат в коде — только в `.env` (+ пример в `.env.example`).
- Обработка ошибок на клиенте и сервере, юзерам не возвращаются пароли/хеши.

## Запуск локально

Требуется **Node.js 18+**.

```bash
# 1. Клонировать
git clone https://github.com/<ваш-username>/nexus-messenger.git
cd nexus-messenger

# 2. Переменные окружения
cp server/.env.example server/.env
cp client/.env.example client/.env
# В server/.env обязательно смените JWT_SECRET на случайную строку

# 3. Установить зависимости
npm run install:all

# 4. (Рекомендуется) Тестовые данные
npm run seed

# 5. Запуск (два терминала)
npm run dev:server   # http://localhost:4000
npm run dev:client   # http://localhost:5173
```

Откройте **http://localhost:5173**, зарегистрируйтесь (или войдите как `alex@example.com / password123`). Для проверки реального времени откройте два окна под разными аккаунтами.

Сборка: `npm run build:server` → `server/dist`, `npm run build:client` → `client/dist`.

## Как создать базу данных

База создаётся **автоматически** при первом запуске `npm run dev:server` (файл `server/data/messenger.db`). Для тестовых данных выполните `npm run seed`. Чтобы очистить — удалите `server/data/messenger.db` и перезапустите сервер.

## Публикация на GitHub & GitHub Pages

```bash
git init
git add .
git commit -m "feat: messenger with react, node, socket.io, sqlite"
git branch -M main
git remote add origin https://github.com/<ваш-username>/nexus-messenger.git
git push -u origin main
```

**GitHub Pages умеет отдавать только статику** — Node-рантайм (Express + Socket.IO + SQLite) там запустить нельзя, поэтому бэкенд размещается отдельно (см. следующий раздел).

Фронтенд:

```bash
npm run build:client          # создаёт client/dist
cd client && npx gh-pages -d dist
```

Если репозиторий лежит в подкаталоге (`<username>.github.io/<repo>/`), задайте в `vite.config.ts` `base: '/<repo>/'`. Не забудьте на этапе сборки указать `VITE_API_URL=https://ваш-бэкенд` в `client/.env`, иначе фронт будет стучаться в `localhost:4000`.

## Deploy бэкенда

Бэкенд — обычное Node.js-приложение, размещается на любом хостинге с Node и постоянным хранилищем:

- **Railway / Render / Fly.io** — проще всего (Node runtime + Persistent Disk для SQLite).
- **VPS (DigitalOcean, Hetzner)** — полный контроль.

Шаги: `npm --prefix server run build`; перенесите `server/.env` (PORT, CLIENT_ORIGIN=https://<ваш-домен>, новый JWT_SECRET, DB_PATH); запустите `node server/dist/index.js`; в CORS укажите домен фронтенда.

## Screenshots

```markdown
![Мессенджер](screenshots/main.png)
![Новый чат](screenshots/new-chat.png)
![Профиль](screenshots/profile.png)
```

_Положите скриншоты в папку `screenshots/` и вставьте ссылки выше._

## Future improvements

- Групповые чаты и каналы.
- Push-уведомления и звук новых сообщений.
- Редактирование/удаление сообщений.
- Загрузка файлов и фото.
- End-to-end шифрование.
- Индикатор «печатает…».
- Dark/light темы.
- Аналитика использования.

## Лицензия

MIT. Используйте свободно для портфолио.