import React, { useEffect, useState } from 'react'
import {
  Table, Button, Modal, Form, Input, Select, Tag,
  Space, Popconfirm, Badge, Tooltip, Row, Col, notification,
} from 'antd'
import { TeamOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from '../app/slices/employeesSlice'
import Can from '../components/Can'

const { Option } = Select

const DEPARTMENTS = ['Engineering', 'HR', 'Sales', 'Marketing', 'Finance', 'Operations']

const DEPT_META = {
  Engineering: { color: '#60a5fa', bg: 'bg-blue-50', border: 'border-blue-200' },
  HR:          { color: '#34d399', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  Sales:       { color: '#fbbf24', bg: 'bg-amber-50', border: 'border-amber-200' },
  Marketing:   { color: '#a78bfa', bg: 'bg-violet-50', border: 'border-violet-200' },
  Finance:     { color: '#f87171', bg: 'bg-red-50', border: 'border-red-200' },
  Operations:  { color: '#22d3ee', bg: 'bg-cyan-50', border: 'border-cyan-200' },
}

export default function EmployeesPage() {
  const dispatch = useDispatch()
  const { list: employees, loading } = useSelector((s) => s.employees)
  const [form] = Form.useForm()
  const [modal, setModal] = useState({ open: false, record: null })
  const [api, ctx] = notification.useNotification()

  const notify = (type, msg) => api[type]({ message: msg, placement: 'topRight', duration: 3 })

  useEffect(() => { dispatch(fetchEmployees()) }, [])

  const openAdd = () => { form.resetFields(); setModal({ open: true, record: null }) }
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
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      render: (n, r) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
            {n?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100">{n}</div>
            <div className="text-xs text-slate-500">{r.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (d) => {
        const meta = DEPT_META[d] || { color: '#94a3b8', bg: 'bg-slate-50', border: 'border-slate-200' }
        return (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${meta.bg} ${meta.border}`} style={{ color: meta.color }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
            {d}
          </div>
        )
      },
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      render: (p) => <span className="text-sm font-medium text-slate-200">{p}</span>,
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (d) => <span className="text-xs text-slate-300 font-mono">{d}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
          s === 'active' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            s === 'active' ? 'bg-emerald-500' : 'bg-red-500'
          }`} />
          <span className="capitalize">{s}</span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 90,
      render: (_, record) => (
        <Space size={6}>
          <Can permission="editEmployee">
            <Tooltip title="Edit employee" mouseEnterDelay={0.4}>
              <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} className="w-7 h-7 rounded-lg flex items-center justify-center border-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors" />
            </Tooltip>
          </Can>
          <Can permission="deleteEmployee">
            <Popconfirm
              title="Remove this employee?"
              description="This action cannot be undone."
              onConfirm={() => onDelete(record.id)}
              okText="Remove"
              okButtonProps={{ danger: true, style: { borderRadius: 8 } }}
              cancelButtonProps={{ style: { borderRadius: 8 } }}
            >
              <Tooltip title="Delete employee" mouseEnterDelay={0.4}>
                <Button size="small" danger icon={<DeleteOutlined />} className="w-7 h-7 rounded-lg flex items-center justify-center border-slate-300 hover:border-red-400 hover:text-red-600 transition-colors" />
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
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <TeamOutlined className="text-lg" />
            </div>
            <div>
              <h2 className="m-0 text-lg font-black text-slate-100">Employees</h2>
              <p className="m-0 text-xs text-slate-400">{employees.length} total · Manage your workforce</p>
            </div>
          </div>
          <Can permission="addEmployee">
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} className="h-10 rounded-lg font-bold px-6" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}>
              Add Employee
            </Button>
          </Can>
        </div>

        {/* Table */}
        <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-600/30 rounded-xl overflow-hidden hover:border-slate-500/40 transition-all">
          <Table
            dataSource={employees}
            columns={columns}
            rowKey="id"
            loading={loading}
            size="middle"
            pagination={{
              pageSize: 8,
              style: { padding: '14px 20px', margin: 0 },
              showSizeChanger: false,
            }}
            className="rbac-table-dark"
          />
        </div>

        {/* Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <TeamOutlined className="text-white text-sm" />
              </div>
              <div>
                <div className="text-base font-black text-slate-100">
                  {modal.record ? 'Edit Employee' : 'Add Employee'}
                </div>
                <div className="text-xs text-slate-400 font-normal">
                  {modal.record ? 'Update employee details' : 'Fill in the details below'}
                </div>
              </div>
            </div>
          }
          open={modal.open}
          onCancel={() => setModal({ open: false, record: null })}
          onOk={() => form.submit()}
          okText="Save changes"
          width={580}
          destroyOnClose
          className="rbac-modal"
          okButtonProps={{ style: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, height: 38, fontWeight: 700 } }}
          cancelButtonProps={{ style: { borderRadius: 8, height: 38, fontWeight: 500 } }}
        >
          <Form form={form} layout="vertical" onFinish={onSave} className="rbac-form" style={{ paddingTop: 4 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                  <Input placeholder="John Doe" className="rounded-lg h-10" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="email" label="Email Address" rules={[{ required: true }, { type: 'email' }]}>
                  <Input placeholder="john@company.com" className="rounded-lg h-10" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                  <Select placeholder="Select department" className="rbac-select">
                    {DEPARTMENTS.map((d) => (
                      <Option key={d} value={d}>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: DEPT_META[d]?.color || '#94a3b8' }} />
                          {d}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="position" label="Job Position" rules={[{ required: true }]}>
                  <Input placeholder="e.g. Senior Developer" className="rounded-lg h-10" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="joinDate" label="Join Date">
                  <Input type="date" className="rounded-lg h-10" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" label="Employment Status" rules={[{ required: true }]}>
                  <Select className="rbac-select">
                    <Option value="active">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-emerald-500" />
                        Active
                      </div>
                    </Option>
                    <Option value="inactive">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-red-500" />
                        Inactive
                      </div>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
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