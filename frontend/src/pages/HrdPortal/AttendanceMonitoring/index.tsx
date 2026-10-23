import { useEffect, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  DatePicker,
  Form,
  Select,
  Space,
  Typography,
  type TableProps,
} from "antd";
import { isAxiosError } from "axios";
import PageWrapper from "../../../components/PageWrapper";
import { attendanceApi } from "../../../api/attendance-api";
import { employeeApi, getAvatarSrc } from "../../../api/employee-api";
import type {
  Attendance,
  AttendanceMonitoringFilters,
  AttendanceMonitoringFormValues,
  Employee,
} from "../type";
import AttendanceTable from "../../../components/AttendanceTable";

export default function AttendanceMonitoring() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [filters, setFilters] = useState<AttendanceMonitoringFilters>({});

  useEffect(() => {
    Promise.all([
      attendanceApi.get<Attendance[]>("/api/admin/attendance", {
        params: filters,
      }),
      employeeApi.get<Employee[]>("/api/admin/employees"),
    ])
      .then(([attendanceResponse, employeesResponse]) => {
        setAttendance(attendanceResponse.data);
        setEmployees(employeesResponse.data);
      })
      .catch((err: unknown) => {
        setError(
          isAxiosError(err) && err.response?.status === 403
            ? "Akses ditolak."
            : "Gagal memuat data absensi dan karyawan. Silakan coba lagi.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filters, reload]);

  const employeesById = new Map(
    employees.map((employee) => [employee.id, employee]),
  );
  const columns: TableProps<Attendance>["columns"] = [
    {
      title: "Karyawan",
      key: "employee",
      render: (_, record) => {
        const employee = employeesById.get(record.employeeId);
        const name = employee?.fullName;
        return (
          <Space>
            <Avatar src={getAvatarSrc(employee?.avatarUrl)} alt={name}>
              {(name ?? record.employeeId)
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </Avatar>
            <Space orientation="vertical" size={0}>
              <Typography.Text strong>
                {name ?? record.employeeId}
              </Typography.Text>
              <Typography.Text type="secondary">
                {record.employeeId}
              </Typography.Text>
            </Space>
          </Space>
        );
      },
    },
  ];

  return (
    <PageWrapper
      title="Monitoring Absensi"
      subtitle="Pantau catatan absensi semua karyawan."
    >
      <Card title="Daftar Absensi">
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
          <Form<AttendanceMonitoringFormValues>
            layout="inline"
            onFinish={(values) => {
              setLoading(true);
              setError("");
              setFilters({
                from: values.dates?.[0]?.format("YYYY-MM-DD"),
                to: values.dates?.[1]?.format("YYYY-MM-DD"),
                employeeId: values.employeeId,
              });
            }}
          >
            <Form.Item name="dates" label="Pilih Tanggal">
              <DatePicker.RangePicker format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="employeeId" label="Karyawan">
              <Select
                allowClear
                showSearch={{ optionFilterProp: "label" }}
                placeholder="Semua karyawan"
                loading={loading}
                style={{ minWidth: 220 }}
                options={employees.map((employee) => ({
                  value: employee.id,
                  label: `${employee.fullName} (${employee.email})`,
                }))}
              />
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
            extraColumns={columns}
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
