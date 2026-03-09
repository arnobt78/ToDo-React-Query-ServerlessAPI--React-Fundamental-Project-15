/**
 * api/tasks/index.js - Vercel serverless handler for GET and POST /api/tasks.
 * GET: returns { taskList: [...] }. POST: body { title }; returns { task: { id, title, isDone } }.
 * CORS and JSON responses are set via jsonResponse. Store is initialized once per invocation (taskStore).
 */
import {
  createTask,
  getTasks,
  initializeStore,
} from "../lib/taskStore.js";

// CORS headers so the browser allows requests from the frontend origin (same or different)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

// Helper: send JSON with status and attach CORS headers (Vercel uses Node-style req/res)
const jsonResponse = (res, statusCode, body) => {
  res.setHeader("Content-Type", "application/json");
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
  res.status(statusCode).end(JSON.stringify(body));
};

// Vercel invokes this for /api/tasks (no :id). req.method and req.body are provided by the platform.
export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    return res.status(200).end();
  }

  await initializeStore();

  if (req.method === "GET") {
    const taskList = await getTasks();
    return jsonResponse(res, 200, { taskList });
  }

  if (req.method === "POST") {
    try {
      // Vercel may parse body automatically; support both object and raw string
      const payload = typeof req.body === "object" ? req.body : (req.body ? JSON.parse(req.body) : {});
      const { title } = payload;
      if (!title) return jsonResponse(res, 400, { msg: "please provide title" });
      const task = await createTask(title);
      return jsonResponse(res, 200, { task });
    } catch (error) {
      console.error("POST Error:", error);
      return jsonResponse(res, 500, { msg: "something went wrong" });
    }
  }

  return jsonResponse(res, 405, { msg: "method not allowed" });
}
