import {
  initializeStore,
  removeTask,
  updateTask,
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
  const taskId = req.query.id;
  if (!taskId) return jsonResponse(res, 400, { msg: "task id required" });

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    return res.status(200).end();
  }

  await initializeStore();

  if (req.method === "PATCH") {
    try {
      const payload = typeof req.body === "object" ? req.body : (req.body ? JSON.parse(req.body) : {});
      const { isDone } = payload;
      if (typeof isDone !== "boolean") return jsonResponse(res, 400, { msg: "please provide isDone boolean" });
      await updateTask(taskId, isDone);
      return jsonResponse(res, 200, { msg: "task updated" });
    } catch (error) {
      console.error("PATCH Error:", error);
      return jsonResponse(res, 500, { msg: "something went wrong" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await removeTask(taskId);
      return jsonResponse(res, 200, { msg: "task removed" });
    } catch (error) {
      console.error("DELETE Error:", error);
      return jsonResponse(res, 500, { msg: "something went wrong" });
    }
  }

  return jsonResponse(res, 405, { msg: "method not allowed" });
}
