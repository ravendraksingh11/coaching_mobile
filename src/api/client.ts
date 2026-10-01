import axios from "axios";
import { Platform } from "react-native";
import { secureStorage } from "../secureStorage";
import { useAuthStore } from "../store/authStore";

const fallbackBaseUrl = Platform.OS === "android"
  ? "http://10.0.2.2:5010/api"
  : "http://localhost:5010/api";

export const api = axios.create({
  baseURL: process.env.API_URL || fallbackBaseUrl,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await secureStorage.getItem("coaching_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await useAuthStore.getState().clearSession();
    }
    return Promise.reject(error);
  },
);
