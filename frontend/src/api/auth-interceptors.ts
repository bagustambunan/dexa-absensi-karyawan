import { isAxiosError, type AxiosInstance } from "axios";

let redirectingToLogin = false;

export function installAuthInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    } else {
      config.headers.delete("Authorization");
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        const pathname = error.config
          ? new URL(
              client.getUri(error.config),
              window.location.origin,
            ).pathname.replace(/\/+$/, "")
          : "";
        const isLogin =
          error.config?.method?.toLowerCase() === "post" &&
          pathname === "/api/auth/login";

        if (!isLogin) {
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("user");
          if (
            !redirectingToLogin &&
            window.location.pathname.replace(/\/+$/, "") !== "/login"
          ) {
            redirectingToLogin = true;
            window.location.replace("/login");
          }
        }
      }
      return Promise.reject(error);
    },
  );
}
