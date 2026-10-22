import axios from "axios";
import { message } from "antd";

export const attendanceApi = axios.create({
  baseURL: import.meta.env.VITE_ATTENDANCE_API_URL,
});

attendanceApi.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  } else {
    config.headers.delete("Authorization");
  }
  return config;
});

let redirectingToLogin = false;

attendanceApi.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("user");
        if (
          !redirectingToLogin &&
          window.location.pathname.replace(/\/+$/, "") !== "/login"
        ) {
          redirectingToLogin = true;
          window.location.replace("/login");
        }
      } else if (error.response?.status === 403) {
        void message.error({ key: "api-forbidden", content: "Akses ditolak." });
      }
    }
    return Promise.reject(error);
  },
);
