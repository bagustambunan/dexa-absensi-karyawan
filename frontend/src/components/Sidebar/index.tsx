import {
  BarChartOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
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

function Sidebar() {
  const { pathname } = useLocation();
  const selectedPath =
    pathname === EMPLOYEE_PORTAL_PATH || pathname === `${EMPLOYEE_PORTAL_PATH}/`
      ? `${EMPLOYEE_PORTAL_PATH}/attendance`
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
          Portal Karyawan
        </Typography.Title>

        <Menu
          mode="inline"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            borderInlineEnd: 0,
          }}
          items={employeeMenuItems}
          selectedKeys={[selectedPath]}
        />

        <Space
          orientation="vertical"
          size={12}
          style={{ width: "100%", padding: 16 }}
        >
          <Space>
            <Avatar>BT</Avatar>
            <Typography.Text strong>Bagus Tambunan</Typography.Text>
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
