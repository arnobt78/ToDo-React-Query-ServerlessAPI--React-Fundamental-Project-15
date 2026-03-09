// import axios from 'axios';

// const customFetch = axios.create({
//   baseURL: 'http://localhost:5000/api/tasks',
// });

// export default customFetch;

/**
 * utils.js - Single Axios instance for all task API calls.
 * baseURL comes from VITE_API_BASE_URL (Vite exposes env vars prefixed with VITE_) or defaults to /api/tasks.
 * Use /api/tasks when frontend and API are same origin (e.g. Vercel); use full URL for separate backend (e.g. Express).
 */
// Axios instance configuration for API calls
// This centralized configuration ensures all API requests use the correct base URL
import axios from "axios";

// Determine the API base URL based on environment (import.meta.env is Vite's way to expose env to client)
// Priority: 1. VITE_API_BASE_URL env variable (set in Netlify/Vercel), 2. Default to "/api/tasks"
// "/api/tasks" works with serverless functions deployed on Netlify/Vercel via redirects
const defaultBaseURL = import.meta.env.VITE_API_BASE_URL || "/api/tasks";

// Remove trailing slash if present
// Ensures consistent URL formatting (avoids issues with double slashes)
const cleanBaseURL = defaultBaseURL.replace(/\/$/, "");

// Create a configured Axios instance with the base URL
// All requests using this instance will automatically prepend the baseURL
// Example: customFetch.get("/") becomes GET request to "/api/tasks/"
const customFetch = axios.create({
  baseURL: cleanBaseURL,
});

export default customFetch;
