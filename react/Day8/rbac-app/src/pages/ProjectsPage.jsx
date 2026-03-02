import React, { useEffect, useState } from 'react'
import {
  Table, Button, Modal, Form, Input, Select, Badge,
  Space, Popconfirm, Tooltip, Row, Col, Typography, notification,
} from 'antd'
import { ProjectOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProjects, createProject, updateProject, deleteProject } from '../app/slices/projectsSlice'
import Can from '../components/Can'

const { Option } = Select
const { Text } = Typography

const STATUS_META = {
  active:    { color: '#10b981', bg: 'bg-emerald-100', border: 'border-emerald-200', dot: '#10b981', label: 'Active',    pulse: true  },
  completed: { color: '#60a5fa', bg: 'bg-blue-100', border: 'border-blue-200', dot: '#60a5fa', label: 'Completed', pulse: false },
  'on-hold': { color: '#fbbf24', bg: 'bg-amber-100', border: 'border-amber-200', dot: '#fbbf24', label: 'On Hold',   pulse: false },
  cancelled: { color: '#f87171', bg: 'bg-red-100', border: 'border-red-200', dot: '#f87171', label: 'Cancelled', pulse: false },
}
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
    {
      title: 'Project',
      dataIndex: 'name',
      key: 'name',
      render: (n, r) => (
        <div>
          <div className="text-sm font-bold text-slate-100 mb-0.5">{n}</div>
          {r.description && <div className="text-xs text-slate-500 max-w-xs truncate">{r.description}</div>}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => {
        const meta = STATUS_META[s] || STATUS_META.active
        return (
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border`}
            style={{ color: meta.color, background: `rgba(${parseInt(meta.dot.slice(1, 3), 16)}, ${parseInt(meta.dot.slice(3, 5), 16)}, ${parseInt(meta.dot.slice(5, 7), 16)}, 0.1)`, borderColor: meta.color + '40' }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.dot }} />
            {meta.label}
          </div>
        )
      },
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      render: (b) => b ? (
        <span className="text-sm font-semibold text-emerald-300 font-mono">${Number(b).toLocaleString()}</span>
      ) : <span className="text-slate-400">—</span>,
    },
    {
      title: 'Start',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (d) => <span className="text-xs text-slate-600 font-mono">{d || '—'}</span>,
    },
    {
      title: 'End',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (d) => <span className="text-xs text-slate-600 font-mono">{d || '—'}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 90,
      render: (_, record) => (
        <Space size={4}>
          <Can permission="editProject">
            <Tooltip title="Edit project">
              <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}
                className="w-7 h-7 flex items-center justify-center rounded-md border-slate-300 hover:border-amber-400 hover:text-amber-600 transition-colors" />
            </Tooltip>
          </Can>
          <Can permission="deleteProject">
            <Popconfirm title="Delete project?" description="This action cannot be undone." onConfirm={() => onDelete(record.id)} okText="Delete" cancelText="Cancel">
              <Tooltip title="Delete project">
                <Button size="small" danger icon={<DeleteOutlined />}
                  className="w-7 h-7 flex items-center justify-center rounded-md border-red-300 hover:border-red-500 transition-colors" />
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
      <div className="max-w-6xl">

        {/* Page header */}
        <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-600/30 rounded-xl p-6 mb-5 flex items-center justify-between animate-in slide-in-from-top fade-in duration-300 hover:border-slate-500/40 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
              <ProjectOutlined className="text-lg" />
            </div>
            <div>
              <h2 className="m-0 text-lg font-black text-slate-100">Projects</h2>
              <p className="m-0 text-xs text-slate-400">
                {projects.length} total · {projects.filter(p => p.status === 'active').length} active
              </p>
            </div>
          </div>
          <Can permission="addProject">
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}
              className="rounded-lg font-bold h-9"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
              New Project
            </Button>
          </Can>
        </div>

        {/* Table */}
        <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-600/30 rounded-xl overflow-hidden hover:border-slate-500/40 transition-all">
          <Table
            dataSource={projects}
            columns={columns}
            rowKey="id"
            loading={loading}
            size="middle"
            pagination={{ pageSize: 8 }}
            className="rbac-table-dark"
          />
        </div>

        {/* Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                <ProjectOutlined className="text-sm" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100">{modal.record ? 'Edit Project' : 'New Project'}</div>
                <div className="text-xs text-slate-400">{modal.record ? 'Update details' : 'Create new entry'}</div>
              </div>
            </div>
          }
          open={modal.open}
          onCancel={() => setModal({ open: false, record: null })}
          onOk={() => form.submit()}
          okText="Save project"
          width={580}
          destroyOnClose
        >
          <Form form={form} layout="vertical" onFinish={onSave} className="mt-4">
            <Form.Item name="name" label="Project Name" rules={[{ required: true }]}>
              <Input placeholder="e.g. Website Redesign" className="rounded-lg h-10" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={2} placeholder="Brief description..." className="rounded-lg" />
            </Form.Item>
            <Row gutter={14}>
              <Col span={8}>
                <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                  <Select className="rounded-lg">
                    {STATUS_OPTIONS.map((s) => {
                      const meta = STATUS_META[s]
                      return (
                        <Option key={s} value={s}>
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.dot }} />
                            {meta.label}
                          </div>
                        </Option>
                      )
                    })}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="budget" label="Budget">
                  <Input type="number" min={0} placeholder="0" className="rounded-lg h-10" prefix="$" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="startDate" label="Start Date">
                  <Input type="date" className="rounded-lg h-10" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="endDate" label="End Date">
              <Input type="date" className="rounded-lg h-10" />
            </Form.Item>
          </Form>
        </Modal>

      </div>

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