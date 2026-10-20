import {
  BarChartOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu, type MenuProps } from "antd";
import { Link, useLocation } from "react-router";

const EMPLOYEE_PORTAL_PATH = "/employee-portal";

const employeeMenuItems: MenuProps["items"] = [
  {
    key: `${EMPLOYEE_PORTAL_PATH}/profile`,
    icon: <UserOutlined />,
    label: <Link to={`${EMPLOYEE_PORTAL_PATH}/profile`}>Profil Karyawan</Link>,
  },
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
];

function Sidebar() {
  const { pathname } = useLocation();
  const selectedPath =
    pathname === EMPLOYEE_PORTAL_PATH || pathname === `${EMPLOYEE_PORTAL_PATH}/`
      ? `${EMPLOYEE_PORTAL_PATH}/attendance`
      : pathname;

  return (
    <Layout.Sider width={240}>
      <Menu
        mode="inline"
        style={{ height: "100%", borderInlineEnd: 0 }}
        items={employeeMenuItems}
        selectedKeys={[selectedPath]}
      />
    </Layout.Sider>
  );
}

export default Sidebar;
