import {
  BarChartOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Flex,
  Layout,
  Menu,
  Space,
  Typography,
  type MenuProps,
} from "antd";
import { Link, useLocation } from "react-router";

const EMPLOYEE_PORTAL_PATH = "/employee-portal";
const HRD_PORTAL_PATH = "/hrd-portal";

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
        Summary Absen
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
];

function Sidebar({ portal = "employee" }: { portal?: "employee" | "hrd" }) {
  const { pathname } = useLocation();
  const isHrdPortal = portal === "hrd";
  const portalPath = isHrdPortal ? HRD_PORTAL_PATH : EMPLOYEE_PORTAL_PATH;
  const defaultPath = isHrdPortal
    ? `${HRD_PORTAL_PATH}/employees`
    : `${EMPLOYEE_PORTAL_PATH}/attendance`;
  const selectedPath =
    pathname === portalPath || pathname === `${portalPath}/`
      ? defaultPath
      : pathname;

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
            <Avatar>{isHrdPortal ? "HR" : "BT"}</Avatar>
            <Typography.Text strong>
              {isHrdPortal ? "Admin HRD" : "Bagus Tambunan"}
            </Typography.Text>
          </Space>
          <Button danger block icon={<LogoutOutlined />}>
            Logout
          </Button>
        </Space>
      </Flex>
    </Layout.Sider>
  );
}

export default Sidebar;
