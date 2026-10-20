import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Row,
} from "antd";
import { Link } from "react-router";
import PageWrapper from "../../../components/PageWrapper";

type EmployeeFormProps = {
  mode: "create" | "edit";
};

const employee = {
  name: "Bagus Tambunan",
  email: "bagus@mail.com",
  position: "Software Engineer",
  phoneNumber: "081234567890",
};

function EmployeeForm({ mode }: EmployeeFormProps) {
  const isEdit = mode === "edit";

  return (
    <PageWrapper
      title={isEdit ? "Update Karyawan" : "Tambah Karyawan"}
      subtitle={
        isEdit
          ? "Perbarui informasi karyawan."
          : "Tambahkan karyawan baru ke dalam sistem."
      }
      extra={
        <Link to="/hrd-portal/employees">
          <Button icon={<ArrowLeftOutlined />}>Kembali</Button>
        </Link>
      }
    >
      <Card title="Informasi Karyawan">
        <Form
          layout="vertical"
          initialValues={isEdit ? employee : { status: "active" }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Nama" name="name">
                <Input placeholder="Nama lengkap" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Email" name="email">
                <Input type="email" placeholder="Email perusahaan" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Posisi" name="position">
                <Input placeholder="Posisi karyawan" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Nomor Handphone" name="phoneNumber">
                <Input placeholder="Nomor handphone" />
              </Form.Item>
            </Col>
            {!isEdit && (
              <Col xs={24} md={12}>
                <Form.Item label="Password Sementara" name="password">
                  <Input.Password placeholder="Password sementara" />
                </Form.Item>
              </Col>
            )}
          </Row>

          <Flex justify="flex-end" gap={8}>
            <Link to="/hrd-portal/employees">
              <Button>Batal</Button>
            </Link>
            <Button type="primary" htmlType="submit">
              {isEdit ? "Simpan Perubahan" : "Tambah Karyawan"}
            </Button>
          </Flex>
        </Form>
      </Card>
    </PageWrapper>
  );
}

export default EmployeeForm;
