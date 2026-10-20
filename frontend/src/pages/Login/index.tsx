import { Button, Card, Form, Input } from 'antd'
import { LoginOutlined } from "@ant-design/icons"

export default function index() {
  return (
    <div className='center-of-page'>
      <Card title="Login" className="small-card">
        <Form labelCol={{ span: 6 }} labelAlign='left'>
          <Form.Item label="Email">
            <Input />
          </Form.Item>
          <Form.Item label="Password">
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<LoginOutlined />} iconPlacement="end" className='full-width'>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
