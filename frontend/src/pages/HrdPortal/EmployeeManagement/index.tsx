import { useEffect, useState } from "react";
import {
  EditOutlined,
  SearchOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  type TableProps,
} from "antd";
import { isAxiosError } from "axios";
import { Link } from "react-router";
import PageWrapper from "../../../components/PageWrapper";
import { employeeApi } from "../../../api/employee-api";
import type { Employee } from "../type";

type Filters = Partial<
  Pick<Employee, "fullName" | "email" | "position" | "phone">
>;

const columns: TableProps<Employee>["columns"] = [
  {
    title: "Nama",
    key: "fullName",
    render: (_, employee) => (
      <Space>
        <Avatar>
          {employee.fullName
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase()}
        </Avatar>
        <Space orientation="vertical" size={0}>
          <Typography.Text strong>{employee.fullName}</Typography.Text>
          <Typography.Text type="secondary">{employee.id}</Typography.Text>
        </Space>
      </Space>
    ),
  },
  { title: "Email", dataIndex: "email" },
  { title: "Posisi", dataIndex: "position" },
  { title: "Nomor Handphone", dataIndex: "phone" },
  {
    title: "Status",
    dataIndex: "isActive",
    render: (active: boolean) => (
      <Tag color={active ? "green" : "default"}>
        {active ? "Aktif" : "Nonaktif"}
      </Tag>
    ),
  },
  {
    title: "Aksi",
    key: "action",
    render: (_, employee) => (
      <Link to={`/hrd-portal/employees/${employee.id}/edit`}>
        <Button icon={<EditOutlined />}>Edit</Button>
      </Link>
    ),
  },
];

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [filters, setFilters] = useState<Filters>({});

  useEffect(() => {
    employeeApi
      .get<Employee[]>("/api/admin/employees", {
        timeout: 15000,
      })
      .then(({ data }) => {
        setEmployees(data);
      })
      .catch((err: unknown) => {
        setError(
          isAxiosError(err) && err.response?.status === 403
            ? "Akses ditolak."
            : "Gagal memuat daftar karyawan. Silakan coba lagi.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [reload]);

  const filteredEmployees = employees.filter((employee) =>
    (Object.keys(filters) as (keyof Filters)[]).every((key) =>
      employee[key]
        .toLowerCase()
        .includes((filters[key] ?? "").trim().toLowerCase()),
    ),
  );

  return (
    <PageWrapper
      title="Kelola Karyawan"
      subtitle="Daftar dan informasi karyawan."
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Total Karyawan"
              value={loading || error ? "-" : employees.length}
            />
          </Card>
        </Col>
      </Row>
      <Card
        style={{ marginTop: 16 }}
        title="Daftar Karyawan"
        extra={
          <Link to="/hrd-portal/employees/new">
            <Button type="primary" icon={<UserAddOutlined />}>
              Tambah Karyawan
            </Button>
          </Link>
        }
      >
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
          <Form<Filters> layout="inline" onFinish={setFilters}>
            <Form.Item name="fullName" label="Nama karyawan">
              <Input placeholder="Nama karyawan" allowClear />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input placeholder="Email" allowClear />
            </Form.Item>
            <Form.Item name="position" label="Posisi">
              <Input placeholder="Posisi" allowClear />
            </Form.Item>
            <Form.Item name="phone" label="Nomor Handphone">
              <Input placeholder="Nomor Handphone" allowClear />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
              >
                Cari
              </Button>
            </Form.Item>
          </Form>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={error ? [] : filteredEmployees}
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 900 }}
            locale={{
              emptyText: error
                ? "Data tidak tersedia"
                : "Tidak ada karyawan yang ditemukan",
            }}
          />
        </Space>
      </Card>
    </PageWrapper>
  );
}
