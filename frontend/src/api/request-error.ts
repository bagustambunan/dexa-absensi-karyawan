import { isAxiosError } from "axios";

export function getRequestErrorMessage(error: unknown, fallback: string) {
  if (
    !isAxiosError(error) ||
    !["ECONNABORTED", "ETIMEDOUT"].includes(error.code ?? "")
  ) {
    return fallback;
  }

  const method = error.config?.method?.toLowerCase();
  return method && !["get", "head", "options"].includes(method)
    ? "Waktu tunggu habis. Hasil permintaan belum dapat dipastikan. Periksa status terbaru sebelum mencoba lagi."
    : "Waktu tunggu habis. Periksa koneksi dan coba lagi.";
}
