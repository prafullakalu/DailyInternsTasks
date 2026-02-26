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
const ROLE_COLORS = { admin: '#eb2f96', hr: '#52c41a', supervisor: '#1677ff', manager: '#fa8c16' }
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
          <Avatar style={{ background: ROLE_COLORS[r.role] || '#667eea', fontWeight: 700, fontSize: 13 }}>{name?.[0]?.toUpperCase()}</Avatar>
          <span style={{ fontWeight: 500 }}>{name}</span>
        </Space>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (e) => <span style={{ color: '#666' }}>{e}</span> },
    {
      title: 'Role', dataIndex: 'role', key: 'role',
      render: (role) => <Tag color={ROLE_COLORS[role]} style={{ textTransform: 'capitalize', fontWeight: 600 }}>{role}</Tag>,
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Space>
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
        title={<Space><UserOutlined /><span>Users</span></Space>}
        extra={
          <Can permission="addUser">
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}
              style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none' }}>
              Add User
            </Button>
          </Can>
        }
        style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
      >
        <Table dataSource={users} columns={columns} rowKey="id" loading={loading} size="middle" pagination={{ pageSize: 8 }} />
      </Card>

      <Modal title={modal.record ? 'Edit User' : 'Add User'}
        open={modal.open} onCancel={() => setModal({ open: false, record: null })}
        onOk={() => form.submit()} okText="Save" destroyOnClose>
        <Form form={form} layout="vertical" onFinish={onSave} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} placeholder="John Doe" />
          </Form.Item>
          {!modal.record && (
            <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
              <Input prefix={<MailOutlined />} placeholder="john@example.com" />
            </Form.Item>
          )}
          <Form.Item name="password"
            label={modal.record ? 'New Password (blank = keep current)' : 'Password'}
            rules={modal.record ? [] : [{ required: true }, { min: 6 }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
          </Form.Item>
          {/* Role: editable only when ADDING a new user. In edit mode show as read-only tag. */}
          {modal.record ? (
            <Form.Item label="Role">
              <Tag color={ROLE_COLORS[modal.record.role]} style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: 13, padding: '3px 10px' }}>
                {modal.record.role}
              </Tag>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>Role cannot be changed after user creation.</div>
            </Form.Item>
          ) : (
            <Form.Item name="role" label="Role" rules={[{ required: true }]}>
              <Select placeholder="Select role">
                {ROLES.map((r) => (
                  <Option key={r} value={r}><Tag color={ROLE_COLORS[r]} style={{ textTransform: 'capitalize' }}>{r}</Tag></Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  )
}