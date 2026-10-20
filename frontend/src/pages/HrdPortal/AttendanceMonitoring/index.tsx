import { SearchOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  DatePicker,
  Form,
  Select,
  Space,
  Table,
  Typography,
  type TableProps,
} from "antd";
import PageWrapper from "../../../components/PageWrapper";

type Attendance = {
  id: string;
  employeeName: string;
  initials: string;
  date: string;
  timeIn: string;
  timeOut?: string;
};

const attendanceData: Attendance[] = [
  {
    id: "EMP-001",
    employeeName: "Bagus Tambunan",
    initials: "BT",
    date: "2026-10-20",
    timeIn: "2026-10-20 08:10",
    timeOut: "2026-10-20 17:00",
  },
];

const columns: TableProps<Attendance>["columns"] = [
  {
    title: "Karyawan",
    key: "employee",
    render: (_, attendance) => (
      <Space>
        <Avatar>{attendance.initials}</Avatar>
        <Space orientation="vertical" size={0}>
          <Typography.Text strong>{attendance.employeeName}</Typography.Text>
          <Typography.Text type="secondary">{attendance.id}</Typography.Text>
        </Space>
      </Space>
    ),
  },
  {
    title: "Tanggal",
    dataIndex: "date",
  },
  {
    title: "Masuk",
    dataIndex: "timeIn",
  },
  {
    title: "Pulang",
    dataIndex: "timeOut",
    render: (timeOut?: string) => timeOut ?? "—",
  },
];

function AttendanceMonitoring() {
  return (
    <PageWrapper
      title="Monitoring Absensi"
      subtitle="Pantau catatan absensi semua karyawan."
    >
      <Card title="Daftar Absensi">
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          <Form layout="inline">
            <Form.Item label="Pilih Tanggal">
              <DatePicker.RangePicker />
            </Form.Item>
            <Form.Item label="Karyawan">
              <Select
                defaultValue="all"
                options={[
                  { value: "all", label: "Semua karyawan" },
                  { value: "EMP-001", label: "Bagus Tambunan" },
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button block type="primary" icon={<SearchOutlined />}>
                Cari
              </Button>
            </Form.Item>
          </Form>
          <Table
            rowKey={(attendance) => `${attendance.id}-${attendance.date}`}
            columns={columns}
            dataSource={attendanceData}
            pagination={false}
            scroll={{ x: 800 }}
          />
        </Space>
      </Card>
    </PageWrapper>
  );
}

export default AttendanceMonitoring;
