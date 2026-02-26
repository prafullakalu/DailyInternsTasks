import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Tag, Button } from 'antd'
import {
  DashboardOutlined, UserOutlined, TeamOutlined, ProjectOutlined,
  KeyOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logoutAction } from '../app/slices/authSlice'
import usePermission from '../hooks/usePermission'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const ROLE_COLORS = { admin: '#eb2f96', hr: '#52c41a', supervisor: '#1677ff', manager: '#fa8c16' }

export default function AppLayout({ children }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { can, user } = usePermission()
  const [collapsed, setCollapsed] = useState(false)


  const navItems = [
    { key: '/dashboard',  icon: <DashboardOutlined />, label: 'Dashboard',        show: true },
    { key: '/users',      icon: <UserOutlined />,      label: 'Users',            show: can('viewUser') },
    { key: '/employees',  icon: <TeamOutlined />,      label: 'Employees',        show: can('viewEmployee') },
    { key: '/projects',   icon: <ProjectOutlined />,   label: 'Projects',         show: can('viewProject') },
    { key: '/roles',      icon: <KeyOutlined />,       label: 'Role Permissions', show: can('managePermissions') },
  ].filter((i) => i.show)

  const handleLogout = () => {
    dispatch(logoutAction())
    navigate('/login')
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── SIDEBAR ── */}
      <Sider
        collapsed={collapsed}
        width={240}
        className="rbac-sider"
        style={{
          background: '#0f1117',
          boxShadow: '2px 0 16px rgba(0,0,0,0.3)',
          position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
          overflow: 'auto',
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: collapsed ? '18px 14px' : '18px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 6,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg,#667eea,#764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SafetyCertificateOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          {!collapsed && <Text strong style={{ color: '#fff', fontSize: 14, whiteSpace: 'nowrap' }}>RBAC System</Text>}
        </div>

        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[location.pathname]}
          items={navItems.map((i) => ({
            key: i.key, icon: i.icon, label: i.label,
            onClick: () => navigate(i.key),
          }))}
          style={{ background: 'transparent', border: 'none' }}
        />
      </Sider>

      {/* ── MAIN ── */}
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        <Header style={{
          position: 'sticky', top: 0, zIndex: 99, background: '#fff',
          padding: '0 20px', height: 54,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <Button type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)} style={{ fontSize: 17 }}
          />
          <Space size={10}>
            <Tag color={ROLE_COLORS[user?.role] || '#888'} style={{ textTransform: 'capitalize', fontWeight: 600 }}>
              {user?.role}
            </Tag>
            <Dropdown menu={{ items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true, onClick: handleLogout }] }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', fontWeight: 700, fontSize: 13 }}>
                  {user?.name?.[0]?.toUpperCase()}
                </Avatar>
                <Text strong style={{ fontSize: 13 }}>{user?.name}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ margin: '20px', minHeight: 'calc(100vh - 94px)' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}