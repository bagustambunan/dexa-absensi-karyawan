import { InboxOutlined, SaveOutlined } from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Flex,
  Form,
  Input,
  Row,
  Space,
  Tag,
  Typography,
  Upload,
} from "antd";
import PageWrapper from "../../../components/PageWrapper";

const employee = {
  name: "Bagus Tambunan",
  position: "Software Engineer",
  email: "bagus@mail.com",
  phoneNumber: "081234567890",
};

function EmployeeProfile() {
  return (
    <PageWrapper title="Profil Karyawan" subtitle="Lihat profil karyawan.">
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={14}>
          <Space orientation="vertical" size={24} className="full-width">
            <Card title="Informasi Karyawan">
              <Space size="large" align="center">
                <Avatar size={104}>BT</Avatar>
                <Space orientation="vertical" size={4}>
                  <Typography.Title level={3} style={{ margin: 0 }}>
                    {employee.name}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {employee.position}
                  </Typography.Text>
                  <Tag color="success">Aktif</Tag>
                </Space>
              </Space>

              <Descriptions
                layout="vertical"
                column={{ xs: 1, sm: 2 }}
                style={{ marginTop: 32 }}
                items={[
                  { key: "name", label: "Nama", children: employee.name },
                  {
                    key: "email",
                    label: "Email Perusahaan",
                    children: employee.email,
                  },
                  {
                    key: "position",
                    label: "Posisi",
                    children: employee.position,
                  },
                  {
                    key: "phoneNumber",
                    label: "Nomor Handphone",
                    children: employee.phoneNumber,
                  },
                ]}
              />

              <Alert
                type="info"
                showIcon
                title="Nama, email, dan posisi hanya bisa diubah oleh HRD."
                style={{ marginTop: 16 }}
              />
            </Card>

            <Card title="Ganti Foto">
              <Upload.Dragger
                accept=".jpg,.jpeg,.png,.webp"
                beforeUpload={() => false}
                maxCount={1}
              >
                <InboxOutlined style={{ fontSize: 32 }} />
                <Typography.Paragraph strong>
                  Pilih foto baru
                </Typography.Paragraph>
                <Typography.Text type="secondary">
                  Format: JPG, PNG, WebP. Ukuran maksimal 2 MB
                </Typography.Text>
              </Upload.Dragger>
              <Flex justify="flex-end" style={{ marginTop: 16 }}>
                <Button type="primary" icon={<SaveOutlined />}>
                  Simpan Foto
                </Button>
              </Flex>
            </Card>
          </Space>
        </Col>

        <Col xs={24} xl={10}>
          <Space orientation="vertical" size={24} className="full-width">
            <Card title="Ubah Nomor Handphone">
              <Form
                layout="vertical"
                initialValues={{ phoneNumber: employee.phoneNumber }}
              >
                <Form.Item label="Nomor Handphone" name="phoneNumber">
                  <Input />
                </Form.Item>
                <Flex justify="flex-end">
                  <Button type="primary" icon={<SaveOutlined />}>
                    Simpan Nomor
                  </Button>
                </Flex>
              </Form>
            </Card>

            <Card title="Ubah Password">
              <Form layout="vertical">
                <Form.Item label="Password Saat Ini" name="currentPassword">
                  <Input.Password />
                </Form.Item>
                <Form.Item label="Password Baru" name="newPassword">
                  <Input.Password />
                </Form.Item>
                <Flex justify="flex-end">
                  <Button type="primary" icon={<SaveOutlined />}>
                    Ubah Password
                  </Button>
                </Flex>
              </Form>
            </Card>
          </Space>
        </Col>
      </Row>
    </PageWrapper>
  );
}

export default EmployeeProfile;
