import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography, Button, Tooltip } from 'antd'
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

const ROLE_META = {
  admin:      { color: '#f472b6', bg: 'bg-pink-100', border: 'border-pink-200', label: 'Admin' },
  hr:         { color: '#34d399', bg: 'bg-emerald-100', border: 'border-emerald-200',      label: 'HR' },
  supervisor: { color: '#60a5fa', bg: 'bg-blue-100', border: 'border-blue-200',     label: 'Supervisor' },
  manager:    { color: '#fbbf24', bg: 'bg-amber-100', border: 'border-amber-200',   label: 'Manager' },
}

const NAV_ITEMS_META = {
  '/dashboard': { bgGradient: 'from-indigo-600 to-purple-600', shadow: 'shadow-lg', glow: 'from-indigo-500/15 to-purple-500/15' },
  '/users':     { bgGradient: 'from-cyan-500 to-blue-600', shadow: 'shadow-lg', glow: 'from-cyan-500/15 to-blue-500/15' },
  '/employees': { bgGradient: 'from-emerald-600 to-teal-600', shadow: 'shadow-lg', glow: 'from-emerald-500/15 to-teal-500/15' },
  '/projects':  { bgGradient: 'from-amber-500 to-red-500', shadow: 'shadow-lg', glow: 'from-amber-500/15 to-red-500/15' },
  '/roles':     { bgGradient: 'from-pink-600 to-purple-600', shadow: 'shadow-lg', glow: 'from-pink-500/15 to-purple-500/15' },
}


