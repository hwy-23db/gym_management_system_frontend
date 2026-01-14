import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const adminClient = axios.create({
  baseURL: BACKEND, // IMPORTANT: no /api here
  headers: {
    Accept: "application/json",
  },
});

// Attach Bearer token if you are using token auth
adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default adminClient;
