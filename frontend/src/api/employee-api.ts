import axios from "axios";
import { message } from "antd";

export const employeeApi = axios.create({
  baseURL: import.meta.env.VITE_EMPLOYEE_API_URL,
});

employeeApi.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  } else {
    config.headers.delete("Authorization");
  }
  return config;
});

let redirectingToLogin = false;

employeeApi.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const pathname = error.config
        ? new URL(
            employeeApi.getUri(error.config),
            window.location.origin,
          ).pathname.replace(/\/+$/, "")
        : "";
      const isLogin =
        error.config?.method?.toLowerCase() === "post" &&
        pathname === "/api/auth/login";

      if (!isLogin && error.response?.status === 401) {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("user");
        if (
          !redirectingToLogin &&
          window.location.pathname.replace(/\/+$/, "") !== "/login"
        ) {
          redirectingToLogin = true;
          window.location.replace("/login");
        }
      } else if (!isLogin && error.response?.status === 403) {
        void message.error({ key: "api-forbidden", content: "Akses ditolak." });
      }
    }
    return Promise.reject(error);
  },
);
