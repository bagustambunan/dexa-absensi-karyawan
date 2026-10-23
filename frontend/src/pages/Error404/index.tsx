import { Button, Card, Result, Space } from "antd";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { getSessionRole, portalPath } from "../../auth/session";

function ErrorPage({ notFound }: { notFound: boolean }) {
  const role = getSessionRole();

  return (
    <div
      className="center-of-page"
      style={{ minHeight: "100vh", padding: 24, boxSizing: "border-box" }}
    >
      <Card style={{ width: "100%", maxWidth: 640 }}>
        <Result
          status={notFound ? "404" : "error"}
          title={notFound ? "Halaman tidak ditemukan" : "Halaman gagal dimuat"}
          subTitle={
            notFound
              ? "Alamat yang Anda buka tidak tersedia. Silakan kembali ke portal atau halaman masuk."
              : "Terjadi kesalahan. Muat ulang halaman atau kembali ke portal untuk melanjutkan."
          }
          extra={
            <Space>
              <Button type="primary" href={role ? portalPath(role) : "/login"}>
                {role === "ADMIN"
                  ? "Kembali ke Portal HRD"
                  : role === "EMPLOYEE"
                    ? "Kembali ke Portal Karyawan"
                    : "Ke Halaman Masuk"}
              </Button>
              {!notFound && (
                <Button onClick={() => window.location.reload()}>
                  Muat Ulang Halaman
                </Button>
              )}
            </Space>
          }
        />
      </Card>
    </div>
  );
}

export default function Error404Page() {
  return <ErrorPage notFound />;
}

export function RouterErrorBoundary() {
  const error = useRouteError();
  return (
    <ErrorPage notFound={isRouteErrorResponse(error) && error.status === 404} />
  );
}
