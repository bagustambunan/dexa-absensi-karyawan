import { ArrowLeftOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import {
  Button,
  Alert,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Descriptions,
  Spin,
  Tag,
} from "antd";
import { Link, useParams } from "react-router";
import PageWrapper from "../../../components/PageWrapper";
import { employeeApi } from "../../../api/employee-api";
import type { Employee } from "../type";

type EmployeeFormProps = {
  mode: "create" | "edit";
};

function EmployeeDetail({ employeeId }: { employeeId: string }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    employeeApi
      .get<Employee>(`/api/admin/employees/${encodeURIComponent(employeeId)}`, {
        timeout: 15000,
      })
      .then(({ data }) => {
        setEmployee(data);
      })
      .catch((err) => {
        const status = isAxiosError(err) ? err.response?.status : undefined;
        setError(
          status === 404
            ? "Karyawan tidak ditemukan."
            : status === 403
              ? "Akses ditolak."
              : "Gagal memuat detail karyawan. Silakan coba lagi.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [employeeId, reload]);

  return (
    <PageWrapper
      title="Detail Karyawan"
      subtitle="Informasi karyawan."
      extra={
        <Link to="/hrd-portal/employees">
          <Button icon={<ArrowLeftOutlined />}>Kembali</Button>
        </Link>
      }
    >
      <Card title="Informasi Karyawan">
        {loading ? (
          <Spin description="Memuat karyawan..." />
        ) : error ? (
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
        ) : (
          employee && (
            <Descriptions
              column={{ xs: 1, md: 2 }}
              bordered
              items={[
                { key: "id", label: "ID", children: employee.id },
                { key: "name", label: "Nama", children: employee.fullName },
                { key: "email", label: "Email", children: employee.email },
                {
                  key: "position",
                  label: "Posisi",
                  children: employee.position,
                },
                {
                  key: "phone",
                  label: "Nomor Handphone",
                  children: employee.phone,
                },
                {
                  key: "status",
                  label: "Status",
                  children: (
                    <Tag color={employee.isActive ? "green" : "default"}>
                      {employee.isActive ? "Aktif" : "Nonaktif"}
                    </Tag>
                  ),
                },
              ]}
            />
          )
        )}
      </Card>
    </PageWrapper>
  );
}

function EmployeeForm({ mode }: EmployeeFormProps) {
  const { employeeId } = useParams();
  const isEdit = mode === "edit";
  if (isEdit)
    return employeeId ? (
      <EmployeeDetail key={employeeId} employeeId={employeeId} />
    ) : (
      <Alert type="error" title="Karyawan tidak ditemukan." />
    );

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
        <Form layout="vertical" initialValues={{ status: "active" }}>
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
