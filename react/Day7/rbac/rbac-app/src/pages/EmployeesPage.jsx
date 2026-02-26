import React, { useEffect, useState } from 'react'
import {
  Card, Table, Button, Modal, Form, Input, Select, Tag,
  Space, Popconfirm, Badge, Tooltip, Row, Col, notification,
} from 'antd'
import { TeamOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from '../app/slices/employeesSlice'
import Can from '../components/Can'



const { Option } = Select
const DEPARTMENTS = ['Engineering', 'HR', 'Sales', 'Marketing', 'Finance', 'Operations']
const DEPT_COLORS = { Engineering: 'blue', HR: 'green', Sales: 'orange', Marketing: 'purple', Finance: 'red', Operations: 'cyan' }

export default function EmployeesPage() {
  const dispatch = useDispatch()
  const { list: employees, loading } = useSelector((s) => s.employees)
  const [form] = Form.useForm()
  const [modal, setModal] = useState({ open: false, record: null })
  const [api, ctx] = notification.useNotification()
  const notify = (type, msg) => api[type]({ message: msg, placement: 'topRight', duration: 3 })

  useEffect(() => { dispatch(fetchEmployees()) }, [])

  const openAdd  = () => { form.resetFields(); setModal({ open: true, record: null }) }
  const openEdit = (r) => { form.setFieldsValue(r); setModal({ open: true, record: r }) }

  const onSave = async (values) => {
    let res = modal.record
      ? await dispatch(updateEmployee({ id: modal.record.id, data: values }))
      : await dispatch(createEmployee(values))
    if (res.meta.requestStatus === 'fulfilled') {
      notify('success', modal.record ? 'Employee updated' : 'Employee added')
      setModal({ open: false, record: null })
    } else {
      notify('error', res.payload || 'Error saving')
    }
  }

  const onDelete = async (id) => {
    const res = await dispatch(deleteEmployee(id))
    if (res.meta.requestStatus === 'fulfilled') notify('success', 'Employee removed')
    else notify('error', res.payload || 'Delete failed')
  }

  const columns = [
    { title: 'Name',       dataIndex: 'name',       key: 'name',       render: (n) => <strong>{n}</strong> },
    { title: 'Email',      dataIndex: 'email',      key: 'email',      render: (e) => <span style={{ color: '#666' }}>{e}</span> },
    {
      title: 'Department', dataIndex: 'department', key: 'department',
      render: (d) => <Tag color={DEPT_COLORS[d] || 'default'}>{d}</Tag>,
    },
    { title: 'Position',   dataIndex: 'position',   key: 'position' },
    { title: 'Join Date',  dataIndex: 'joinDate',   key: 'joinDate' },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s) => <Badge status={s === 'active' ? 'success' : 'error'} text={s} />,
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Space>
          <Can permission="editEmployee">
            <Tooltip title="Edit">
              <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
            </Tooltip>
          </Can>
          <Can permission="deleteEmployee">
            <Popconfirm title="Remove this employee?" onConfirm={() => onDelete(record.id)} okText="Remove" okButtonProps={{ danger: true }}>
              <Tooltip title="Delete">
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Tooltip>
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
        title={<Space><TeamOutlined /><span>Employees</span></Space>}
        extra={
          <Can permission="addEmployee">
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}
              style={{ background: 'linear-gradient(135deg,#52c41a,#237804)', border: 'none' }}>
              Add Employee
            </Button>
          </Can>
        }
        style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
      >
        <Table dataSource={employees} columns={columns} rowKey="id" loading={loading} size="middle" pagination={{ pageSize: 8 }} />
      </Card>

      <Modal title={modal.record ? 'Edit Employee' : 'Add Employee'}
        open={modal.open} onCancel={() => setModal({ open: false, record: null })}
        onOk={() => form.submit()} okText="Save" width={560} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={onSave} style={{ marginTop: 16 }}>
          <Row gutter={14}>
            <Col span={12}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}><Input /></Form.Item>
            </Col>
          </Row>
          <Row gutter={14}>
            <Col span={12}>
              <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                <Select placeholder="Select">
                  {DEPARTMENTS.map((d) => <Option key={d} value={d}>{d}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="position" label="Position" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
          </Row>
          <Row gutter={14}>
            <Col span={12}>
              <Form.Item name="joinDate" label="Join Date"><Input type="date" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select>
                  <Option value="active"><Badge status="success" text="Active" /></Option>
                  <Option value="inactive"><Badge status="error" text="Inactive" /></Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}