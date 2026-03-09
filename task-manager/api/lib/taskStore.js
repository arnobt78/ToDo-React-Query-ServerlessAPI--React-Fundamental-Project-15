/**
 * taskStore.js - Shared in-memory (or remote-proxy) store for the task list.
 * Used by api/tasks/index.js and api/tasks/[id].js. Modes: "memory" (default) or "remote".
 * Memory: seed from api/tasks.data.json on first use; persist in globalThis for the lifetime of the serverless instance.
 * Remote: if REMOTE_TASKS_API is set, all CRUD is forwarded to that URL; fallback to memory on failure.
 */
import { randomBytes } from "crypto";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ESM equivalent of __dirname for resolving the seed file path (Vercel serverless runs in Node)
const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_PATH = join(__dirname, "../tasks.data.json");

const STORE_KEY = "task-list";
const REMOTE_BASE_URL = process.env.REMOTE_TASKS_API || "";

// Fallback ID generator when nanoid package is unavailable in the serverless bundle (crypto is built-in)
const createFallbackNanoid =
  () =>
  (size = 21) => {
    let id = "";
    while (id.length < size) {
      id += randomBytes(size)
        .toString("base64")
        .replace(/[^a-zA-Z0-9]/g, "");
    }
    return id.slice(0, size);
  };

const fallbackNanoid = createFallbackNanoid();
let nanoid = fallbackNanoid;

// Prefer nanoid if importable; otherwise keep fallback (no exception thrown to caller)
const loadNanoid = async () => {
  try {
    const module = await import("nanoid/non-secure");
    if (typeof module.nanoid === "function") return module.nanoid;
  } catch (_) {}
  try {
    const module = await import("nanoid");
    if (typeof module.nanoid === "function") return module.nanoid;
  } catch (_) {}
  return fallbackNanoid;
};

loadNanoid()
  .then((fn) => {
    nanoid = fn;
  })
  .catch(() => {
    nanoid = fallbackNanoid;
  });

// Default tasks when seed file is missing or invalid (each task needs id, title, isDone)
const buildDefaultTasks = () => [
  { id: nanoid(), title: "walk the dog", isDone: false },
  { id: nanoid(), title: "wash dishes", isDone: false },
  { id: nanoid(), title: "drink coffee", isDone: true },
];

const FALLBACK_GLOBAL_KEY = "__taskBudFallbackStore__";

// Load seed from api/tasks.data.json; on error or invalid JSON use buildDefaultTasks()
const loadSeedTasks = async () => {
  try {
    const raw = await readFile(SEED_PATH, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : buildDefaultTasks();
  } catch (_) {
    return buildDefaultTasks();
  }
};

// Single in-memory container shared across invocations in the same serverless instance (globalThis)
const ensureFallbackContainer = () => {
  if (!globalThis[FALLBACK_GLOBAL_KEY]) {
    globalThis[FALLBACK_GLOBAL_KEY] = { tasks: null };
  }
  return globalThis[FALLBACK_GLOBAL_KEY];
};

let storageMode = "uninitialized";

// If REMOTE_TASKS_API is set, use it for all operations; otherwise we use memory
const useRemoteStorage = () => {
  if (!REMOTE_BASE_URL) return false;
  storageMode = "remote";
  return true;
};

const switchToMemoryStorage = (reason) => {
  storageMode = "memory";
  ensureFallbackContainer();
  if (reason) console.warn("Falling back to in-memory storage", reason);
};

// Return a copy of in-memory tasks or null if not yet seeded (caller may then seed)
const getMemoryTasks = () => {
  const container = ensureFallbackContainer();
  if (!container.tasks) return null;
  return [...container.tasks];
};

const setMemoryTasks = (tasks) => {
  const container = ensureFallbackContainer();
  container.tasks = tasks;
};

// Called at the start of each API handler. Idempotent: only runs once; seeds memory from JSON if needed.
export const initializeStore = async () => {
  if (storageMode !== "uninitialized") return;
  if (!useRemoteStorage()) {
    switchToMemoryStorage();
    const container = ensureFallbackContainer();
    if (!container.tasks) {
      container.tasks = await loadSeedTasks();
    }
  }
};

// HTTP client for remote store: GET/POST/PATCH/DELETE/PUT to REMOTE_TASKS_API + path
const remoteRequest = async (path = "", init = {}) => {
  if (!REMOTE_BASE_URL) throw new Error("REMOTE_TASKS_API not configured");
  const url = `${REMOTE_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Remote request failed: ${response.status} ${text}`);
  }
  if (response.status === 204) return null;
  return response.json();
};

// Internal: read from remote or memory; for remote, on failure we fall back to memory
const readTasks = async () => {
  if (storageMode === "remote") {
    try {
      const data = await remoteRequest();
      if (data && Array.isArray(data.taskList)) return data.taskList;
      return [];
    } catch (error) {
      switchToMemoryStorage(error);
    }
  }
  if (storageMode === "memory") {
    const tasks = getMemoryTasks();
    if (tasks) return tasks;
    const container = ensureFallbackContainer();
    if (!container.tasks) container.tasks = await loadSeedTasks();
    return [...container.tasks];
  }
  const container = ensureFallbackContainer();
  if (!container.tasks) container.tasks = await loadSeedTasks();
  return [...container.tasks];
};

const writeTasks = async (tasks) => {
  if (storageMode === "remote") {
    try {
      await remoteRequest("", {
        method: "PUT",
        body: JSON.stringify({ taskList: tasks }),
      });
      return;
    } catch (error) {
      switchToMemoryStorage(error);
    }
  }
  setMemoryTasks(tasks);
};

// Public API: return full task list (used by GET /api/tasks)
export const getTasks = async () => readTasks();

// Public API: create task with given title; returns the new task object { id, title, isDone }
export const createTask = async (title) => {
  const tasks = await readTasks();
  const newTask = { id: nanoid(), title, isDone: false };
  if (storageMode === "remote") {
    try {
      const data = await remoteRequest("", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      if (data?.task) return data.task;
    } catch (error) {
      switchToMemoryStorage(error);
    }
  }
  const updated = [...tasks, newTask];
  await writeTasks(updated);
  return newTask;
};

// Public API: set isDone for taskId; used by PATCH /api/tasks/:id
export const updateTask = async (taskId, isDone) => {
  const tasks = await readTasks();
  if (storageMode === "remote") {
    try {
      await remoteRequest(`/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ isDone }),
      });
      return true;
    } catch (error) {
      switchToMemoryStorage(error);
    }
  }
  const updated = tasks.map((task) =>
    task.id === taskId ? { ...task, isDone } : task
  );
  await writeTasks(updated);
  return true;
};

// Public API: delete task by id; used by DELETE /api/tasks/:id
export const removeTask = async (taskId) => {
  if (storageMode === "remote") {
    try {
      await remoteRequest(`/${taskId}`, { method: "DELETE" });
      return true;
    } catch (error) {
      switchToMemoryStorage(error);
    }
  }
  const tasks = await readTasks();
  const updated = tasks.filter((task) => task.id !== taskId);
  await writeTasks(updated);
  return true;
};