export default function AppLayout({ children }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { can, user } = usePermission()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard',        show: true },
    { key: '/users',     icon: <UserOutlined />,      label: 'Users',            show: can('viewUser') },
    { key: '/employees', icon: <TeamOutlined />,      label: 'Employees',        show: can('viewEmployee') },
    { key: '/projects',  icon: <ProjectOutlined />,   label: 'Projects',         show: can('viewProject') },
    { key: '/roles',     icon: <KeyOutlined />,        label: 'Role Permissions', show: can('managePermissions') },
  ].filter(i => i.show)

  const handleLogout = () => {
    dispatch(logoutAction())
    navigate('/login')
  }

  const activeMeta = NAV_ITEMS_META[location.pathname] || NAV_ITEMS_META['/dashboard']
  const roleMeta   = ROLE_META[user?.role] || { color: '#94a3b8', bg: 'bg-slate-100', border: 'border-slate-200', label: user?.role }
  const activeLabel = navItems.find(i => i.key === location.pathname)?.label ?? 'Dashboard'

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      {/* ═══════════════════════════════ SIDEBAR ═══════════════════════════════ */}
      <Sider
        collapsed={collapsed}
        width={252}
        collapsedWidth={68}
        className="fixed left-0 top-0 bottom-0 z-50 overflow-auto backdrop-blur-xl shadow-2xl"
        style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)' }}
      >
        {/* Top glow effect */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-20" 
          style={{
            background: `radial-gradient(circle, ${activeMeta.bgGradient === 'from-indigo-600 to-purple-600' ? 'rgba(99,102,241,0.4)' : 'rgba(16,185,129,0.2)'} 0%, transparent 65%)`,
          }} />

        {/* Noise texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-5" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          }} />

        <div className="relative z-10 h-full flex flex-col">

          {/* Logo block */}
          <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50 mb-2 flex-shrink-0"
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, #6366f1, #8b5cf6)` }}>
              <SafetyCertificateOutlined className="text-sm" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="text-slate-100 text-xs font-bold leading-tight tracking-tighter whitespace-nowrap">
                  RBAC System
                </div>
                <div className="text-slate-400 text-xs font-semibold tracking-wide uppercase mt-px">
                  Enterprise
                </div>
              </div>
            )}
          </div>

          {/* Section label */}
          {!collapsed && (
            <div className="px-4 py-1.5 text-slate-500 text-xs font-bold tracking-widest uppercase flex-shrink-0">
              Menu
            </div>
          )}

          {/* Nav */}
          <div className="flex-1 overflow-hidden">
            <Menu
              mode="inline"
              theme="dark"
              selectedKeys={[location.pathname]}
              inlineCollapsed={collapsed}
              items={navItems.map((item) => {
                const isActive = location.pathname === item.key
                return {
                  key: item.key,
                  icon: item.icon,
                  label: item.label,
                  onClick: () => navigate(item.key),
                }
              })}
              style={{ background: 'transparent', border: 'none' }}
              className={`[&_.ant-menu-item]:my-0.5 [&_.ant-menu-item]:mx-2 [&_.ant-menu-item]:rounded-lg [&_.ant-menu-item]:h-10 [&_.ant-menu-item]:leading-10 [&_.ant-menu-item]:transition-all [&_.ant-menu-item]:duration-150 [&_.ant-menu-item]:text-slate-400 [&_.ant-menu-item]:font-medium [&_.ant-menu-item]:text-xs [&_.ant-menu-item]:tracking-tight [&_.ant-menu-item:hover]:bg-slate-800/50 [&_.ant-menu-item:hover]:text-slate-200 [&_.ant-menu-item-selected]:text-white [&_.ant-menu-item-selected]:font-semibold [&_.ant-menu-item-selected]:bg-gradient-to-r [&_.ant-menu-item-selected]:from-indigo-600/20 [&_.ant-menu-item-selected]:to-purple-600/10`}
            />
          </div>

          {/* Bottom user card */}
          <div className="flex-shrink-0 p-3 border-t border-slate-700/50">
            {collapsed ? (
              <Tooltip title={user?.name} placement="right">
                <div className="flex justify-center">
                  <Avatar size={34} className="shadow-lg" style={{ background: `linear-gradient(135deg, #6366f1, #8b5cf6)`, fontWeight: 800, fontSize: 13 }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </Avatar>
                </div>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 cursor-pointer transition-colors hover:bg-slate-800/60">
                <Avatar size={32} className="flex-shrink-0 shadow-lg" style={{ background: `linear-gradient(135deg, #6366f1, #8b5cf6)`, fontWeight: 800, fontSize: 12 }}>
                  {user?.name?.[0]?.toUpperCase()}
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="text-slate-100 text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
                    {user?.name}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full bg-slate-700/40 border border-slate-600/30 inline-flex">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: roleMeta.color }} />
                    <span className="text-slate-300 text-xs font-bold uppercase tracking-wider" style={{ color: roleMeta.color }}>
                      {roleMeta.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1 rounded-md text-slate-400 transition-colors hover:text-red-400 flex-shrink-0"
                >
                  <LogoutOutlined className="text-sm" />
                </button>
              </div>
            )}
          </div>

        </div>
      </Sider>

      {/* ═══════════════════════════════ MAIN ═══════════════════════════════ */}
      <Layout style={{ marginLeft: collapsed ? 68 : 252 }} className="transition-all duration-250 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">

        {/* TOPBAR */}
        <Header className="sticky top-0 z-40 h-14 px-6 flex items-center justify-between bg-slate-900/70 backdrop-blur-2xl border-b border-slate-700/50 shadow-lg">

          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-indigo-400 transition-all"
            />

            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: `linear-gradient(135deg, #6366f1, #8b5cf6)` }} />
                <span className="text-sm font-bold text-slate-100 tracking-tight">
                  {activeLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Role pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-600/50 bg-slate-800/40 backdrop-blur">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: roleMeta.color }} />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider" style={{ color: roleMeta.color }}>
                {user?.role}
              </span>
            </div>

            {/* User pill */}
            <Dropdown
              menu={{
                items: [{
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Sign out',
                  danger: true,
                  onClick: handleLogout,
                }],
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-600/50 bg-slate-800/40 backdrop-blur cursor-pointer hover:bg-slate-700/60 transition-all">
                <Avatar size={26} className="flex-shrink-0 shadow-sm" style={{ background: `linear-gradient(135deg, #6366f1, #8b5cf6)`, fontWeight: 800, fontSize: 11 }}>
                  {user?.name?.[0]?.toUpperCase()}
                </Avatar>
                <span className="text-xs font-semibold text-slate-200 hidden sm:inline">{user?.name}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* PAGE CONTENT */}
        <Content className="p-6 min-h-[calc(100vh-3.5rem)] animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </Content>

      </Layout>
    </Layout>
  )
}