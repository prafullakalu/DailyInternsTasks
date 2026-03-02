import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchTracking,
  addTrackingItem,
  updateTrackingItem,
  deleteTrackingItem,
} from "../features/auth/trackingSlice"
import { logout } from "../features/auth/authSlice"
import { Button, Table, Modal, Form, Input, InputNumber } from "antd"

function Dashboard() {
  const dispatch = useDispatch()
  const { items } = useSelector((state) => state.tracking)
  const { user } = useSelector((state) => state.auth)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const [form] = Form.useForm()

  useEffect(() => {
  dispatch(fetchTracking())
}, [dispatch])
  const openModal = (item) => {
    setEditingItem(item)
    if (item) form.setFieldsValue(item)
    else form.resetFields()
    setIsModalOpen(true)
  }

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingItem) {
        dispatch(updateTrackingItem({ id: editingItem.id, data: values }))
      } else {
        dispatch(addTrackingItem(values))
      }
      setIsModalOpen(false)
      form.resetFields()
      setEditingItem(null)
    })
  }

  const handleDelete = (id) => {
    dispatch(deleteTrackingItem(id))
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome {user.name}</h2>
      <Button type="primary" onClick={() => openModal(null)}>
        Add Tracking
      </Button>
      <Button
        danger
        style={{ marginLeft: 10 }}
        onClick={() => dispatch(logout())}
      >
        Logout
      </Button>

      <Table
        style={{ marginTop: 20 }}
        dataSource={items}
        rowKey="id"
        columns={[
          { title: "Title", dataIndex: "title" },
          { title: "Amount", dataIndex: "amount" },
          {
            title: "Actions",
            render: (_, record) => (
              <>
                <Button onClick={() => openModal(record)}>Edit</Button>
                <Button danger onClick={() => handleDelete(record.id)}>
                  Delete
                </Button>
              </>
            ),
          },
        ]}
      />

      <Modal
        title={editingItem ? "Edit Tracking" : "Add Tracking"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Title" name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Amount"
            name="amount"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Dashboard
