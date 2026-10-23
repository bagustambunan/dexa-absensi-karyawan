import axios from "axios";
import { installAuthInterceptors } from "./auth-interceptors";

export const attendanceApi = axios.create({
  baseURL: import.meta.env.VITE_ATTENDANCE_API_URL,
  timeout: 15000,
});

installAuthInterceptors(attendanceApi);
