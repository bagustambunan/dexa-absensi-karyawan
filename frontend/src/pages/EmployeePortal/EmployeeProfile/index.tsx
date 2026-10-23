import { InboxOutlined, SaveOutlined, UserOutlined } from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Flex,
  Form,
  Input,
  Image,
  Row,
  Space,
  Tag,
  Typography,
  Upload,
  message,
  type UploadFile,
} from "antd";
import PageWrapper from "../../../components/PageWrapper";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { employeeApi, getAvatarSrc } from "../../../api/employee-api";
import type { EmployeeProfileData, PasswordValues } from "../type";

function showSaveError(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 403) return;
    if (status === 400 && typeof error.response?.data?.message === "string") {
      void message.error(error.response.data.message);
      return;
    }
  }
  void message.error(fallback);
}

function EmployeeProfile() {
  const [phoneForm] = Form.useForm<{ phoneNumber: string }>();
  const [passwordForm] = Form.useForm<PasswordValues>();
  const [employee, setEmployee] = useState<EmployeeProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [photo, setPhoto] = useState<UploadFile | null>(null);
  const [pending, setPending] = useState<
    "phone" | "password" | "avatar" | null
  >(null);
  const disabled = loading || !employee || pending !== null;
  const previewUrl = photo?.thumbUrl;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    employeeApi
      .get<EmployeeProfileData>("/api/me")
      .then(({ data }) => {
        setEmployee(data);
        phoneForm.setFieldsValue({ phoneNumber: data.phone });
        setError("");
      })
      .catch((err: unknown) => {
        setEmployee(null);
        setError(
          isAxiosError(err) && err.response?.status === 403
            ? "Akses ditolak."
            : "Gagal memuat profil. Silakan coba lagi.",
        );
      })
      .finally(() => setLoading(false));
  }, [reload, phoneForm]);

  async function saveAvatar() {
    if (disabled || !photo?.originFileObj) return;
    setPending("avatar");
    const body = new FormData();
    body.append("file", photo.originFileObj);
    try {
      await employeeApi.post("/api/me/avatar", body);
      window.dispatchEvent(new Event("employee-profile-updated"));
      setPhoto(null);
      void message.success("Foto berhasil disimpan.");
      setLoading(true);
      setReload((value) => value + 1);
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 413) {
        void message.error("Ukuran foto maksimal 2 MB.");
      } else {
        showSaveError(error, "Gagal menyimpan foto. Silakan coba lagi.");
      }
    } finally {
      setPending(null);
    }
  }

  async function savePhone(values: { phoneNumber: string }) {
    if (disabled) return;
    setPending("phone");
    try {
      const { data } = await employeeApi.patch<EmployeeProfileData>(
        "/api/me/phone",
        {
          phone: values.phoneNumber.trim(),
        },
      );
      setEmployee(data);
      phoneForm.setFieldsValue({ phoneNumber: data.phone });
      void message.success("Nomor handphone berhasil disimpan.");
    } catch (error: unknown) {
      showSaveError(
        error,
        "Gagal menyimpan nomor handphone. Silakan coba lagi.",
      );
    } finally {
      setPending(null);
    }
  }

  async function savePassword(values: PasswordValues) {
    if (disabled) return;
    setPending("password");
    try {
      await employeeApi.patch("/api/me/password", values);
      passwordForm.resetFields();
      void message.success("Password berhasil diubah.");
    } catch (error: unknown) {
      showSaveError(error, "Gagal mengubah password. Silakan coba lagi.");
    } finally {
      setPending(null);
    }
  }

  return (
    <PageWrapper title="Profil Karyawan" subtitle="Lihat profil karyawan.">
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

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={14}>
          <Space orientation="vertical" size={24} className="full-width">
            <Card title="Informasi Karyawan" loading={loading}>
              <Space size="large" align="center">
                <Avatar
                  size={104}
                  src={getAvatarSrc(employee?.avatarUrl)}
                  icon={<UserOutlined />}
                  alt={employee?.fullName}
                />
                <Space orientation="vertical" size={4}>
                  <Typography.Title level={3} style={{ margin: 0 }}>
                    {employee?.fullName}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {employee?.position}
                  </Typography.Text>
                  {employee && <Tag color="success">Aktif</Tag>}
                </Space>
              </Space>

              <Descriptions
                layout="vertical"
                column={{ xs: 1, sm: 2 }}
                style={{ marginTop: 32 }}
                items={[
                  { key: "name", label: "Nama", children: employee?.fullName },
                  {
                    key: "email",
                    label: "Email Perusahaan",
                    children: employee?.email,
                  },
                  {
                    key: "position",
                    label: "Posisi",
                    children: employee?.position,
                  },
                  {
                    key: "phoneNumber",
                    label: "Nomor Handphone",
                    children: employee?.phone,
                  },
                ]}
              />

              <Alert
                type="info"
                showIcon
                title="Nama, email, dan posisi hanya bisa diubah oleh HRD."
                style={{ marginTop: 16 }}
              />
            </Card>

            <Card title="Ganti Foto">
              <Upload.Dragger
                accept=".jpg,.jpeg,.png,.webp"
                disabled={disabled}
                fileList={photo ? [photo] : []}
                beforeUpload={(file) => {
                  if (
                    !["image/jpeg", "image/png", "image/webp"].includes(
                      file.type,
                    )
                  ) {
                    void message.error("Pilih foto JPEG, PNG, atau WebP.");
                    return Upload.LIST_IGNORE;
                  }
                  if (file.size > 2 * 1024 * 1024) {
                    void message.error("Ukuran foto maksimal 2 MB.");
                    return Upload.LIST_IGNORE;
                  }
                  setPhoto({
                    uid: file.uid,
                    name: file.name,
                    originFileObj: file,
                    thumbUrl: URL.createObjectURL(file),
                  });
                  return false;
                }}
                onRemove={() => setPhoto(null)}
                maxCount={1}
              >
                <InboxOutlined style={{ fontSize: 32 }} />
                <Typography.Paragraph strong>
                  Pilih foto baru
                </Typography.Paragraph>
                <Typography.Text type="secondary">
                  Format: JPG, PNG, WebP. Ukuran maksimal 2 MB
                </Typography.Text>
              </Upload.Dragger>
              {previewUrl && (
                <div style={{ marginTop: 16 }}>
                  <Image width={160} src={previewUrl} alt="Preview foto baru" />
                </div>
              )}
              <Flex justify="flex-end" style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  disabled={disabled || !photo}
                  loading={pending === "avatar"}
                  onClick={() => void saveAvatar()}
                >
                  Simpan Foto
                </Button>
              </Flex>
            </Card>
          </Space>
        </Col>

        <Col xs={24} xl={10}>
          <Space orientation="vertical" size={24} className="full-width">
            <Card title="Ubah Nomor Handphone">
              <Form
                layout="vertical"
                form={phoneForm}
                disabled={disabled}
                onFinish={savePhone}
              >
                <Form.Item
                  label="Nomor Handphone"
                  name="phoneNumber"
                  rules={[
                    { required: true, message: "Nomor handphone wajib diisi." },
                    {
                      pattern: /^\+?[0-9]{8,15}$/,
                      transform: (value: string | undefined) => value?.trim(),
                      message: "Gunakan 8–15 digit, boleh diawali +.",
                    },
                  ]}
                >
                  <Input type="tel" autoComplete="tel" />
                </Form.Item>
                <Flex justify="flex-end">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={pending === "phone"}
                    icon={<SaveOutlined />}
                  >
                    Simpan Nomor
                  </Button>
                </Flex>
              </Form>
            </Card>

            <Card title="Ubah Password">
              <Form
                layout="vertical"
                form={passwordForm}
                disabled={disabled}
                onFinish={savePassword}
              >
                <Form.Item
                  label="Password Saat Ini"
                  name="currentPassword"
                  rules={[
                    {
                      required: true,
                      message: "Password saat ini wajib diisi.",
                    },
                  ]}
                >
                  <Input.Password autoComplete="current-password" />
                </Form.Item>
                <Form.Item
                  label="Password Baru"
                  name="newPassword"
                  rules={[
                    { required: true, message: "Password baru wajib diisi." },
                    { min: 8, message: "Password baru minimal 8 karakter." },
                    {
                      validator: (_, value: string | undefined) =>
                        !value || new TextEncoder().encode(value).length <= 72
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error("Password baru maksimal 72 byte."),
                            ),
                    },
                  ]}
                >
                  <Input.Password autoComplete="new-password" />
                </Form.Item>
                <Flex justify="flex-end">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={pending === "password"}
                    icon={<SaveOutlined />}
                  >
                    Ubah Password
                  </Button>
                </Flex>
              </Form>
            </Card>
          </Space>
        </Col>
      </Row>
    </PageWrapper>
  );
}

export default EmployeeProfile;
