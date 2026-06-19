import axios from "axios";

const baseURL =
  typeof window === "undefined"
    ? "http://backend:8080/api"
    : process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});