import React, { useEffect } from 'react'
import { Form, Input, Button, Card, Typography, Divider, Alert, Space } from 'antd'
import { MailOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginThunk, clearError } from '../app/slices/authSlice'
import { isTokenValid } from '../services/authService'

const { Title, Text } = Typography

const DEMOS = [
  { label: 'Admin',      email: 'admin@rbac.com',      pw: 'password' },
  { label: 'HR',         email: 'hr@rbac.com',          pw: '1234' },
  { label: 'Supervisor', email: 'supervisor@rbac.com',  pw: 'password' },
  { label: 'Manager',    email: 'manager@rbac.com',     pw: 'password' },
]

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { loading, error, user, token } = useSelector((s) => s.auth)

  useEffect(() => { if (user && isTokenValid(token)) navigate('/dashboard') }, [user, token])
  useEffect(() => () => dispatch(clearError()), [])

  const onFinish = async (values) => {
    const res = await dispatch(loginThunk(values))
    if (res.meta.requestStatus === 'fulfilled') navigate('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg,#0f0c29 0%,#302b63 55%,#24243e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      position: 'fixed', top: 0, left: 0,
    }}>
      <div style={{ width: '100%', maxWidth: 410 }} className="login-wrap">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 14px',
            background: 'linear-gradient(135deg,#667eea,#764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 28px rgba(102,126,234,0.45)', fontSize: 28,
          }}>
            <SafetyCertificateOutlined style={{ color: '#fff' }} />
          </div>
          <Title level={3} style={{ color: '#fff', margin: 0 }}>RBAC System</Title>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Role-Based Access Control</Text>
        </div>

        <Card style={{
          borderRadius: 16,
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.11)',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 18px 50px rgba(0,0,0,0.4)',
        }}>
          {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16, borderRadius: 8 }} />}

          <Form form={form} layout="vertical" onFinish={onFinish} size="large">
            <Form.Item name="email" label={<Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>Email</Text>}
              rules={[{ required: true }, { type: 'email' }]}>
              <Input prefix={<MailOutlined />} placeholder="you@example.com" style={{ borderRadius: 8, height: 44 }} />
            </Form.Item>
            <Form.Item name="password" label={<Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>Password</Text>}
              rules={[{ required: true }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="••••••••" style={{ borderRadius: 8, height: 44 }} />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} style={{
              height: 46, borderRadius: 10, fontSize: 15, fontWeight: 600, border: 'none',
              background: 'linear-gradient(135deg,#667eea,#764ba2)',
              boxShadow: '0 4px 18px rgba(102,126,234,0.45)', marginTop: 4,
            }}>
              Sign In
            </Button>
          </Form>

          <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '18px 0 12px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11 }}>DEMO ACCOUNTS</Text>
          </Divider>
          <Space wrap size={6} style={{ justifyContent: 'center', width: '100%', display: 'flex' }}>
            {DEMOS.map((d) => (
              <Button key={d.label} size="small"
                onClick={() => form.setFieldsValue({ email: d.email, password: d.pw })}
                style={{ borderRadius: 6, fontSize: 11, background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}>
                {d.label}
              </Button>
            ))}
          </Space>
          <Text style={{ display: 'block', textAlign: 'center', color: 'rgba(255,255,255,0.28)', fontSize: 11, marginTop: 8 }}>
            All passwords: <strong style={{ color: 'rgba(255,255,255,0.45)' }}>password</strong>
          </Text>
        </Card>
      </div>
    </div>
  )
}