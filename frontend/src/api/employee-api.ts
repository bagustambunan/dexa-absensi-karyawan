import axios from "axios";

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
