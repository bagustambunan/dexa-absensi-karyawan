import React from "react";
import {
  BarChartOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import { Outlet } from "react-router";

const employeeMenuItems: MenuProps["items"] = [
  {
    key: "employee-profile",
    icon: <UserOutlined />,
    label: "Profil Karyawan",
  },
  {
    key: "employee-attendance",
    icon: <ClockCircleOutlined />,
    label: "Absen",
  },
  {
    key: "employee-attendance-summary",
    icon: <BarChartOutlined />,
    label: "Summary Absen",
  },
];

const App: React.FC = () => {
  return (
    <Layout>
      <Layout>
        <Layout.Sider width={240}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["employee-attendance"]}
            defaultOpenKeys={["employee-attendance"]}
            style={{ height: "100%", borderInlineEnd: 0 }}
            items={employeeMenuItems}
          />
        </Layout.Sider>
        <Layout style={{ padding: "0 24px 24px" }}>
          <Outlet />
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;
