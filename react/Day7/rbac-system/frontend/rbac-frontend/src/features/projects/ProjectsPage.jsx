import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject
} from "./projectsSlice"
import { Table, Button, Modal, Form, Input, message } from "antd"
import { hasPermission } from "../../utils/permissionUtils"

const ProjectsPage = () => {
  const dispatch = useDispatch()
  const projects = useSelector((state) => state.projects.list)
  const permissions = useSelector((state) => state.auth.permissions)

  const [modalVisible, setModalVisible] = useState(false)
  const [editingProj, setEditingProj] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])

  const canAdd = hasPermission(permissions, "projects", "add")
  const canEdit = hasPermission(permissions, "projects", "edit")
  const canDelete = hasPermission(permissions, "projects", "delete")

  const openModal = (proj = null) => {
    setEditingProj(proj)
    if (proj) {
      form.setFieldsValue(proj)
    } else {
      form.resetFields()
    }
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteProject(id)).unwrap()
      message.success("Project deleted")
    } catch {
      message.error("Failed to delete")
    }
  }

  const handleFinish = async (values) => {
    try {
      if (editingProj) {
        await dispatch(updateProject({ id: editingProj.id, project: values })).unwrap()
        message.success("Project updated")
      } else {
        await dispatch(createProject(values)).unwrap()
        message.success("Project created")
      }
      setModalVisible(false)
      dispatch(fetchProjects())
    } catch {
      message.error("Operation failed")
    }
  }

  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Owner", dataIndex: "owner", key: "owner" },
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
          Add Project
        </Button>
      )}
      <Table columns={columns} dataSource={projects} rowKey="id" />

      <Modal
        title={editingProj ? "Edit Project" : "Add Project"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="owner" label="Owner">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProjectsPage
