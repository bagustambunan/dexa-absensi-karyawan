import {
  EditOutlined,
  SearchOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
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
  Typography,
  type TableProps,
} from "antd";
import { Link } from "react-router";
import PageWrapper from "../../../components/PageWrapper";

type Employee = {
  id: string;
  name: string;
  initials: string;
  email: string;
  position: string;
  phoneNumber: string;
};

const employees: Employee[] = [
  {
    id: "EMP-001",
    name: "Bagus Tambunan",
    initials: "BT",
    email: "bagus@mail.com",
    position: "Software Engineer",
    phoneNumber: "081234567890",
  },
];

const columns: TableProps<Employee>["columns"] = [
  {
    title: "Nama",
    key: "name",
    render: (_, employee) => (
      <Space>
        <Avatar>{employee.initials}</Avatar>
        <Space orientation="vertical" size={0}>
          <Typography.Text strong>{employee.name}</Typography.Text>
          <Typography.Text type="secondary">{employee.id}</Typography.Text>
        </Space>
      </Space>
    ),
  },
  {
    title: "Email",
    dataIndex: "email",
  },
  {
    title: "Posisi",
    dataIndex: "position",
  },
  {
    title: "Nomor Handphone",
    dataIndex: "phoneNumber",
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

function EmployeeManagement() {
  return (
    <PageWrapper
      title="Kelola Karyawan"
      subtitle="Tambah / perbarui data karyawan."
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Total Karyawan" value={4} />
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
          <Form layout="inline">
            <Form.Item name="name" label="Nama karyawan">
              <Input placeholder="Nama karyawan" />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item name="position" label="Posisi">
              <Input placeholder="Posisi" />
            </Form.Item>
            <Form.Item name="phoneNumber" label="Nomor Handphone">
              <Input placeholder="Nomor Handphone" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" icon={<SearchOutlined />}>
                Cari
              </Button>
            </Form.Item>
          </Form>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={employees}
            pagination={false}
            scroll={{ x: 900 }}
          />
        </Space>
      </Card>
    </PageWrapper>
  );
}

export default EmployeeManagement;
