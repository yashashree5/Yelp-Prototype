import axios from "axios";

// In docker-compose, Nginx serves the frontend on port 5173 (mapped from container port 80)
// and proxies all API calls to the correct backend services.
// So all API calls go to the same origin — no port juggling needed.
export const api = axios.create({
  baseURL: "/",
  headers: { "Content-Type": "application/json" }
});

export default api;

// JWT interceptor — attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
