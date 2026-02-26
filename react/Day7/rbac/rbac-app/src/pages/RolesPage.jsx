import React, { useEffect } from 'react'
import {
  Card, Checkbox, Tag, Typography, Spin, Row, Col, Tooltip,
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

const { Title, Text } = Typography

const ROLE_COLORS = { admin: '#eb2f96', hr: '#52c41a', supervisor: '#1677ff', manager: '#fa8c16' }

const MODULE_ICONS = {
  System:    <SettingOutlined />,
  Users:     <UserOutlined />,
  Employees: <TeamOutlined />,
  Projects:  <ProjectOutlined />,
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
      api.success({ message: `Permission ${current.includes(permKey) ? 'revoked' : 'granted'}`, description: `${permKey} → ${roleEntry.role}`, placement: 'topRight', duration: 2 })

      
      if (roleEntry.role === user?.role) {
        dispatch(refreshMyPermissions(updated))
      }
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
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>
          <KeyOutlined style={{ color: '#667eea' }} /> &nbsp;Role Permissions
        </Title>
        <Text type="secondary">
          Toggle checkboxes to grant or revoke permissions per role. Changes apply instantly — no reload needed.
        </Text>
      </div>

      <Spin spinning={loading}>
        {/* ─── PERMISSION MATRIX ─── */}
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: 20, overflowX: 'auto' }}>
          <table className="perm-table" style={{ minWidth: 580 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: 210 }}>Permission</th>
                {rolePermissions.map((rp) => (
                  <th key={rp.id} style={{ textAlign: 'center', minWidth: 110 }}>
                    <Tag color={ROLE_COLORS[rp.role]} style={{ textTransform: 'capitalize', fontWeight: 700, padding: '3px 10px' }}>
                      {rp.role}
                    </Tag>
                    <div style={{ fontSize: 10, color: '#aaa', marginTop: 4, fontWeight: 400 }}>
                      {(rp.permissions ?? []).length} / {definitions.length}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedModules.map((module) => (
                <React.Fragment key={module}>
                  {/* Module section header */}
                  <tr className="module-row">
                    <td colSpan={rolePermissions.length + 1} style={{ padding: '9px 14px' }}>
                      <span style={{ marginRight: 7 }}>{MODULE_ICONS[module] ?? <SettingOutlined />}</span>
                      {module}
                    </td>
                  </tr>

                  {/* One row per permission */}
                  {(grouped[module] ?? []).map((def, idx) => (
                    <tr key={def.key} style={{ background: idx % 2 === 0 ? '#fff' : '#fafbff' }}>
                      <td>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{def.label}</span>
                        <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>{def.key}</Text>
                      </td>
                      {rolePermissions.map((rp) => {
                        const has        = (rp.permissions ?? []).includes(def.key)
                        const isAdminRole = rp.role === 'admin'
                        return (
                          <td key={rp.id} style={{ textAlign: 'center' }}>
                            <Tooltip title={isAdminRole ? 'Admin always has all permissions' : `${has ? 'Revoke' : 'Grant'} "${def.label}" for ${rp.role}`}>
                              <Checkbox
                                checked={isAdminRole ? true : has}
                                disabled={isAdminRole}
                                onChange={() => !isAdminRole && handleToggle(rp, def.key)}
                                style={isAdminRole ? { opacity: 0.65 } : {}}
                              />
                            </Tooltip>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </Card>

        {/* ─── ROLE SUMMARY CARDS ─── */}
        <Row gutter={[14, 14]}>
          {rolePermissions.map((rp) => {
            const isAdminRole = rp.role === 'admin'
            return (
            <Col xs={24} sm={12} lg={6} key={rp.id}>
              <Card
                size="small"
                style={{
                  borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  border: isAdminRole ? '1px solid #ffadd2' : undefined,
                }}
                title={
                  <Space size={6}>
                    <Tag color={ROLE_COLORS[rp.role]} style={{ textTransform: 'capitalize', fontWeight: 700 }}>
                      {rp.role}
                    </Tag>
                    {isAdminRole && (
                      <Tooltip title="Admin always has all permissions — cannot be modified">
                        <LockOutlined style={{ color: '#eb2f96', fontSize: 12 }} />
                      </Tooltip>
                    )}
                  </Space>
                }
                extra={
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {isAdminRole ? definitions.length : (rp.permissions ?? []).length} / {definitions.length}
                  </Text>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {definitions.map((def) => {
                    const has = isAdminRole ? true : (rp.permissions ?? []).includes(def.key)
                    return (
                      <div key={def.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircleOutlined style={{ color: has ? '#52c41a' : '#d9d9d9', fontSize: 12 }} />
                        <Text style={{ fontSize: 12, color: has ? '#333' : '#bbb' }}>{def.label}</Text>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </Col>
            )
          })}
        </Row>
      </Spin>
    </>
  )
}