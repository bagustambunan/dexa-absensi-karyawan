import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router";
import Sidebar from "../Sidebar";

const App: React.FC = () => {
  return (
    <Layout>
      <Layout>
        <Sidebar />
        <Layout style={{ padding: "0 24px 24px" }}>
          <Outlet />
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;
