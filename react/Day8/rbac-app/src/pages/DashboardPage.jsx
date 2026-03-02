import React, { useEffect } from 'react'
import { Row, Col, Statistic, Typography, Tag } from 'antd'
import {
  UserOutlined, TeamOutlined, ProjectOutlined, KeyOutlined,
  CheckCircleOutlined, CloseCircleOutlined, RiseOutlined,
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsers }     from '../app/slices/usersSlice'
import { fetchEmployees } from '../app/slices/employeesSlice'
import { fetchProjects }  from '../app/slices/projectsSlice'
import { fetchPermissionDefs } from '../app/slices/permissionsSlice'
import usePermission from '../hooks/usePermission'

const { Text } = Typography

const ROLE_META = {
  admin:      { color: '#f472b6', bg: 'bg-pink-100', border: 'border-pink-200' },
  hr:         { color: '#34d399', bg: 'bg-emerald-100', border: 'border-emerald-200' },
  supervisor: { color: '#60a5fa', bg: 'bg-blue-100', border: 'border-blue-200' },
  manager:    { color: '#fbbf24', bg: 'bg-amber-100', border: 'border-amber-200' },
}

const STAT_META = [
  { key: 'users',     title: 'Total Users',     icon: <UserOutlined />,    gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', glyph: '👤', change: '+12%' },
  { key: 'employees', title: 'Employees',        icon: <TeamOutlined />,    gradient: 'linear-gradient(135deg,#10b981,#059669)', glyph: '👥', change: '+4%'  },
  { key: 'projects',  title: 'Active Projects',  icon: <ProjectOutlined />, gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)', glyph: '📁', change: '+8%'  },
  { key: 'perms',     title: 'My Permissions',   icon: <KeyOutlined />,     gradient: 'linear-gradient(135deg,#ec4899,#a855f7)', glyph: '🔑', change: '—'    },
]

export default function DashboardPage() {
  const dispatch  = useDispatch()
  const { user, permissions } = useSelector((s) => s.auth)
  const users     = useSelector((s) => s.users.list)
  const employees = useSelector((s) => s.employees.list)
  const projects  = useSelector((s) => s.projects.list)
  const permDefs  = useSelector((s) => s.permissions.definitions)
  const { can }   = usePermission()

  useEffect(() => {
    if (can('viewUser')) dispatch(fetchUsers())
    dispatch(fetchEmployees())
    dispatch(fetchProjects())
    dispatch(fetchPermissionDefs())
  }, [])

  const statValues = {
    users: users.length, employees: employees.length,
    projects: projects.length, perms: permissions.length,
  }

  const visibleStats = STAT_META.filter((s) => s.key !== 'users' || can('viewUser'))

  const grouped = permDefs.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = []
    acc[p.module].push(p)
    return acc
  }, {})

  const roleMeta = ROLE_META[user?.role] || { color: '#94a3b8', bg: 'bg-slate-100', border: 'border-slate-200' }

  return (
    <div className="max-w-6xl">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-slate-800/40 via-slate-700/30 to-slate-800/40 backdrop-blur-lg rounded-2xl p-8 mb-6 flex items-center justify-between overflow-hidden relative animate-in slide-in-from-top fade-in duration-300 border border-slate-600/30 hover:border-slate-500/40 transition-all"
        style={{ }}>
        
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-10 left-1/3 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-0.5">Good day</div>
              <h2 className="text-slate-50 text-2xl font-black tracking-tight">{user?.name}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full" style={{ background: roleMeta.color }} />
            <span className="text-slate-400 text-xs">Signed in as</span>
            <span className="text-xs font-bold uppercase" style={{ color: roleMeta.color }}>{user?.role}</span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-slate-500 text-xs">{permissions.length} permissions active</span>
          </div>
        </div>

        <div className="relative text-right">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">System Status</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.7)' }} />
            <span className="text-emerald-400 text-sm font-semibold">All systems operational</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        {visibleStats.map((s, idx) => (
          <Col xs={24} sm={12} xl={6} key={s.key}>
            <div className="bg-slate-800/40 backdrop-blur-lg rounded-xl p-6 border border-slate-600/30 hover:border-slate-500/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animation: `slideInUp 0.4s cubic-bezier(0.4,0,0.2,1) ${idx * 0.08}s both` }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{s.title}</div>
                  <div className="text-4xl font-black text-slate-100 leading-none mb-2">{statValues[s.key]}</div>
                  {s.change !== '—' && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50">
                      <RiseOutlined className="text-emerald-400" />
                      <span className="text-emerald-400 text-xs font-bold">{s.change}</span>
                    </div>
                  )}
                </div>
                <div className="w-11 h-11 rounded-lg flex items-center justify-center text-white text-xl shadow-lg flex-shrink-0"
                  style={{ background: s.gradient }}>
                  {s.icon}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Permission Matrix */}
      <div className="bg-slate-800/40 backdrop-blur-lg rounded-xl border border-slate-600/30 overflow-hidden hover:border-slate-500/40 transition-all" 
        style={{ animation: 'slideInUp 0.4s cubic-bezier(0.4,0,0.2,1) 0.4s both' }}>
        
        <div className="flex items-center justify-between p-6 border-b border-slate-600/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <KeyOutlined className="text-sm" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100">Permission Matrix</div>
              <div className="text-xs text-slate-400">Your access rights overview</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">{permissions.length} / {permDefs.length} granted</span>
          </div>
        </div>

        <div className="p-6">
          <Row gutter={[16, 16]}>
            {Object.entries(grouped).map(([module, perms]) => (
              <Col xs={24} md={12} lg={8} key={module}>
                <div className="bg-slate-700/40 backdrop-blur rounded-lg p-4 border border-slate-600/30 hover:border-slate-500/50 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded bg-gradient-to-b from-indigo-400 to-purple-500" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{module}</span>
                  </div>
                  <div className="space-y-2">
                    {perms.map((p) => {
                      const has = permissions.includes(p.key)
                      return (
                        <div key={p.key} className={`flex items-center gap-2 p-2 rounded text-xs transition-colors ${has ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-600/30 text-slate-400'}`}>
                          {has
                            ? <CheckCircleOutlined className="text-emerald-400 flex-shrink-0" />
                            : <CloseCircleOutlined className="text-slate-500 flex-shrink-0" />
                          }
                          <span className={`font-medium ${has ? 'font-semibold' : ''}`}>{p.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      <style>{`@keyframes slideInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}