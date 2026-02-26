import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from "./employeesSlice"
import { Table, Button, Modal, Form, Input, message } from "antd"
import { hasPermission } from "../../utils/permissionUtils"

const EmployeesPage = () => {
  const dispatch = useDispatch()
  const employees = useSelector((state) => state.employees.list)
  const permissions = useSelector((state) => state.auth.permissions)

  const [modalVisible, setModalVisible] = useState(false)
  const [editingEmp, setEditingEmp] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchEmployees())
  }, [dispatch])

  const canAdd = hasPermission(permissions, "employees", "add")
  const canEdit = hasPermission(permissions, "employees", "edit")
  const canDelete = hasPermission(permissions, "employees", "delete")

  const openModal = (emp = null) => {
    setEditingEmp(emp)
    if (emp) {
      form.setFieldsValue(emp)
    } else {
      form.resetFields()
    }
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteEmployee(id)).unwrap()
      message.success("Employee deleted")
    } catch {
      message.error("Failed to delete")
    }
  }

  const handleFinish = async (values) => {
    try {
      if (editingEmp) {
        await dispatch(updateEmployee({ id: editingEmp.id, employee: values })).unwrap()
        message.success("Employee updated")
      } else {
        await dispatch(createEmployee(values)).unwrap()
        message.success("Employee created")
      }
      setModalVisible(false)
      dispatch(fetchEmployees())
    } catch {
      message.error("Operation failed")
    }
  }

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Designation", dataIndex: "designation", key: "designation" },
    {
      title: "Actions",
      key: "actions",
      render: (record) => (
        <>
          {canEdit && <Button type="link" onClick={() => openModal(record)}>Edit</Button>}
          {canDelete && (
            <Button type="link" danger onClick={() => handleDelete(record.id)}>
              Delete
            </Button>
          )}
        </>
      )
    }
  ]

  return (
    <div>
      {canAdd && (
        <Button type="primary" style={{ marginBottom: 12 }} onClick={() => openModal()}>
          Add Employee
        </Button>
      )}
      <Table columns={columns} dataSource={employees} rowKey="id" />

      <Modal
        title={editingEmp ? "Edit Employee" : "Add Employee"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="designation" label="Designation">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default EmployeesPage
