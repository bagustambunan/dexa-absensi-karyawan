import { Button, Card, Space } from "antd";
import PageWrapper from "../../../components/PageWrapper";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

function EmployeeAttendance() {
  return (
    <PageWrapper
      title="Absen"
      subtitle="Catat waktu masuk dan pulang untuk hari ini."
    >
      <Card>
        <Space orientation="vertical" style={{ width: "100%" }}>
          <Card title="Hari Ini">
            <Space orientation="vertical">
              <Space>
                <CalendarOutlined />
                <span>20 Oktober 2026</span>
              </Space>
              <Space>
                <ClockCircleOutlined />
                <span>13:30</span>
              </Space>
            </Space>
          </Card>
          <div className="grid-2">
            <Card
              title="Jam Masuk"
              extra={
                <Button type="primary" icon={<CheckCircleOutlined />}>
                  Absen Masuk
                </Button>
              }
            >
              <span className="attendance-time">08:00</span>
            </Card>
            <Card
              title="Jam Pulang"
              extra={
                <Button type="primary" icon={<LogoutOutlined />}>
                  Absen Pulang
                </Button>
              }
            >
              <span className="attendance-time">17:00</span>
            </Card>
          </div>
        </Space>
      </Card>
    </PageWrapper>
  );
}

export default EmployeeAttendance;
