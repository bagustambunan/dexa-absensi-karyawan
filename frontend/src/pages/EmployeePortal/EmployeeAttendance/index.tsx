import { getRequestErrorMessage } from "../../../api/request-error";
import { useLatestRequest } from "../../../hooks/useLatestRequest";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, message, Space } from "antd";
import { isAxiosError } from "axios";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import PageWrapper from "../../../components/PageWrapper";
import { attendanceApi } from "../../../api/attendance-api";
import {
  clockFormat,
  dateFormat,
  renderTime,
  workDateFormat,
} from "../../../utils";
import type { AttendanceDay } from "../type";

export default function EmployeeAttendance() {
  const [now, setNow] = useState(() => new Date());
  const today = workDateFormat.format(now);
  const [attendance, setAttendance] = useState<AttendanceDay | null>(null);
  const [loadedDate, setLoadedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [pending, setPending] = useState<"check-in" | "check-out" | null>(null);

  const refreshAttendance = useCallback(() => {
    if (pending) return;
    setNow(new Date());
    setLoading(true);
    setError("");
    setReload((value) => value + 1);
  }, [pending]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden) refreshAttendance();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [refreshAttendance]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const { runRequest, cancelRequest } = useLatestRequest();

  useEffect(() => {
    void runRequest(
      () =>
        attendanceApi.get<AttendanceDay[]>("/api/attendance/me", {
          params: { from: today, to: today },
        }),
      {
        onSuccess: ({ data }) => {
          setAttendance(data.find((day) => day.date === today) ?? null);
          setLoadedDate(today);
          setError("");
        },
        onError: (err: unknown) => {
          setLoadedDate(today);
          setAttendance(null);
          setError(
            isAxiosError(err) && err.response?.status === 403
              ? "Akses ditolak."
              : getRequestErrorMessage(
                  err,
                  "Gagal memuat status absensi. Silakan coba lagi.",
                ),
          );
        },
        onFinally: () => {
          setLoading(false);
        },
      },
    );
    return cancelRequest;
  }, [today, reload, runRequest, cancelRequest]);

  const isLoading = loading || loadedDate !== today;
  const ready = !isLoading && !error && !pending;
  const current = loadedDate === today && !error ? attendance : null;

  async function submit(kind: "check-in" | "check-out") {
    if (!ready) return;
    setPending(kind);
    try {
      await attendanceApi.post(`/api/attendance/${kind}`, undefined);
      void message.success(
        kind === "check-in"
          ? "Absen masuk berhasil."
          : "Absen pulang berhasil.",
      );
    } catch (err: unknown) {
      const status = isAxiosError(err) ? err.response?.status : undefined;
      void message.error(
        status === 409
          ? kind === "check-in"
            ? "Sudah absen masuk hari ini."
            : "Sudah absen pulang hari ini."
          : status === 400
            ? "Absen masuk hari ini belum dilakukan."
            : status === 403
              ? "Akses ditolak."
              : getRequestErrorMessage(
                  err,
                  "Gagal menyimpan absensi. Status akan dimuat ulang.",
                ),
      );
    } finally {
      setPending(null);
      setLoading(true);
      setReload((value) => value + 1);
    }
  }

  return (
    <PageWrapper
      title="Absen"
      subtitle="Catat waktu masuk dan pulang untuk hari ini."
      extra={
        <Button
          icon={<ReloadOutlined />}
          loading={isLoading}
          disabled={pending !== null}
          onClick={refreshAttendance}
        >
          Muat Ulang Status
        </Button>
      }
    >
      <Card>
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          {error && (
            <Alert
              type="error"
              title={error}
              showIcon
              role="alert"
              action={<Button onClick={refreshAttendance}>Coba lagi</Button>}
            />
          )}
          <Card title="Hari Ini">
            <Space orientation="vertical">
              <Space>
                <CalendarOutlined />
                <span>{dateFormat.format(now)}</span>
              </Space>
              <Space>
                <ClockCircleOutlined />
                <span>{clockFormat.format(now)} WIB</span>
              </Space>
            </Space>
          </Card>
          {!isLoading && !error && !pending && (
            <Alert
              type={current?.checkOutAt ? "success" : "info"}
              showIcon
              role="status"
              title={
                current?.checkOutAt
                  ? "Sudah absen pulang"
                  : current?.checkInAt
                    ? "Sedang bekerja"
                    : "Belum absen masuk"
              }
              description={
                current?.checkOutAt
                  ? "Absen masuk dan pulang hari ini sudah tercatat."
                  : current?.checkInAt
                    ? "Absen masuk sudah tercatat."
                    : "Anda belum absen masuk hari ini."
              }
            />
          )}
          <div className="grid-2">
            <Card
              title="Jam Masuk (WIB)"
              loading={isLoading}
              extra={
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={pending === "check-in"}
                  disabled={!ready || !!current?.checkInAt}
                  onClick={() => void submit("check-in")}
                >
                  Absen Masuk
                </Button>
              }
            >
              <span className="attendance-time">
                {renderTime(current?.checkInAt ?? null)}
              </span>
            </Card>
            <Card
              title="Jam Pulang (WIB)"
              loading={isLoading}
              extra={
                <Button
                  type="primary"
                  icon={<LogoutOutlined />}
                  loading={pending === "check-out"}
                  disabled={
                    !ready || !current?.checkInAt || !!current?.checkOutAt
                  }
                  onClick={() => void submit("check-out")}
                >
                  Absen Pulang
                </Button>
              }
            >
              <span className="attendance-time">
                {renderTime(current?.checkOutAt ?? null)}
              </span>
            </Card>
          </div>
        </Space>
      </Card>
    </PageWrapper>
  );
}
