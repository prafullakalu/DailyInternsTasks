import React, { useEffect, useState } from 'react'
import {
  Card, Table, Button, Modal, Form, Input, Select, Badge,
  Space, Popconfirm, Tooltip, Row, Col, Typography, notification,
} from 'antd'
import { ProjectOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProjects, createProject, updateProject, deleteProject } from '../app/slices/projectsSlice'
import Can from '../components/Can'

const { Option } = Select
const { Text } = Typography

const STATUS_COLORS = { active: 'processing', completed: 'success', 'on-hold': 'warning', cancelled: 'error' }
const STATUS_OPTIONS = ['active', 'completed', 'on-hold', 'cancelled']

export default function ProjectsPage() {
  const dispatch = useDispatch()
  const { list: projects, loading } = useSelector((s) => s.projects)
  const [form] = Form.useForm()
  const [modal, setModal] = useState({ open: false, record: null })
  const [api, ctx] = notification.useNotification()
  const notify = (type, msg) => api[type]({ message: msg, placement: 'topRight', duration: 3 })

  useEffect(() => { dispatch(fetchProjects()) }, [])

  const openAdd  = () => { form.resetFields(); setModal({ open: true, record: null }) }
  const openEdit = (r) => { form.setFieldsValue(r); setModal({ open: true, record: r }) }

  const onSave = async (values) => {
    let res = modal.record
      ? await dispatch(updateProject({ id: modal.record.id, data: values }))
      : await dispatch(createProject(values))
    if (res.meta.requestStatus === 'fulfilled') {
      notify('success', modal.record ? 'Project updated' : 'Project created')
      setModal({ open: false, record: null })
    } else {
      notify('error', res.payload || 'Error saving')
    }
  }

  const onDelete = async (id) => {
    const res = await dispatch(deleteProject(id))
    if (res.meta.requestStatus === 'fulfilled') notify('success', 'Project deleted')
    else notify('error', res.payload || 'Delete failed')
  }

  const columns = [
    { title: 'Name',        dataIndex: 'name',        key: 'name',        render: (n) => <Text strong>{n}</Text> },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true, render: (d) => <Text type="secondary">{d}</Text> },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s) => <Badge status={STATUS_COLORS[s] || 'default'} text={s} />,
    },
    { title: 'Budget',     dataIndex: 'budget',    key: 'budget',    render: (b) => b ? `$${b.toLocaleString()}` : '—' },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
    { title: 'End Date',   dataIndex: 'endDate',   key: 'endDate' },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Space>
          <Can permission="editProject">
            <Tooltip title="Edit">
              <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
            </Tooltip>
          </Can>
          <Can permission="deleteProject">
            <Popconfirm title="Delete this project?" onConfirm={() => onDelete(record.id)} okText="Delete" okButtonProps={{ danger: true }}>
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
        title={<Space><ProjectOutlined /><span>Projects</span></Space>}
        extra={
          <Can permission="addProject">
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}
              style={{ background: 'linear-gradient(135deg,#fa8c16,#d46b08)', border: 'none' }}>
              Add Project
            </Button>
          </Can>
        }
        style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
      >
        <Table dataSource={projects} columns={columns} rowKey="id" loading={loading} size="middle" pagination={{ pageSize: 8 }} />
      </Card>

      <Modal title={modal.record ? 'Edit Project' : 'New Project'}
        open={modal.open} onCancel={() => setModal({ open: false, record: null })}
        onOk={() => form.submit()} okText="Save" width={600} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={onSave} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Project Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
          <Row gutter={14}>
            <Col span={8}>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select>
                  {STATUS_OPTIONS.map((s) => (
                    <Option key={s} value={s}><Badge status={STATUS_COLORS[s]} text={s} /></Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="budget" label="Budget ($)"><Input type="number" min={0} /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="startDate" label="Start Date"><Input type="date" /></Form.Item>
            </Col>
          </Row>
          <Form.Item name="endDate" label="End Date"><Input type="date" /></Form.Item>
        </Form>
      </Modal>
    </>
  )
}