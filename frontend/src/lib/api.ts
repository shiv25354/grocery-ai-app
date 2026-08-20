import axios from "axios";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://10.120.133.170:8000";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export default api;
