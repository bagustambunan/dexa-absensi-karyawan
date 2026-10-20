import { Button, Card, Form, Input } from 'antd'

export default function index() {
  return (
    <Card title="Login" className="login-card">
      <Form labelCol={{ span: 6 }} labelAlign='left'>
        <Form.Item label="Email">
          <Input />
        </Form.Item>
        <Form.Item label="Password">
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary">
            Login
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}
