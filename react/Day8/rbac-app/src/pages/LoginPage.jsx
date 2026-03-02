import React, { useEffect } from 'react'
import { Form, Input, Button, Typography, Divider, Alert, Space } from 'antd'
import { MailOutlined, LockOutlined, SafetyCertificateOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginThunk, clearError } from '../app/slices/authSlice'
import { isTokenValid } from '../services/authService'

const { Title, Text } = Typography

const DEMOS = [
  { label: 'Admin',      email: 'admin@rbac.com',     pw: 'password', color: '#f472b6' },
  { label: 'HR',         email: 'hr@rbac.com',         pw: '1234',     color: '#34d399' },
  { label: 'Supervisor', email: 'supervisor@rbac.com', pw: 'password', color: '#60a5fa' },
  { label: 'Manager',    email: 'manager@rbac.com',    pw: 'password', color: '#fbbf24' },
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
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center p-5 overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background orbs with professional glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="blur-3xl opacity-40 absolute -top-1/2 -left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)' }} />
        <div className="blur-3xl opacity-30 absolute -bottom-1/3 -right-1/4 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)' }} />
        <div className="blur-3xl opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)' }} />
      </div>

      {/* Sophisticated backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />

      <div className="w-full max-w-sm relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <SafetyCertificateOutlined className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-50 mb-1 tracking-tight">
            RBAC System
          </h1>
          <p className="text-sm text-slate-400">
            Role-Based Access Control Platform
          </p>
        </div>

        {/* Card with glass-morphism */}
        <div className="bg-slate-800/30 backdrop-blur-3xl border border-slate-600/30 rounded-3xl p-8 shadow-2xl hover:shadow-2xl transition-all">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/20 border border-red-900/40">
              <span className="text-2xl mr-3">⚠️</span>
              <span className="text-red-200 text-xs font-medium">{error}</span>
            </div>
          )}

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="email"
              label={<span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Email Address</span>}
              rules={[{ required: true }, { type: 'email' }]}
              className="mb-4"
            >
              <Input
                prefix={<MailOutlined className="text-slate-500" />}
                placeholder="you@company.com"
                className="h-12 rounded-xl bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder-slate-600 transition-all hover:border-indigo-500/50 focus:border-indigo-500 focus:bg-slate-800 focus:shadow-lg focus:shadow-indigo-500/20"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Password</span>}
              rules={[{ required: true }]}
              className="mb-6"
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-500" />}
                placeholder="Enter your password"
                className="h-12 rounded-xl bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder-slate-600 transition-all hover:border-indigo-500/50 focus:border-indigo-500 focus:bg-slate-800 focus:shadow-lg focus:shadow-indigo-500/20"
                size="large"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="h-12 rounded-lg font-bold tracking-wide"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {!loading && 'Sign In'}
            </Button>
          </Form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-700/30" />
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Demo Accounts</span>
            <div className="flex-1 h-px bg-slate-700/30" />
          </div>

          {/* Demo pills */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {DEMOS.map((d) => (
              <button
                key={d.label}
                onClick={() => form.setFieldsValue({ email: d.email, password: d.pw })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-tight transition-all hover:scale-105"
                style={{
                  background: `rgba(${parseInt(d.color.slice(1, 3), 16)}, ${parseInt(d.color.slice(3, 5), 16)}, ${parseInt(d.color.slice(5, 7), 16)}, 0.1)`,
                  border: `1px solid ${d.color}40`,
                  color: d.color,
                }}
              >
                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: d.color }} />
                {d.label}
              </button>
            ))}
          </div>

          <p className="text-center text-slate-500 text-xs mt-3 font-mono">
            password: <span className="text-slate-600">password</span>
          </p>
        </div>

      </div>
    </div>
  )
}