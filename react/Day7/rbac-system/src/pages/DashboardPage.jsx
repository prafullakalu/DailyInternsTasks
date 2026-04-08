import React, { useEffect } from 'react'
import { Row, Col, Card, Statistic, Typography, Tag } from 'antd'
import {
  UserOutlined, TeamOutlined, ProjectOutlined, KeyOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsers }     from '../app/slices/usersSlice'
import { fetchEmployees } from '../app/slices/employeesSlice'
import { fetchProjects }  from '../app/slices/projectsSlice'
import { fetchPermissionDefs } from '../app/slices/permissionsSlice'
import usePermission from '../hooks/usePermission'

const { Title, Text } = Typography
const ROLE_COLORS = { admin: '#eb2f96', hr: '#52c41a', supervisor: '#1677ff', manager: '#fa8c16' }

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

  const stats = [
    { title: 'Users',       value: users.length,     icon: <UserOutlined />,    color: '#667eea', show: can('viewUser') },
    { title: 'Employees',   value: employees.length, icon: <TeamOutlined />,    color: '#52c41a', show: true },
    { title: 'Projects',    value: projects.length,  icon: <ProjectOutlined />, color: '#fa8c16', show: true },
    { title: 'My Perms',    value: permissions.length, icon: <KeyOutlined />,   color: '#eb2f96', show: true },
  ].filter((s) => s.show)


  const grouped = permDefs.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = []
    acc[p.module].push(p)
    return acc
  }, {})

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <Title level={3} style={{ margin: 0 }}>Welcome, {user?.name}!</Title>
        <Text type="secondary">
          Signed in as{' '}
          <Tag color={ROLE_COLORS[user?.role]} style={{ textTransform: 'capitalize', fontWeight: 600 }}>{user?.role}</Tag>
        </Text>
      </div>

      <Row gutter={[14, 14]}>
        {stats.map((s) => (
          <Col xs={24} sm={12} lg={6} key={s.title}>
            <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <Statistic
                title={s.title}
                value={s.value}
                prefix={<span style={{ color: s.color, marginRight: 4 }}>{s.icon}</span>}
                valueStyle={{ color: s.color, fontWeight: 700, fontSize: 26 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Dynamic permission matrix from DB */}
      <Card
        title={<><KeyOutlined style={{ color: '#667eea' }} /> &nbsp;Your Permission Matrix</>}
        style={{ marginTop: 20, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
      >
        <Row gutter={[20, 14]}>
          {Object.entries(grouped).map(([module, perms]) => (
            <Col xs={24} md={12} lg={8} key={module}>
              <Text strong style={{ display: 'block', marginBottom: 8, color: '#4f46e5', textTransform: 'uppercase', fontSize: 10, letterSpacing: 1 }}>
                {module}
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {perms.map((p) => {
                  const has = permissions.includes(p.key)
                  return (
                    <div key={p.key} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 10px', borderRadius: 8,
                      background: has ? '#f0fdf4' : '#fafafa',
                      border: `1px solid ${has ? '#86efac' : '#e5e7eb'}`,
                    }}>
                      {has
                        ? <CheckCircleOutlined style={{ color: '#22c55e', fontSize: 13 }} />
                        : <CloseCircleOutlined style={{ color: '#d1d5db', fontSize: 13 }} />
                      }
                      <span style={{ fontSize: 12, color: has ? '#166534' : '#9ca3af' }}>{p.label}</span>
                    </div>
                  )
                })}
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  )
}