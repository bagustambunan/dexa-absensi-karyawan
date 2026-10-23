import { Flex, Layout, Typography } from "antd";
import React from "react";

function PageWrapper({
  children,
  extra,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  extra?: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <Layout.Content className="page-content">
      <Flex justify="space-between" align="flex-start" gap={16} wrap>
        <div style={{ marginBottom: "24px" }}>
          <h2 className="page-title">{title}</h2>
          {subtitle && (
            <Typography.Text type="secondary">{subtitle}</Typography.Text>
          )}
        </div>
        {extra}
      </Flex>
      {children}
    </Layout.Content>
  );
}

export default PageWrapper;
