import { isAxiosError } from "axios";
import {
  BarChartOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  message,
  Button,
  Flex,
  Layout,
  Menu,
  Space,
  Typography,
  type MenuProps,
} from "antd";
import { Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { employeeApi, getAvatarSrc } from "../../api/employee-api";
import type { EmployeeProfileData } from "../../pages/EmployeePortal/type";
import { useLatestRequest } from "../../hooks/useLatestRequest";

const EMPLOYEE_PORTAL_PATH = "/employee-portal";
const HRD_PORTAL_PATH = "/hrd-portal";

function getUserName(): string {
  try {
    const user = JSON.parse(sessionStorage.getItem("user") ?? "null");
    return typeof user?.fullName === "string" && user.fullName.trim()
      ? user.fullName.trim()
      : "Pengguna";
  } catch {
    return "Pengguna";
  }
}

const employeeMenuItems: MenuProps["items"] = [
  {
    key: `${EMPLOYEE_PORTAL_PATH}/attendance`,
    icon: <ClockCircleOutlined />,
    label: <Link to={`${EMPLOYEE_PORTAL_PATH}/attendance`}>Absen</Link>,
  },
  {
    key: `${EMPLOYEE_PORTAL_PATH}/attendance-summary`,
    icon: <BarChartOutlined />,
    label: (
      <Link to={`${EMPLOYEE_PORTAL_PATH}/attendance-summary`}>
        Riwayat Absensi
      </Link>
    ),
  },
  {
    key: `${EMPLOYEE_PORTAL_PATH}/profile`,
    icon: <UserOutlined />,
    label: <Link to={`${EMPLOYEE_PORTAL_PATH}/profile`}>Profil Karyawan</Link>,
  },
];

const hrdMenuItems: MenuProps["items"] = [
  {
    key: `${HRD_PORTAL_PATH}/employees`,
    icon: <TeamOutlined />,
    label: <Link to={`${HRD_PORTAL_PATH}/employees`}>Kelola Karyawan</Link>,
  },
  {
    key: `${HRD_PORTAL_PATH}/attendance`,
    icon: <CalendarOutlined />,
    label: <Link to={`${HRD_PORTAL_PATH}/attendance`}>Monitoring Absensi</Link>,
  },
];

function Sidebar({ portal = "employee" }: { portal?: "employee" | "hrd" }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EmployeeProfileData | null>(null);
  const { runRequest, cancelRequest } = useLatestRequest();
  useEffect(() => {
    if (portal !== "employee") return;
    const refresh = () => {
      void runRequest(() => employeeApi.get<EmployeeProfileData>("/api/me"), {
        onSuccess: ({ data }) => setProfile(data),
        onError: (error: unknown) => {
          setProfile(null);
          if (isAxiosError(error) && error.response?.status === 403) {
            void message.error("Akses profil ditolak.");
          }
        },
      });
    };
    refresh();
    window.addEventListener("employee-profile-updated", refresh);
    return () => {
      cancelRequest();
      window.removeEventListener("employee-profile-updated", refresh);
    };
  }, [portal, runRequest, cancelRequest]);
  const fullName =
    (portal === "employee" ? profile?.fullName : undefined) ?? getUserName();
  const initials = fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const isHrdPortal = portal === "hrd";
  const portalPath = isHrdPortal ? HRD_PORTAL_PATH : EMPLOYEE_PORTAL_PATH;
  const defaultPath = isHrdPortal
    ? `${HRD_PORTAL_PATH}/employees`
    : `${EMPLOYEE_PORTAL_PATH}/attendance`;
  const selectedPath =
    pathname === portalPath || pathname === `${portalPath}/`
      ? defaultPath
      : pathname;

  function logout() {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    void navigate("/login", { replace: true });
  }

  return (
    <Layout.Sider
      width={240}
      theme="light"
      style={{
        position: "fixed",
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Flex vertical style={{ height: "100%" }}>
        <Typography.Title level={4} style={{ margin: 0, padding: 24 }}>
          {isHrdPortal ? "Portal HRD" : "Portal Karyawan"}
        </Typography.Title>

        <Menu
          mode="inline"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            borderInlineEnd: 0,
          }}
          items={isHrdPortal ? hrdMenuItems : employeeMenuItems}
          selectedKeys={[selectedPath]}
        />

        <Space
          orientation="vertical"
          size={12}
          style={{ width: "100%", padding: 16 }}
        >
          <Space>
            <Avatar
              src={
                portal === "employee"
                  ? getAvatarSrc(profile?.avatarUrl)
                  : undefined
              }
              alt={fullName}
              style={{ flexShrink: 0 }}
            >
              {initials}
            </Avatar>
            <Typography.Text
              strong
              ellipsis
              title={fullName}
              style={{ maxWidth: 160 }}
            >
              {fullName}
            </Typography.Text>
          </Space>
          <Button danger block icon={<LogoutOutlined />} onClick={logout}>
            Logout
          </Button>
        </Space>
      </Flex>
    </Layout.Sider>
  );
}

export default Sidebar;
