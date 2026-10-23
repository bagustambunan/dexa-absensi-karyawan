import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router";
import Sidebar from "../Sidebar";
import AdminNotifications from "../AdminNotifications";

type AuthLayoutProps = {
  portal?: "employee" | "hrd";
};

const App: React.FC<AuthLayoutProps> = ({ portal = "employee" }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar portal={portal} />
      {portal === "hrd" && <AdminNotifications />}
      <Layout style={{ minHeight: "100vh", marginLeft: 240 }}>
        <Outlet />
      </Layout>
    </Layout>
  );
};

export default App;
