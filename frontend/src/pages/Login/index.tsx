import { useState } from "react";
import { Alert, Button, Card, Form, Input } from "antd";
import { LoginOutlined } from "@ant-design/icons";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router";
import { employeeApi } from "../../api/employee-api";
import type { LoginResponse, LoginValues } from "./type";
import { portalPath } from "../../auth/session";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(values: LoginValues) {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await employeeApi.post<LoginResponse>(
        "/api/auth/login",
        { email: values.email.trim().toLowerCase(), password: values.password },
      );
      sessionStorage.setItem("user", JSON.stringify(data.user));
      sessionStorage.setItem("accessToken", data.accessToken);
      navigate(portalPath(data.user.role), { replace: true });
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        setError(
          status === 401
            ? "Email atau password salah."
            : status === 400
              ? "Periksa kembali email dan password Anda."
              : status === 403
                ? "Akses ditolak."
                : status === 429
                  ? "Terlalu banyak percobaan login. Coba lagi nanti."
                  : !err.response
                    ? "Tidak dapat menghubungi server. Periksa koneksi dan coba lagi."
                    : "Server sedang bermasalah. Silakan coba lagi nanti.",
        );
      } else {
        setError(
          "Login gagal. Pastikan penyimpanan sesi browser tersedia dan coba lagi.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="center-of-page"
      style={{ minHeight: "100dvh", padding: 16, boxSizing: "border-box" }}
    >
      <Card title="Login" style={{ width: 400, maxWidth: "100%" }}>
        {error && (
          <Alert
            type="error"
            title={error}
            showIcon
            role="alert"
            style={{ marginBottom: 24 }}
          />
        )}
        <Form<LoginValues>
          name="login"
          labelCol={{ span: 6 }}
          labelAlign="left"
          disabled={loading}
          onFinish={login}
          onValuesChange={() => setError("")}
        >
          <Form.Item
            label="Email"
            name="email"
            normalize={(value: string) => value.trim()}
            rules={[
              { required: true, message: "Email wajib diisi." },
              { type: "email", message: "Masukkan email yang valid." },
            ]}
          >
            <Input
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
            />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Password wajib diisi." }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<LoginOutlined />}
              iconPlacement="end"
              className="full-width"
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
