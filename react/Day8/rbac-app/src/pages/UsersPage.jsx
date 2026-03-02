import React, { useEffect, useState } from 'react'
import {
  Card, Table, Button, Modal, Form, Input, Select, Tag,
  Space, Popconfirm, Avatar, Tooltip, notification,
} from 'antd'
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, MailOutlined, LockOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsers, createUser, updateUser, deleteUser } from '../app/slices/usersSlice'
import Can from '../components/Can'

const { Option } = Select
const ROLE_COLORS = { admin: '#6366f1', hr: '#10b981', supervisor: '#3b82f6', manager: '#f59e0b' }
const ROLES = ['admin', 'hr', 'supervisor', 'manager']

export default function UsersPage() {
  const dispatch = useDispatch()
  const { list: users, loading } = useSelector((s) => s.users)
  const [form] = Form.useForm()
  const [modal, setModal] = useState({ open: false, record: null })
  const [api, ctx] = notification.useNotification()
  const notify = (type, msg) => api[type]({ message: msg, placement: 'topRight', duration: 3 })

  useEffect(() => { dispatch(fetchUsers()) }, [])

  const openAdd  = () => { form.resetFields(); setModal({ open: true, record: null }) }
  const openEdit = (r) => { form.setFieldsValue({ name: r.name, email: r.email, role: r.role, password: '' }); setModal({ open: true, record: r }) }

  const onSave = async (values) => {
    let res
    if (modal.record) {
      const payload = { name: values.name, role: values.role }
      if (values.password) payload.password = values.password
      res = await dispatch(updateUser({ id: modal.record.id, data: payload }))
    } else {
      res = await dispatch(createUser(values))
    }
    if (res.meta.requestStatus === 'fulfilled') {
      notify('success', modal.record ? 'User updated' : 'User created')
      setModal({ open: false, record: null })
    } else {
      notify('error', res.payload || 'Failed')
    }
  }

  const onDelete = async (id) => {
    const res = await dispatch(deleteUser(id))
    if (res.meta.requestStatus === 'fulfilled') notify('success', 'User deleted')
    else notify('error', res.payload || 'Delete failed')
  }

  const columns = [
    {
      title: 'User', dataIndex: 'name', key: 'name',
      render: (name, r) => (
        <Space>
          <Avatar className="font-bold text-sm" style={{ background: ROLE_COLORS[r.role] || '#6366f1', color: '#fff' }}>{name?.[0]?.toUpperCase()}</Avatar>
          <span className="font-medium">{name}</span>
        </Space>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (e) => <span className="text-slate-300">{e}</span> },
    {
      title: 'Role', dataIndex: 'role', key: 'role',
      render: (role) => <Tag color={ROLE_COLORS[role]} className="capitalize font-semibold">{role}</Tag>,
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Space size={6}>
          <Can permission="editUser">
            <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} /></Tooltip>
          </Can>
          <Can permission="deleteUser">
            <Popconfirm title="Delete this user?" onConfirm={() => onDelete(record.id)} okText="Delete" okButtonProps={{ danger: true }}>
              <Tooltip title="Delete"><Button size="small" danger icon={<DeleteOutlined />} /></Tooltip>
            </Popconfirm>
          </Can>
        </Space>
      ),
    },
  ]

  return (
    <>
      {ctx}
      <Card
        title={<Space><UserOutlined /><span className="text-slate-100">Users</span></Space>}
        extra={
          <Can permission="addUser">
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}
              className="rounded-lg font-bold h-10"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}>
              Add User
            </Button>
          </Can>
        }
        className="rounded-xl border-slate-600/30 bg-slate-800/40 backdrop-blur-lg"
        style={{ boxShadow: 'none' }}
      >
        <Table dataSource={users} columns={columns} rowKey="id" loading={loading} size="middle" pagination={{ pageSize: 8 }} 
          className="rbac-table-dark"
          style={{
            background: 'transparent'
          }}
        />
      </Card>

      <Modal title={<span className="text-slate-100">{modal.record ? 'Edit User' : 'Add User'}</span>}
        open={modal.open} onCancel={() => setModal({ open: false, record: null })}
        onOk={() => form.submit()} okText="Save" destroyOnClose
        className="rbac-modal"
        style={{ colorScheme: 'dark' }}
      >
        <Form form={form} layout="vertical" onFinish={onSave} className="mt-4">
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} placeholder="John Doe" className="rounded-lg h-10" />
          </Form.Item>
          {!modal.record && (
            <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
              <Input prefix={<MailOutlined />} placeholder="john@example.com" className="rounded-lg h-10" />
            </Form.Item>
          )}
          <Form.Item name="password"
            label={modal.record ? 'New Password (blank = keep current)' : 'Password'}
            rules={modal.record ? [] : [{ required: true }, { min: 6 }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" className="rounded-lg h-10" />
          </Form.Item>
          {modal.record ? (
            <Form.Item label="Role">
              <Tag color={ROLE_COLORS[modal.record.role]} className="capitalize font-semibold text-sm px-2.5 py-1">
                {modal.record.role}
              </Tag>
              <div className="text-xs text-slate-500 mt-1">Role cannot be changed after user creation.</div>
            </Form.Item>
          ) : (
            <Form.Item name="role" label="Role" rules={[{ required: true }]}>
              <Select placeholder="Select role" className="rounded-lg">
                {ROLES.map((r) => (
                  <Option key={r} value={r}><Tag color={ROLE_COLORS[r]} className="capitalize">{r}</Tag></Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      <style>{`
        .rbac-table-dark .ant-table {
          background: transparent !important;
          color: #e2e8f0;
        }
        .rbac-table-dark .ant-table-thead > tr > th {
          background: rgba(71, 85, 105, 0.4) !important;
          color: #cbd5e1 !important;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2) !important;
          font-weight: 600 !important;
        }
        .rbac-table-dark .ant-table-tbody > tr {
          background: rgba(30, 41, 59, 0.4) !important;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15) !important;
        }
        .rbac-table-dark .ant-table-tbody > tr > td {
          color: #cbd5e1 !important;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15) !important;
        }
        .rbac-table-dark .ant-table-tbody > tr:hover > td {
          background: rgba(51, 65, 85, 0.5) !important;
        }
        .rbac-table-dark .ant-pagination-item-active {
          background: rgba(99, 102, 241, 0.2) !important;
          border-color: #6366f1 !important;
        }
        .rbac-table-dark .ant-pagination-item-active a {
          color: #60a5fa !important;
        }
        .rbac-table-dark .ant-pagination-item {
          background: rgba(51, 65, 85, 0.4) !important;
          border-color: rgba(148, 163, 184, 0.2) !important;
        }
        .rbac-table-dark .ant-pagination-item a {
          color: #cbd5e1 !important;
        }
        .rbac-table-dark .ant-pagination-prev, .rbac-table-dark .ant-pagination-next {
          border-color: rgba(148, 163, 184, 0.2) !important;
        }
        .rbac-table-dark .ant-pagination-prev a, .rbac-table-dark .ant-pagination-next a {
          color: #cbd5e1 !important;
        }
      `}</style>
    </>
  )
}