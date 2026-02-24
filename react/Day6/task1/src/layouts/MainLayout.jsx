import React from "react"
import { Layout, Menu, Avatar, Dropdown, Button } from "antd"
import { useDispatch, useSelector } from "react-redux"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { logout } from "../features/auth/authSlice"

const { Header, Sider, Content } = Layout

// A simple layout used by all authenticated pages.
// Shows a sidebar with role-based items, top-right user info, and a logout button.
export default function MainLayout() {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const items = [
    { key: 'dashboard', label: <Link to="/">Dashboard</Link> },
    { key: 'profile', label: <Link to="/profile">Profile</Link> }
  ]

  if (user?.role === 'admin') {
    items.push({ key: 'admin', label: <Link to="/admin">Admin</Link> })
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div style={{ color: 'white', padding: 16, fontWeight: 600 }}>MyApp</div>
        <Menu theme="dark" mode="inline" items={items} />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600 }}>Dashboard</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{user?.role}</div>
            </div>
            <Avatar>{user?.name?.[0] ?? 'U'}</Avatar>
            <Dropdown
              menu={{ items: [{ key: 'logout', label: <Button type="link" onClick={handleLogout}>Logout</Button> }] }}
              trigger={['click']}
            >
              <Button>Menu</Button>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}