import {
  Button,
  Card,
  DatePicker,
  Form,
  Space,
  Table,
  type TableProps,
} from "antd";
import PageWrapper from "../../../components/PageWrapper";
import { SearchOutlined } from "@ant-design/icons";

function EmployeeAttendanceSummary() {
  const columns: TableProps<{
    date: string;
    timeIn: string;
    timeOut: string;
  }>["columns"] = [
    {
      title: "Tanggal",
      dataIndex: "date",
    },
    {
      title: "Waktu Masuk",
      dataIndex: "timeIn",
    },
    {
      title: "Waktu Pulang",
      dataIndex: "timeOut",
    },
  ];
  const dataSource = [
    {
      date: "2026-01-01",
      timeIn: "08:00:00",
      timeOut: "17:00:00",
    },
  ];
  return (
    <PageWrapper title="Summary Absen" subtitle="Lihat riwayat absensi.">
      <Card>
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          <Form layout="inline">
            <Form.Item label="Pilih Tanggal">
              <DatePicker.RangePicker />
            </Form.Item>
            <Form.Item>
              <Button type="primary" icon={<SearchOutlined />}>
                Cari
              </Button>
            </Form.Item>
          </Form>
          <Table dataSource={dataSource} columns={columns} />
        </Space>
      </Card>
    </PageWrapper>
  );
}

export default EmployeeAttendanceSummary;
