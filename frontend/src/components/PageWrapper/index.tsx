import { Layout, Typography } from "antd";
import React from "react";

function PageWrapper({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <Layout.Content style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Typography.Title level={2}>{title}</Typography.Title>
        {subtitle && (
          <Typography.Text type="secondary">{subtitle}</Typography.Text>
        )}
      </div>
      {children}
    </Layout.Content>
  );
}

export default PageWrapper;
