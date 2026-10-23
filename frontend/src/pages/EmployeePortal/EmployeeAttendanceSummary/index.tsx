import { useLatestRequest } from "../../../hooks/useLatestRequest";
import { useEffect, useState } from "react";
import { Alert, Button, Card, DatePicker, Form, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { isAxiosError } from "axios";
import PageWrapper from "../../../components/PageWrapper";
import { attendanceApi } from "../../../api/attendance-api";
import { workDateFormat } from "../../../utils";
import dayjs from "dayjs";
import AttendanceTable from "../../../components/AttendanceTable";
import type {
  AttendanceDay,
  AttendanceFilters,
  AttendanceFilterValues,
} from "../type";

export default function EmployeeAttendanceSummary() {
  const [attendance, setAttendance] = useState<AttendanceDay[]>([]);
  const [initialFilters] = useState(() => {
    const today = workDateFormat.format(new Date());
    return { from: `${today.slice(0, 8)}01`, to: today };
  });
  const [filters, setFilters] = useState<AttendanceFilters>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  const { runRequest, cancelRequest } = useLatestRequest();

  useEffect(() => {
    void runRequest(
      () =>
        attendanceApi.get<AttendanceDay[]>("/api/attendance/me", {
          params: filters,
        }),
      {
        onSuccess: ({ data }) => {
          setAttendance(data);
        },
        onError: (err: unknown) => {
          const status = isAxiosError(err) ? err.response?.status : undefined;
          setError(
            status === 403
              ? "Akses ditolak."
              : status === 400
                ? "Rentang tanggal tidak valid."
                : "Gagal memuat riwayat absensi. Silakan coba lagi.",
          );
        },
        onFinally: () => {
          setLoading(false);
        },
      },
    );
    return cancelRequest;
  }, [filters, reload, runRequest, cancelRequest]);

  return (
    <PageWrapper title="Summary Absen" subtitle="Lihat riwayat absensi.">
      <Card>
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          {error && (
            <Alert
              type="error"
              title={error}
              showIcon
              role="alert"
              action={
                <Button
                  onClick={() => {
                    setLoading(true);
                    setError("");
                    setReload((value) => value + 1);
                  }}
                >
                  Coba lagi
                </Button>
              }
            />
          )}
          <Form<AttendanceFilterValues>
            layout="inline"
            initialValues={{
              dates: [dayjs(initialFilters.from), dayjs(initialFilters.to)],
            }}
            onFinish={(values) => {
              const from = values.dates?.[0];
              const to = values.dates?.[1];
              setLoading(true);
              setError("");
              setFilters(
                from && to
                  ? {
                      from: from.format("YYYY-MM-DD"),
                      to: to.format("YYYY-MM-DD"),
                    }
                  : {},
              );
            }}
          >
            <Form.Item label="Pilih Tanggal" name="dates">
              <DatePicker.RangePicker format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
                loading={loading}
              >
                Cari
              </Button>
            </Form.Item>
          </Form>
          <AttendanceTable
            data={error ? [] : attendance}
            loading={loading}
            emptyText={
              error ? "Data tidak tersedia" : "Tidak ada absensi yang ditemukan"
            }
          />
        </Space>
      </Card>
    </PageWrapper>
  );
}
