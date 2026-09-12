import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("swell_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function wsUrl(token) {
  const base = BACKEND.replace(/^http/, "ws");
  return `${base}/api/ws/${token}`;
}
