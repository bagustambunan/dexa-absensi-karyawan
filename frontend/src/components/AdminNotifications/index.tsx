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
    let polling = false;
    let delay = 3000;

    async function poll() {
      if (
        stopped ||
        polling ||
        document.hidden ||
        !sessionStorage.getItem("accessToken")
      )
        return;
      window.clearTimeout(timer);
      polling = true;
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
        delay = 3000;
        if (cursor === undefined) {
          cursor = data.cursor;
          return;
        }
        if (document.hidden) return;
        const afterId = cursor;
        const items = data.items.filter((item) => item.id > afterId);
        if (items.length > 3) {
          void messageApi.info({
            key: "profile-updates",
            content: `${items.length} perubahan profil karyawan diterima.`,
            duration: 6,
          });
        } else {
          for (const item of items) {
            void messageApi.info({
              key: `profile-${item.id}`,
              content: `${item.employeeName} mengubah ${labels[item.changedField]}.`,
              duration: 6,
            });
          }
        }
        cursor = data.cursor;
      } catch (error) {
        if (stopped) return;
        if (
          isAxiosError(error) &&
          [401, 403].includes(error.response?.status ?? 0)
        ) {
          stopped = true;
          if (error.response?.status === 403) {
            void messageApi.error("Akses notifikasi ditolak.");
          }
        } else {
          delay = Math.min(delay * 2, 30000);
        }
      } finally {
        polling = false;
        if (
          !stopped &&
          !document.hidden &&
          sessionStorage.getItem("accessToken")
        ) {
          timer = window.setTimeout(poll, delay);
        }
      }
    }

    function onVisibilityChange() {
      window.clearTimeout(timer);
      if (!document.hidden) void poll();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    void poll();
    return () => {
      stopped = true;
      controller.abort();
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [messageApi]);

  return contextHolder;
}
