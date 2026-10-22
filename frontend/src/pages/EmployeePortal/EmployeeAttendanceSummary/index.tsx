import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Space,
  Table,
  type TableProps,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { isAxiosError } from "axios";
import PageWrapper from "../../../components/PageWrapper";
import { attendanceApi } from "../../../api/attendance-api";
import { renderTime } from "../../../utils";
import type {
  AttendanceDay,
  AttendanceFilters,
  AttendanceFilterValues,
} from "../type";

const columns: TableProps<AttendanceDay>["columns"] = [
  { title: "Tanggal", dataIndex: "date" },
  { title: "Waktu Masuk", dataIndex: "checkInAt", render: renderTime },
  { title: "Waktu Pulang", dataIndex: "checkOutAt", render: renderTime },
];

export default function EmployeeAttendanceSummary() {
  const [attendance, setAttendance] = useState<AttendanceDay[]>([]);
  const [filters, setFilters] = useState<AttendanceFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    attendanceApi
      .get<AttendanceDay[]>("/api/attendance/me", {
        params: filters,
      })
      .then(({ data }) => {
        setAttendance(data);
      })
      .catch((err: unknown) => {
        const status = isAxiosError(err) ? err.response?.status : undefined;
        setError(
          status === 403
            ? "Akses ditolak."
            : status === 400
              ? "Rentang tanggal tidak valid."
              : "Gagal memuat riwayat absensi. Silakan coba lagi.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filters, reload]);

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
          <Table
            rowKey="date"
            dataSource={error ? [] : attendance}
            columns={columns}
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 600 }}
            locale={{
              emptyText: error
                ? "Data tidak tersedia"
                : "Tidak ada absensi yang ditemukan",
            }}
          />
        </Space>
      </Card>
    </PageWrapper>
  );
}
