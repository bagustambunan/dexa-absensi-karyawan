import { Layout } from 'antd'
import { Outlet } from 'react-router'

export default function index() {
  return (
    <Layout className='app-layout'>
      <Outlet />
    </Layout>
  )
}
