import {
  createTask,
  getTasks,
  initializeStore,
} from "../lib/taskStore.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

const jsonResponse = (res, statusCode, body) => {
  res.setHeader("Content-Type", "application/json");
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
  res.status(statusCode).end(JSON.stringify(body));
};

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
