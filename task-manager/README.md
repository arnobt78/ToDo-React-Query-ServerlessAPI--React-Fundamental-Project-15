# Task Manager | React Query + Serverless API - React, Vite, JavaScript Fundamental Project 15

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF)](https://vitejs.dev/)
[![React Query](https://img.shields.io/badge/React_Query-4.28-FF4154)](https://tanstack.com/query/latest)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

An educational fundamental project that pairs a Vite-powered React frontend with a colocated serverless API. It demonstrates fetching, mutating, and persisting data with React Query, plus browser localStorage for instant load and a Vercel-ready API in the same repo—ideal for learning and teaching full-stack React and serverless patterns.

- **Live Demo:** [https://task-manager-react-query.vercel.app/](https://task-manager-react-query.vercel.app/)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Endpoints & Routes](#api-endpoints--routes)
- [Components & Functionality](#components--functionality)
- [React Query & Data Flow](#react-query--data-flow)
- [Local Storage Persistence](#local-storage-persistence)
- [Reusing Components & Hooks](#reusing-components--hooks)
- [Deployment (Vercel)](#deployment-vercel)
- [Keywords](#keywords)
- [License](#license)
- [Happy Coding!](#happy-coding-)

---

## Features

- **CRUD task list** – Add tasks, mark them done, and delete them with immediate UI feedback.
- **React Query** – Caching, optimistic updates, and minimal refetches; cache seeded from localStorage for fast first paint.
- **Serverless REST API** – `/api/tasks` (GET, POST) and `/api/tasks/:id` (PATCH, DELETE) implemented as Vercel serverless functions in `api/`.
- **Seed data** – `api/tasks.data.json` is loaded on cold start so the list is non-empty by default.
- **localStorage sync** – Tasks are written to the browser key `react-query-task-manager` after fetch/mutations so refreshes show data instantly.
- **Toasts** – Success and error feedback via React Toastify (position: bottom-right).
- **ESLint** – Lint and fix with `npm run lint` and `npm run lint:fix`.

---

## Tech Stack

| Layer         | Technology                                                                                    |
| ------------- | --------------------------------------------------------------------------------------------- |
| **Frontend**  | React 18, Vite 7, React Query (@tanstack/react-query), React Toastify, Axios                  |
| **API**       | Node.js serverless (Vercel) in `api/tasks/` and `api/lib/taskStore.js`                        |
| **Storage**   | In-memory store + seed from `api/tasks.data.json`; optional `REMOTE_TASKS_API` for proxy mode |
| **Utilities** | nanoid, browser localStorage                                                                  |
| **Tooling**   | ESLint, ES Modules, npm                                                                       |

---

## Project Structure

```text
task-manager/
├── api/
│   ├── lib/
│   │   └── taskStore.js       # Shared store: init, getTasks, createTask, updateTask, removeTask
│   ├── tasks/
│   │   ├── index.js           # GET /api/tasks, POST /api/tasks
│   │   └── [id].js            # PATCH /api/tasks/:id, DELETE /api/tasks/:id
│   └── tasks.data.json        # Seed data (array of { id, title, isDone })
├── public/                    # Static assets (e.g. vite.svg favicon)
├── src/
│   ├── App.jsx                # Layout: ToastContainer, education text, Form, Items
│   ├── Form.jsx               # Input + "Add Task" button, useCreateTask
│   ├── Items.jsx              # useFetchTasks, loading/error/empty/list states
│   ├── SingleItem.jsx         # Checkbox, title, delete button; useEditTask, useDeleteTask
│   ├── reactQueryCustomHooks.jsx  # useFetchTasks, useCreateTask, useEditTask, useDeleteTask
│   ├── localStorageUtils.js   # readTasksFromStorage, writeTasksToStorage, removeTasksFromStorage
│   ├── utils.js               # Axios instance (baseURL from env or /api/tasks)
│   ├── index.css              # Global and component styles
│   └── main.jsx               # React root, QueryClientProvider, styles
├── index.html                 # Entry HTML, SEO meta, React mount
├── vercel.json                # buildCommand, outputDirectory, SPA rewrites
├── package.json
└── README.md
```

---

## Getting Started

1. **Install dependencies**

   ```bash
   cd task-manager
   npm install
   ```

2. **Run the development server**

   ```bash
   npm run dev
   ```

   Open `http://localhost:5173`. By default the app uses `/api/tasks` as the base URL (see [Environment Variables](#environment-variables)).

3. **Run the serverless API locally (optional)**

   ```bash
   npx vercel dev
   ```

   This runs both the Vite app and the `api/` routes so you can test the full stack locally.

---

## Environment Variables

The app runs without any `.env` file. Use environment variables to change the API base URL or to point the serverless store at a remote API.

### Frontend (Vite) – `.env` or `.env.local`

Create `.env` or `.env.local` in the `task-manager/` directory. Only variables prefixed with `VITE_` are exposed to the client.

| Variable            | Default      | Purpose                                                                                                                                                                                        |
| ------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `/api/tasks` | Base URL for all API requests. Use `/api/tasks` when deploying to Vercel. Use `http://localhost:5000/api/tasks` when using the Express reference backend in `task-manager-backend-reference/`. |

**Example `.env.local`**

```env
# Production (Vercel): use colocated serverless API
VITE_API_BASE_URL=/api/tasks
```

```env
# Local: use Express reference backend
VITE_API_BASE_URL=http://localhost:5000/api/tasks
```

Restart `npm run dev` after changing env vars.

### Serverless API (Vercel / server-side)

Set these in Vercel → Project → Settings → Environment Variables (or in `.env` for `vercel dev`). They are **not** exposed to the browser.

| Variable           | Default | Purpose                                                                                                                                    |
| ------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `REMOTE_TASKS_API` | (none)  | If set, the in-memory store proxies all operations to this base URL. Use when you want the serverless app to talk to an external task API. |

### Summary: achieving all required environment variables

- **Frontend only (default):** No `.env` needed; app uses `/api/tasks` and works when deployed to Vercel with the colocated API.
- **Frontend + Vercel:** Add `VITE_API_BASE_URL=/api/tasks` in Vercel’s Environment Variables so the built app targets the same-origin API.
- **Frontend + Express backend:** Run the backend from `task-manager-backend-reference/`, set `VITE_API_BASE_URL=http://localhost:5000/api/tasks` in `task-manager/.env.local`.
- **Serverless using remote API:** Set `REMOTE_TASKS_API` to the base URL of your task API (e.g. `https://your-api.com/api/tasks`).

---

## Available Scripts

| Command            | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `npm run dev`      | Start Vite dev server (default `http://localhost:5173`). |
| `npm run build`    | Production build; output in `dist/`.                     |
| `npm run preview`  | Serve the production build locally.                      |
| `npm run lint`     | Run ESLint on `src` (`.js`, `.jsx`).                     |
| `npm run lint:fix` | Run ESLint with `--fix`.                                 |

The `api/` directory is deployed as serverless functions by Vercel; no extra build step is required for the API.

---

## API Endpoints & Routes

All endpoints live under the base path `/api/tasks` (or whatever you set as `VITE_API_BASE_URL`). The serverless implementation is in `api/tasks/index.js` (list + create) and `api/tasks/[id].js` (update + delete).

### `GET /api/tasks`

Returns all tasks.

**Response**

```json
{
  "taskList": [
    { "id": "abc123", "title": "first task", "isDone": true },
    { "id": "def456", "title": "third task", "isDone": false }
  ]
}
```

### `POST /api/tasks`

Creates a task. Request body must include `title` (string).

**Request**

```http
POST /api/tasks
Content-Type: application/json

{ "title": "ship serverless" }
```

**Response**

```json
{
  "task": { "id": "xyz789", "title": "ship serverless", "isDone": false }
}
```

**Validation:** Missing or empty `title` returns `400` with `{ "msg": "please provide title" }`.

### `PATCH /api/tasks/:id`

Updates the task’s `isDone` flag. Request body must include `isDone` (boolean).

**Request**

```http
PATCH /api/tasks/xyz789
Content-Type: application/json

{ "isDone": true }
```

**Response**

```json
{ "msg": "task updated" }
```

**Validation:** Missing `id` or invalid `isDone` returns `400` with an appropriate message.

### `DELETE /api/tasks/:id`

Removes the task.

**Request**

```http
DELETE /api/tasks/xyz789
```

**Response**

```json
{ "msg": "task removed" }
```

---

## Components & Functionality

### `main.jsx`

- Creates React root and mounts the app inside `#root`.
- Wraps the tree in `QueryClientProvider` with a long-lived cache (`staleTime: Infinity`, no refetch on focus/mount).
- Imports global CSS and React Toastify styles.

### `App.jsx`

- Renders the main layout: `ToastContainer` (bottom-right), a short education paragraph, `Form`, and `Items`.
- Single-page layout; no router.

### `Form.jsx`

- Controlled input for the task title and an “Add Task” button.
- Uses `useCreateTask()`. On submit: calls the mutation; on success, clears the input and shows a toast. Button is disabled while `isLoading`.

### `Items.jsx`

- Uses `useFetchTasks()` to get `{ isLoading, isError, data }`.
- Renders: “Loading...”, “There was an error...”, “No tasks found...”, or the list of `SingleItem` components. Validates that `data.taskList` exists and is an array.

### `SingleItem.jsx`

- Receives `item` with `id`, `title`, `isDone`.
- Checkbox toggles `isDone` via `useEditTask`; title has strikethrough when `isDone`; delete button calls `useDeleteTask` and is disabled while `deleteTaskLoading`.

### `reactQueryCustomHooks.jsx`

- **useFetchTasks** – `queryKey: ["tasks"]`, `queryFn` calls `customFetch.get("")`, `initialData` from `readTasksFromStorage()`, `onSuccess` writes to localStorage, `onError` shows toast. `staleTime: Infinity`, `cacheTime: 24h`.
- **useCreateTask** – `mutationFn`: `customFetch.post("", { title })`. On success: updates cache with `setQueryData`, appends new task, writes to localStorage, toast.
- **useEditTask** – `mutationFn`: `customFetch.patch(\`/${taskId}\`, { isDone })`. On success: updates cache and localStorage.
- **useDeleteTask** – `mutationFn`: `customFetch.delete(\`/${taskId}\`)`. On success: removes task from cache and localStorage.

### `localStorageUtils.js`

- Key: `react-query-task-manager`.
- **readTasksFromStorage()** – Returns parsed array or `undefined` if missing/invalid or not in browser.
- **writeTasksToStorage(taskList)** – Saves `taskList` as JSON.
- **removeTasksFromStorage()** – Clears the key. Safe to call in non-browser (no-op).

### `utils.js`

- Exports an Axios instance with `baseURL`: `import.meta.env.VITE_API_BASE_URL || "/api/tasks"` (trailing slash removed). All API calls from the hooks use this instance.

---

## React Query & Data Flow

```jsx
// Fetch: cache-first, hydrate from localStorage, sync from API
const { isLoading, data, isError } = useFetchTasks();
// initialData: readTasksFromStorage() → { taskList: [...] }
// queryFn: GET baseURL → { taskList }
// onSuccess: writeTasksToStorage(result.taskList)

// Create
const { createTask, isLoading } = useCreateTask();
// mutationFn: POST baseURL, body: { title }
// onSuccess: setQueryData(["tasks"], ...), writeTasksToStorage(...), toast
```

Edit and delete mutations update the same cache and localStorage optimistically; no refetch is required for the UI to stay in sync.

---

## Local Storage Persistence

- **Key:** `react-query-task-manager`
- **When read:** On app load, `useFetchTasks` can use `initialData` from `readTasksFromStorage()` so the list appears immediately.
- **When written:** After a successful fetch or after create/edit/delete mutations, the hooks call `writeTasksToStorage(updatedTaskList)`.
- This gives a smooth experience across refreshes and reduces dependency on the server for the initial render.

---

## Reusing Components & Hooks

- **Form.jsx** – Use in any “add item” flow. Replace `useCreateTask` with another mutation or a callback prop to adapt to a different API or domain (e.g. notes, shopping list).
- **SingleItem.jsx** – Expects `item: { id, title, isDone }`. Swap `useEditTask`/`useDeleteTask` for props or other hooks to reuse in another project.
- **Hooks** – The four hooks assume the API contract described above. Point `customFetch` (via `VITE_API_BASE_URL`) to any backend that matches this contract to reuse the same UI.
- **localStorageUtils.js** – Change `STORAGE_KEY` and reuse in other React apps that need to persist a list in the browser.

---

## Deployment (Vercel)

1. Import the repository in Vercel and set **Root Directory** to `task-manager`.
2. Add environment variable: `VITE_API_BASE_URL=/api/tasks`.
3. Deploy. Vercel will:
   - Run `npm run build` (from `vercel.json` or defaults).
   - Publish the `dist/` output.
   - Deploy `api/` as serverless functions.
   - Apply rewrites so non-API routes serve `index.html` (SPA).

No separate backend server is required; the API is colocated in this project.

---

## Keywords

Task Bud, task manager, React Query, Vite, serverless API, Vercel, React 18, TanStack Query, Axios, localStorage, CRUD, optimistic updates, full-stack React, JavaScript, educational project, REST API.

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
