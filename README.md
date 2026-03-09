# React Query, Serverless API, & Express Reference Backend - React, Vite, JavaScript Fundamental Project 15

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF)](https://vitejs.dev/)
[![React Query](https://img.shields.io/badge/React_Query-4.28-FF4154)](https://tanstack.com/query/latest)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

This repository bundles two complementary projects for learning and instruction: a production-ready **Task Bud** app (React + Vite + serverless API) and an **Express.js reference backend**. Use it to explore full-stack patterns, code organization, and how to run the same API as serverless (Vercel) or as a traditional Node server as educational learning tutorial purpose. (task-manager folder is the main project which is running currently on vercel serverless api)

- **Live Demo:** [https://task-manager-react-query.vercel.app/](https://task-manager-react-query.vercel.app/)

---

## Table of Contents

- [Introduction](#introduction)
- [Task Manager (Task Bud – Frontend + Serverless API)](#task-manager-task-bud--frontend--serverless-api)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
  - [Environment Variables](#environment-variables)
  - [Available Scripts](#available-scripts)
  - [API Endpoints](#api-endpoints)
  - [Frontend Walkthrough](#frontend-walkthrough)
  - [React Query Data Flow](#react-query-data-flow)
  - [Local Storage Persistence](#local-storage-persistence)
  - [Reusing Components & Hooks](#reusing-components--hooks)
  - [Deployment Guide](#deployment-guide)
  - [Keywords](#keywords)
  - [Conclusion](#conclusion)
- [Task Manager Backend Reference (Express.js)](#task-manager-backend-reference-expressjs)
  - [Why Keep the Reference Backend](#why-keep-the-reference-backend)
  - [Structure & Technology](#structure--technology)
  - [Setup & Usage](#setup--usage)
  - [API Walkthrough](#api-walkthrough)
  - [Persistence Modes](#persistence-modes)
  - [Reuse Ideas](#reuse-ideas)
- [License](#license)
- [Happy Coding!](#happy-coding-)

---

## Introduction

This monorepo contains:

1. **`task-manager/`** – **Task Bud**: A full-stack task manager with a Vite + React frontend and colocated **Vercel serverless API** under `/api/tasks`. It uses React Query for data fetching, caching, and optimistic updates, plus browser `localStorage` for instant hydration. Ideal for learning serverless + React patterns and for deploying a single app to Vercel.

2. **`task-manager-backend-reference/`** – A standalone **Express.js** backend that implements the same REST API. It is not used in production deployment but is kept for education, local development with a traditional server, and as a reference for scaling to a dedicated backend (e.g., adding a database or auth).

Both the serverless API and the Express backend expose the same contract (`GET/POST /api/tasks`, `PATCH/DELETE /api/tasks/:id`), so you can switch the frontend between them by changing the API base URL.

---

## Task Manager (Task Bud – Frontend + Serverless API)

### Features

- **Vite-powered React app** with real-time task management (add, toggle complete, delete).
- **Serverless REST API** under `/api/tasks` (Vercel serverless functions in `task-manager/api/`).
- **React Query** for fetching, caching, optimistic updates, and minimal refetches.
- **localStorage** sync so tasks appear instantly on load and survive page refreshes.
- **Toast notifications** (React Toastify) for success and error feedback.
- **Seed data** from `api/tasks.data.json` so the list is non-empty on cold start.
- **ESLint** for consistent code quality; `npm run lint` and `npm run lint:fix` available.

---

### Tech Stack

| Layer         | Technology                                                                          |
| ------------- | ----------------------------------------------------------------------------------- |
| **Frontend**  | React 18, Vite 7, React Query (@tanstack/react-query), React Toastify, Axios        |
| **API**       | Node.js serverless functions (Vercel-style handlers in `api/tasks/`)                |
| **Storage**   | In-memory store (with optional `REMOTE_TASKS_API`), seed from `api/tasks.data.json` |
| **Utilities** | nanoid (IDs), browser localStorage                                                  |
| **Tooling**   | ES Modules, npm, ESLint                                                             |

---

### Project Structure

```bash
task-manager/
├── api/
│   ├── lib/
│   │   └── taskStore.js       # Shared store: in-memory + optional remote, seed from JSON
│   ├── tasks/
│   │   ├── index.js           # GET /api/tasks, POST /api/tasks
│   │   └── [id].js            # PATCH/DELETE /api/tasks/:id
│   └── tasks.data.json        # Seed data (loaded on cold start)
├── public/                    # Static assets (e.g. favicon)
├── src/
│   ├── App.jsx                # Root layout, toast container, education text, Form + Items
│   ├── Form.jsx               # Task creation form (useCreateTask)
│   ├── Items.jsx              # Task list (useFetchTasks), loading/error states
│   ├── SingleItem.jsx         # One task: checkbox + title + delete (useEditTask, useDeleteTask)
│   ├── reactQueryCustomHooks.jsx  # useFetchTasks, useCreateTask, useEditTask, useDeleteTask
│   ├── localStorageUtils.js   # readTasksFromStorage, writeTasksToStorage, removeTasksFromStorage
│   ├── utils.js               # Axios instance (base URL from VITE_API_BASE_URL or /api/tasks)
│   ├── index.css              # Global and component styles
│   └── main.jsx               # React root, QueryClientProvider, global CSS
├── index.html                 # Entry HTML, meta tags, React mount
├── vercel.json                # Build command, output dir, SPA rewrites
├── package.json
└── README.md
```

---

### Getting Started

1. **Install dependencies**

   ```bash
   cd task-manager
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

   Open `http://localhost:5173`. The app uses `/api/tasks` by default (see [Environment Variables](#environment-variables)). With `npx vercel dev` you can run the serverless API locally.

3. **Optional: run serverless API locally**

   ```bash
   npx vercel dev
   ```

   This serves both the Vite app and the `api/` routes so the frontend talks to the same endpoints as in production.

---

### Environment Variables

The app works without any `.env` file. Use environment variables when you need to change the API base URL or (on the server) point to a remote task API.

#### Frontend (Vite)

| Variable            | Default      | Purpose                                                                                                                                                                                                        |
| ------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `/api/tasks` | Base URL for all API requests. Set to `/api/tasks` when deploying to Vercel so the frontend uses the colocated serverless API. Use `http://localhost:5000/api/tasks` when using the Express reference backend. |

**Creating `.env` or `.env.local` (frontend)**

Create a file in `task-manager/` (e.g. `.env.local`) and restart the dev server:

```env
# Use colocated serverless API (default for Vercel)
VITE_API_BASE_URL=/api/tasks

# Or point to Express reference backend when running locally
# VITE_API_BASE_URL=http://localhost:5000/api/tasks
```

Vite only exposes variables prefixed with `VITE_` to the client. Do not put secrets here.

#### Serverless API (Vercel / server-side)

| Variable           | Default | Purpose                                                                                                                           |
| ------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `REMOTE_TASKS_API` | (none)  | If set, the serverless store proxies all reads/writes to this URL instead of using in-memory + seed. Useful for a shared backend. |

To set env vars in Vercel: Project → Settings → Environment Variables. Add `VITE_API_BASE_URL=/api/tasks` for the frontend; add `REMOTE_TASKS_API` only if you use a remote task API.

---

### Available Scripts

| Command            | Description                                |
| ------------------ | ------------------------------------------ |
| `npm run dev`      | Start Vite dev server (default port 5173). |
| `npm run build`    | Production build; output in `dist/`.       |
| `npm run preview`  | Serve the production build locally.        |
| `npm run lint`     | Run ESLint on `src` (`.js`, `.jsx`).       |
| `npm run lint:fix` | Run ESLint with auto-fix.                  |

Serverless routes in `api/` are deployed automatically by Vercel; no extra script is required.

---

### API Endpoints

The frontend expects these REST endpoints (implemented by the serverless handlers in `api/tasks/` or by the Express reference backend).

#### `GET /api/tasks`

Returns all tasks.

**Response**

```json
{
  "taskList": [{ "id": "abc123", "title": "walk the dog", "isDone": false }]
}
```

#### `POST /api/tasks`

Creates a task. Body must include `title`.

**Request**

```http
POST /api/tasks
Content-Type: application/json

{ "title": "Ship serverless" }
```

**Response**

```json
{
  "task": { "id": "xyz", "title": "Ship serverless", "isDone": false }
}
```

#### `PATCH /api/tasks/:id`

Updates the task’s `isDone` flag.

**Request**

```http
PATCH /api/tasks/xyz
Content-Type: application/json

{ "isDone": true }
```

**Response**

```json
{ "msg": "task updated" }
```

#### `DELETE /api/tasks/:id`

Deletes the task.

**Request**

```http
DELETE /api/tasks/xyz
```

**Response**

```json
{ "msg": "task removed" }
```

---

### Frontend Walkthrough

- **`main.jsx`** – Renders the app into `#root`, wraps it with `QueryClientProvider`, and imports global CSS and React Toastify styles. Query client is configured with long-lived cache and no automatic refetch on focus/mount.
- **`App.jsx`** – Root layout: `ToastContainer` (bottom-right), short education text, `Form`, and `Items`. No routing; single-page layout.
- **`Form.jsx`** – Controlled input and “Add Task” button. Uses `useCreateTask()`; on submit it calls the mutation and clears the input on success. Button is disabled while `isLoading`.
- **`Items.jsx`** – Uses `useFetchTasks()` to get `{ isLoading, isError, data }`. Renders loading/error/empty states or maps `data.taskList` to `SingleItem` components. Validates that `data.taskList` is an array.
- **`SingleItem.jsx`** – One task: checkbox (toggles `isDone` via `useEditTask`), title (strikethrough when done), delete button (uses `useDeleteTask`, disabled while `deleteTaskLoading`). Expects `item` with `id`, `title`, `isDone`.
- **`reactQueryCustomHooks.jsx`** – Defines `useFetchTasks`, `useCreateTask`, `useEditTask`, `useDeleteTask`. All use `customFetch` from `utils.js`. Fetch uses `initialData` from localStorage and syncs API result back to localStorage. Mutations update the React Query cache optimistically and sync to localStorage; toasts on success/error.
- **`localStorageUtils.js`** – Key `react-query-task-manager`. Exports `readTasksFromStorage()`, `writeTasksToStorage(taskList)`, `removeTasksFromStorage()`. Safe for non-browser (no-op if `window`/localStorage missing).
- **`utils.js`** – Builds Axios instance with `baseURL`: `import.meta.env.VITE_API_BASE_URL || "/api/tasks"`, trailing slash stripped. All API calls go through this instance.

---

### React Query Data Flow

```jsx
// Fetch: cache-first, hydrate from localStorage, then sync from API
const { isLoading, data, isError } = useFetchTasks();
// initialData: readTasksFromStorage() → { taskList }
// queryFn: customFetch.get("") → API response
// onSuccess: writeTasksToStorage(result.taskList)
// staleTime: Infinity, cacheTime: 24h

// Create: optimistic update + localStorage
const { createTask, isLoading } = useCreateTask();
// mutationFn: customFetch.post("", { title })
// onSuccess: setQueryData(["tasks"], old => ({ ...old, taskList: [...old.taskList, data.task] }))
//           writeTasksToStorage(updatedTaskList), toast.success("task added")
```

Mutations for edit and delete follow the same pattern: update cache and localStorage immediately, show toast; no refetch unless you add one.

---

### Local Storage Persistence

- Key: `react-query-task-manager`.
- On load, `useFetchTasks` can supply `initialData` from `readTasksFromStorage()`, so the list appears immediately.
- After a successful fetch or mutation, the hooks call `writeTasksToStorage(taskList)` so the next load has fresh data.
- This gives a smooth, “offline-friendly” feel without a separate offline database.

---

### Reusing Components & Hooks

- **`Form.jsx`** – Reusable for any “add item” flow. Swap `useCreateTask` for another mutation (e.g. different API or payload) or pass a callback prop.
- **`SingleItem.jsx`** – Expects `item: { id, title, isDone }`. Replace `useEditTask`/`useDeleteTask` with props or other hooks to reuse in another app (e.g. notes, shopping list).
- **Hooks** – `useFetchTasks` and the mutation hooks assume the API returns the shapes above. Point `customFetch` (via `VITE_API_BASE_URL`) to any backend that matches this contract to reuse the same UI.
- **`localStorageUtils.js`** – Change `STORAGE_KEY` and reuse in other React apps that need to persist a list in localStorage.

---

### Deployment Guide

#### Vercel (recommended)

1. Import the repo in Vercel and set **Root Directory** to `task-manager`.
2. Add environment variable: `VITE_API_BASE_URL=/api/tasks` (so the built frontend calls the colocated API).
3. Deploy. Vercel builds the Vite app and deploys `api/` as serverless functions; `vercel.json` defines the build and SPA rewrites.

#### Using the Express backend instead

Run the reference backend (see [Task Manager Backend Reference](#task-manager-backend-reference-expressjs)), set `VITE_API_BASE_URL=http://localhost:5000/api/tasks`, and use the frontend against it. No serverless API is required for local learning.

---

### Keywords

Task Bud, task manager, React Query, Vite, serverless API, Vercel, React 18, TanStack Query, Axios, localStorage, CRUD, optimistic updates, full-stack React, JavaScript, educational project.

---

### Conclusion

The `task-manager/` app (Task Bud) shows how to build a full-stack task list with a React frontend and a colocated Vercel serverless API. It is suitable for learning, teaching, and as a template for similar apps. The Express reference backend in the same repo provides the same API for local experimentation and as a stepping stone to a dedicated server.

---

## Task Manager Backend Reference (Express.js)

### Why Keep the Reference Backend

- Preserves the original Express implementation before serverless.
- Useful for learning middleware, routing, and persistence in Node.
- Starting point for scaling to a dedicated backend (database, auth, etc.) while keeping the same API contract.

The reference backend is **not** used in the Vercel deployment; the live app uses the serverless API in `task-manager/api/`.

---

### Structure & Technology

```bash
task-manager-backend-reference/
├── server.js            # In-memory task list (npm start)
├── localDataServer.js   # File-backed persistence via tasks.json
├── tasks.json           # Seed data
├── package.json         # Express, cors, morgan, nanoid, nodemon
└── README.md
```

- **Express.js** – Routes and middleware.
- **cors** – Allow the React app to call the API from another origin (e.g. localhost:5173).
- **morgan** – HTTP request logging.
- **nanoid** – Unique task IDs.
- **nodemon** – Auto-restart on file changes.

---

### Setup & Usage

```bash
cd task-manager-backend-reference
npm install

# In-memory server (default port 5000)
npm start

# File-backed server (reads/writes tasks.json)
npm run local-server
```

Optional `.env`: set `PORT=5000` (or another port). Frontend: set `VITE_API_BASE_URL=http://localhost:5000/api/tasks` in `task-manager/.env.local` and run `npm run dev` in `task-manager/`.

---

### API Walkthrough

Same as the serverless API:

- `GET /api/tasks` → `{ taskList }`
- `POST /api/tasks` → body `{ title }`, returns `{ task }`
- `PATCH /api/tasks/:id` → body `{ isDone }`, returns `{ msg: "task updated" }`
- `DELETE /api/tasks/:id` → returns `{ msg: "task removed" }`

Unmatched routes can return a 404 message (e.g. “Route does not exist”).

---

### Persistence Modes

| File                 | Description                     | Use case                        |
| -------------------- | ------------------------------- | ------------------------------- |
| `server.js`          | In-memory array, seeded on boot | Quick demos                     |
| `localDataServer.js` | Reads/writes `tasks.json`       | Local dev with file persistence |

---

### Reuse Ideas

- Plug these routes into a larger Express app.
- Replace the in-memory array with a database (MongoDB, PostgreSQL, Prisma, etc.).
- Add auth, pagination, or filtering. The frontend only cares about the URL and response shape; switch between serverless and Express by changing `VITE_API_BASE_URL`.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code as per the terms of the license.

---

## Happy Coding! 🎉

This is an **open-source project** — feel free to use, enhance, and extend it further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://www.arnobmahmud.com](https://www.arnobmahmud.com).

**Enjoy building and learning!** 🚀

Thank you! 😊

---
