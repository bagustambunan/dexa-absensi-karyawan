import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router";
import Sidebar from "../Sidebar";

const App: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout style={{ minHeight: "100vh", marginLeft: 240 }}>
        <Outlet />
      </Layout>
    </Layout>
  );
};

export default App;
