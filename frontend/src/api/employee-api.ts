import axios from "axios";
import { installAuthInterceptors } from "./auth-interceptors";

export const employeeApi = axios.create({
  baseURL: import.meta.env.VITE_EMPLOYEE_API_URL,
  timeout: 15000,
});

export function getAvatarSrc(avatarUrl?: string | null) {
  return avatarUrl ? employeeApi.getUri({ url: avatarUrl }) : undefined;
}

installAuthInterceptors(employeeApi);
