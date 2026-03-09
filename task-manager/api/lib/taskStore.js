import { randomBytes } from "crypto";

const STORE_KEY = "task-list";
const REMOTE_BASE_URL = process.env.REMOTE_TASKS_API || "";

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

const buildDefaultTasks = () => [
  { id: nanoid(), title: "walk the dog", isDone: false },
  { id: nanoid(), title: "wash dishes", isDone: false },
  { id: nanoid(), title: "drink coffee", isDone: true },
];

const FALLBACK_GLOBAL_KEY = "__taskBudFallbackStore__";

const ensureFallbackContainer = () => {
  if (!globalThis[FALLBACK_GLOBAL_KEY]) {
    globalThis[FALLBACK_GLOBAL_KEY] = { tasks: buildDefaultTasks() };
  }
  return globalThis[FALLBACK_GLOBAL_KEY];
};

let storageMode = "uninitialized";

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

export const initializeStore = async () => {
  if (storageMode !== "uninitialized") return;
  if (!useRemoteStorage()) switchToMemoryStorage();
};

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
    const container = ensureFallbackContainer();
    return [...container.tasks];
  }
  const container = ensureFallbackContainer();
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
  const container = ensureFallbackContainer();
  container.tasks = tasks;
};

export const getTasks = async () => readTasks();

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
