import { useEffect } from "react";
import { message } from "antd";
import { isAxiosError } from "axios";
import { employeeApi } from "../../api/employee-api";

type ProfileNotification = {
  id: number;
  employeeId: string;
  employeeName: string;
  changedField: "PHOTO" | "PHONE" | "PASSWORD";
  createdAt: string;
};

const labels = { PHOTO: "foto", PHONE: "nomor HP", PASSWORD: "password" };

export default function AdminNotifications() {
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const controller = new AbortController();
    let timer: number | undefined;
    let cursor: number | undefined;
    let stopped = false;

    async function poll() {
      try {
        const { data } = await employeeApi.get<{
          items: ProfileNotification[];
          cursor: number;
        }>("/api/admin/notifications", {
          params: cursor === undefined ? undefined : { afterId: cursor },
          signal: controller.signal,
          timeout: 10000,
        });
        if (stopped || !sessionStorage.getItem("accessToken")) return;
        if (cursor !== undefined) {
          for (const item of data.items) {
            if (item.id <= cursor) continue;
            void messageApi.info({
              key: `profile-${item.id}`,
              content: `${item.employeeName} mengubah ${labels[item.changedField]}.`,
              duration: 6,
            });
          }
        }
        cursor = data.cursor;
      } catch (error) {
        if (
          isAxiosError(error) &&
          [401, 403].includes(error.response?.status ?? 0)
        ) {
          stopped = true;
          if (error.response?.status === 403) {
            void messageApi.error("Akses notifikasi ditolak.");
          }
        }
      } finally {
        if (!stopped && sessionStorage.getItem("accessToken")) {
          timer = window.setTimeout(poll, 3000);
        }
      }
    }

    void poll();
    return () => {
      stopped = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [messageApi]);

  return contextHolder;
}
