import React, { useEffect } from 'react'
import {
  Checkbox, Typography, Spin, Row, Col, Tooltip,
  notification, Space,
} from 'antd'
import {
  KeyOutlined, UserOutlined, TeamOutlined, ProjectOutlined, SettingOutlined,
  CheckCircleOutlined, CloseCircleOutlined, LockOutlined,
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPermissionDefs, fetchRolePermissions, saveRolePermissions } from '../app/slices/permissionsSlice'
import { refreshMyPermissions } from '../app/slices/authSlice'
import usePermission from '../hooks/usePermission'

const { Text } = Typography

const ROLE_META = {
  admin:      { color: '#f472b6', bg: 'bg-pink-100', border: 'border-pink-200', gradient: 'linear-gradient(135deg,#ec4899,#a855f7)' },
  hr:         { color: '#34d399', bg: 'bg-emerald-100', border: 'border-emerald-200',  gradient: 'linear-gradient(135deg,#10b981,#059669)' },
  supervisor: { color: '#60a5fa', bg: 'bg-blue-100', border: 'border-blue-200',  gradient: 'linear-gradient(135deg,#0ea5e9,#3b82f6)' },
  manager:    { color: '#fbbf24', bg: 'bg-amber-100', border: 'border-amber-200',  gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
}

const MODULE_META = {
  System:    { icon: <SettingOutlined />, color: '#94a3b8' },
  Users:     { icon: <UserOutlined />,   color: '#60a5fa' },
  Employees: { icon: <TeamOutlined />,   color: '#34d399' },
  Projects:  { icon: <ProjectOutlined />,color: '#fbbf24' },
}

export default function RolesPage() {
  const dispatch   = useDispatch()
  const { definitions, rolePermissions, loading } = useSelector((s) => s.permissions)
  const { user }   = usePermission()
  const [api, ctx] = notification.useNotification()

  useEffect(() => {
    dispatch(fetchPermissionDefs())
    dispatch(fetchRolePermissions())
  }, [])

  const handleToggle = async (roleEntry, permKey) => {
    const current = roleEntry.permissions ?? []
    const updated = current.includes(permKey)
      ? current.filter((p) => p !== permKey)
      : [...current, permKey]
    const res = await dispatch(saveRolePermissions({ id: roleEntry.id, permissions: updated }))
    if (res.meta.requestStatus === 'fulfilled') {
      api.success({
        message: current.includes(permKey) ? 'Permission revoked' : 'Permission granted',
        description: `${permKey} → ${roleEntry.role}`,
        placement: 'topRight', duration: 2,
      })
      if (roleEntry.role === user?.role) dispatch(refreshMyPermissions(updated))
    } else {
      api.error({ message: 'Failed to update permission', placement: 'topRight' })
    }
  }

  const grouped = definitions.reduce((acc, def) => {
    if (!acc[def.module]) acc[def.module] = []
    acc[def.module].push(def)
    return acc
  }, {})

  const moduleOrder = ['System', 'Users', 'Employees', 'Projects']
  const sortedModules = [
    ...moduleOrder.filter((m) => grouped[m]),
    ...Object.keys(grouped).filter((m) => !moduleOrder.includes(m)),
  ]

  return (
    <>
      {ctx}
      <div className="max-w-6xl">

        {/* Page header */}
        <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-600/30 rounded-xl p-6 mb-5 flex items-center justify-between animate-in slide-in-from-top fade-in duration-300 hover:border-slate-500/40 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <KeyOutlined className="text-lg" />
            </div>
            <div>
              <h2 className="m-0 text-lg font-black text-slate-100">Role Permissions</h2>
              <p className="m-0 text-xs text-slate-400">Toggle to grant or revoke · Changes apply instantly</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700/50 border border-slate-600/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">{definitions.length} permissions defined</span>
          </div>
        </div>

        {/* Permission matrix */}
        <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-600/30 rounded-xl overflow-hidden mb-5 hover:border-slate-500/40 transition-all">
          <div className="p-4 border-b border-slate-200 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Permission Matrix</span>
          </div>

          <Spin spinning={loading}>
            <div className="overflow-x-auto p-1">
              <table className="w-full border-collapse roles-permission-table" style={{ minWidth: 560 }}>
                <thead>
                  <tr className="bg-slate-700/40">
                    <th className="p-3 text-left text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-600/30 w-56">
                      Permission
                    </th>
                    {rolePermissions.map((rp) => {
                      const meta = ROLE_META[rp.role] || {}
                      const isAdmin = rp.role === 'admin'
                      return (
                        <th key={rp.id} className="p-3 text-center text-xs font-bold border-b border-slate-600/30">
                          <div className="flex flex-col items-center gap-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold"
                              style={{ color: meta.color, borderColor: meta.color + '40', background: meta.color + '10' }}>
                              {isAdmin && <LockOutlined className="text-xs" />}
                              <span className="uppercase">{rp.role}</span>
                            </div>
                            <span className="text-xs text-slate-400">{isAdmin ? definitions.length : (rp.permissions ?? []).length} / {definitions.length}</span>
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedModules.map((module) => {
                    const modMeta = MODULE_META[module] || { icon: <SettingOutlined />, color: '#94a3b8' }
                    return (
                      <React.Fragment key={module}>
                        <tr className="bg-slate-700/30">
                          <td colSpan={rolePermissions.length + 1} className="p-3 gap-2 flex items-center border-b border-slate-600/30">
                            <span style={{ color: modMeta.color, fontSize: 13 }}>{modMeta.icon}</span>
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{module}</span>
                          </td>
                        </tr>
                        {(grouped[module] ?? []).map((def, idx) => (
                          <tr key={def.key} className={idx % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-700/20'} style={{ transition: 'background 0.15s' }}>
                            <td className="p-3 border-b border-slate-600/30">
                              <div className="text-sm font-medium text-slate-200">{def.label}</div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">{def.key}</div>
                            </td>
                            {rolePermissions.map((rp) => {
                              const has         = (rp.permissions ?? []).includes(def.key)
                              const isAdminRole = rp.role === 'admin'
                              return (
                                <td key={rp.id} className="p-3 text-center border-b border-slate-200">
                                  <Tooltip
                                    title={isAdminRole ? 'Admin always has all permissions' : `${has ? 'Revoke' : 'Grant'} "${def.label}" for ${rp.role}`}
                                  >
                                    <Checkbox
                                      checked={isAdminRole ? true : has}
                                      disabled={isAdminRole}
                                      onChange={() => !isAdminRole && handleToggle(rp, def.key)}
                                      className="rbac-checkbox"
                                    />
                                  </Tooltip>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Spin>
        </div>

        {/* Summary cards */}
        <Row gutter={[14, 14]}>
          {rolePermissions.map((rp, cardIdx) => {
            const meta        = ROLE_META[rp.role] || {}
            const isAdminRole = rp.role === 'admin'
            const grantedCount = isAdminRole ? definitions.length : (rp.permissions ?? []).length
            const pct = definitions.length > 0 ? Math.round((grantedCount / definitions.length) * 100) : 0

            return (
              <Col xs={24} sm={12} lg={6} key={rp.id}>
                <div className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all"
                  style={{ animation: `slideInUp 0.4s cubic-bezier(0.4,0,0.2,1) ${0.15 + cardIdx * 0.06}s both` }}>
                  
                  {/* Card header */}
                  <div className="p-4 border-b border-slate-200 flex items-center justify-between"
                    style={{ background: isAdminRole ? meta.color + '10' : '#f8fafc' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: meta.gradient || 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        {isAdminRole
                          ? <LockOutlined className="text-xs" />
                          : <span>{rp.role?.[0]?.toUpperCase()}</span>
                        }
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase" style={{ color: meta.color }}>{rp.role}</div>
                        <div className="text-xs text-slate-500">{isAdminRole ? 'Full access' : `${grantedCount} perms`}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black" style={{ color: meta.color }}>{pct}%</div>
                      <div className="text-xs text-slate-500">coverage</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 bg-slate-200">
                    <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: meta.gradient }} />
                  </div>

                  {/* Permission list */}
                  <div className="p-3 flex flex-col gap-1 max-h-56 overflow-y-auto">
                    {definitions.map((def) => {
                      const has = isAdminRole ? true : (rp.permissions ?? []).includes(def.key)
                      return (
                        <div key={def.key} className={`flex items-center gap-2 p-1.5 rounded text-xs ${has ? 'bg-emerald-50 text-emerald-900' : 'bg-gray-50 text-gray-600'}`}>
                          {has
                            ? <CheckCircleOutlined className="text-emerald-600 flex-shrink-0 text-xs" />
                            : <CloseCircleOutlined className="text-gray-400 flex-shrink-0 text-xs" />
                          }
                          <span className={has ? 'font-semibold' : 'font-normal'}>{def.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Col>
            )
          })}
        </Row>

      </div>
      <style>{`
        @keyframes slideInUp { 
          from { opacity: 0; transform: translateY(12px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .roles-permission-table tbody tr:hover {
          background: rgba(51, 65, 85, 0.5) !important;
        }
      `}</style>
    </>
  )
}