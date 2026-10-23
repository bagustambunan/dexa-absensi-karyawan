import { ArrowLeftOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Popconfirm,
  Row,
  Spin,
  Tag,
  message,
} from "antd";
import { Link, useNavigate, useParams } from "react-router";
import PageWrapper from "../../../components/PageWrapper";
import { employeeApi } from "../../../api/employee-api";
import type { Employee, EmployeeFormValues } from "../type";

const fields = [
  { name: "fullName", label: "Nama", max: 150 },
  { name: "email", label: "Email", max: 255 },
  { name: "position", label: "Posisi", max: 100 },
  { name: "phone", label: "Nomor Handphone", max: 30 },
] as const;
const listPath = "/hrd-portal/employees";

function EmployeeEditor({ employeeId }: { employeeId?: string }) {
  const isEdit = Boolean(employeeId);
  const navigate = useNavigate();
  const [form] = Form.useForm<EmployeeFormValues>();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const busy = saving || deactivating;
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!employeeId) return;
    employeeApi
      .get<Employee>(`/api/admin/employees/${encodeURIComponent(employeeId)}`)
      .then(({ data }) => {
        form.setFieldsValue({
          fullName: data.fullName,
          email: data.email,
          position: data.position,
          phone: data.phone,
        });
        setIsActive(data.isActive);
      })
      .catch((err) => {
        const status = isAxiosError(err) ? err.response?.status : undefined;
        setLoadError(
          status === 404
            ? "Karyawan tidak ditemukan."
            : status === 403
              ? "Akses ditolak."
              : "Gagal memuat karyawan. Silakan coba lagi.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [employeeId, form, reload]);

  async function save(values: EmployeeFormValues) {
    if (busy) return;
    setSaving(true);
    setError("");
    const payload = {
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      position: values.position.trim(),
      phone: values.phone.trim(),
    };
    try {
      if (employeeId) {
        await employeeApi.patch(
          `/api/admin/employees/${encodeURIComponent(employeeId)}`,
          payload,
        );
      } else {
        await employeeApi.post("/api/admin/employees", {
          ...payload,
          initialPassword: values.initialPassword,
        });
      }
      void message.success(
        isEdit
          ? "Data karyawan berhasil diperbarui."
          : "Karyawan berhasil ditambahkan.",
      );
      void navigate(listPath, { replace: true });
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined;
      if (status === 409) {
        form.setFields([{ name: "email", errors: ["Email sudah digunakan."] }]);
        setError("Email sudah digunakan. Gunakan email lain.");
      } else if (status !== 401) {
        setError(
          status === 403
            ? "Akses ditolak."
            : status === 404
              ? "Karyawan tidak ditemukan."
              : status === 400
                ? "Data tidak valid. Periksa kembali isian Anda."
                : "Gagal menyimpan karyawan. Silakan coba lagi.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function deactivate() {
    if (!employeeId || !isActive || busy) return;
    setDeactivating(true);
    setError("");
    try {
      await employeeApi.delete(
        `/api/admin/employees/${encodeURIComponent(employeeId)}`,
      );
      setIsActive(false);
      void message.success("Karyawan berhasil dinonaktifkan.");
      void navigate(listPath, { replace: true });
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined;
      if (status !== 401) {
        setError(
          status === 403
            ? "Akses ditolak."
            : status === 404
              ? "Karyawan tidak ditemukan."
              : "Gagal menonaktifkan karyawan. Silakan coba lagi.",
        );
      }
    } finally {
      setDeactivating(false);
    }
  }

  return (
    <PageWrapper
      title={isEdit ? "Update Karyawan" : "Tambah Karyawan"}
      subtitle={
        isEdit
          ? "Perbarui informasi karyawan."
          : "Tambahkan karyawan baru ke dalam sistem."
      }
      extra={
        <Link to={listPath}>
          <Button icon={<ArrowLeftOutlined />} disabled={busy}>
            Kembali
          </Button>
        </Link>
      }
    >
      <Card
        title="Informasi Karyawan"
        extra={
          isEdit && !loading && !loadError ? (
            <Tag color={isActive ? "green" : "default"}>
              {isActive ? "Aktif" : "Nonaktif"}
            </Tag>
          ) : undefined
        }
      >
        {loading && <Spin description="Memuat karyawan..." />}
        {loadError && (
          <Alert
            type="error"
            title={loadError}
            showIcon
            role="alert"
            action={
              <Button
                onClick={() => {
                  setLoading(true);
                  setLoadError("");
                  setReload((value) => value + 1);
                }}
              >
                Coba lagi
              </Button>
            }
          />
        )}
        <Form<EmployeeFormValues>
          form={form}
          layout="vertical"
          onFinish={save}
          disabled={busy || loading}
          style={{ display: loading || loadError ? "none" : undefined }}
          onValuesChange={() => setError("")}
        >
          {error && (
            <Alert
              type="error"
              title={error}
              showIcon
              role="alert"
              style={{ marginBottom: 24 }}
            />
          )}
          <Row gutter={16}>
            {fields.map(({ name, label, max }) => (
              <Col xs={24} md={12} key={name}>
                <Form.Item
                  name={name}
                  label={label}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: `${label} wajib diisi.`,
                    },
                    { max, message: `Maksimal ${max} karakter.` },
                    ...(name === "email"
                      ? [
                          {
                            type: "email" as const,
                            message: "Masukkan email yang valid.",
                          },
                        ]
                      : []),
                  ]}
                >
                  <Input
                    maxLength={max}
                    type={
                      name === "email"
                        ? "email"
                        : name === "phone"
                          ? "tel"
                          : "text"
                    }
                  />
                </Form.Item>
              </Col>
            ))}
            {!isEdit && (
              <Col xs={24} md={12}>
                <Form.Item
                  name="initialPassword"
                  label="Password Sementara"
                  rules={[
                    {
                      required: true,
                      message: "Password sementara wajib diisi.",
                    },
                    { min: 8, message: "Password minimal 8 karakter." },
                    {
                      validator: (_, value: string | undefined) =>
                        !value || new TextEncoder().encode(value).length <= 72
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error("Password maksimal 72 byte."),
                            ),
                    },
                  ]}
                >
                  <Input.Password autoComplete="new-password" />
                </Form.Item>
              </Col>
            )}
          </Row>
          <Flex justify="flex-end" gap={8}>
            {isEdit && isActive && (
              <Popconfirm
                title="Nonaktifkan karyawan?"
                description="Karyawan tidak dapat login lagi. Data dan riwayat tetap tersimpan."
                okText="Nonaktifkan"
                cancelText="Batal"
                disabled={busy}
                okButtonProps={{ danger: true, loading: deactivating }}
                cancelButtonProps={{ disabled: deactivating }}
                onConfirm={deactivate}
              >
                <Button danger disabled={busy} loading={deactivating}>
                  Nonaktifkan
                </Button>
              </Popconfirm>
            )}
            <Button disabled={busy} onClick={() => void navigate(listPath)}>
              Batal
            </Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {isEdit ? "Simpan Perubahan" : "Tambah Karyawan"}
            </Button>
          </Flex>
        </Form>
      </Card>
    </PageWrapper>
  );
}

export default function EmployeeForm({ mode }: { mode: "create" | "edit" }) {
  const { employeeId } = useParams();
  if (mode === "edit" && !employeeId)
    return <Alert type="error" title="Karyawan tidak ditemukan." />;
  const id = mode === "edit" ? employeeId : undefined;
  return <EmployeeEditor key={id ?? "create"} employeeId={id} />;
}
