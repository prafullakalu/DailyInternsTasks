import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
} from "./usersSlice"
import { Table, Button, Modal, Form, Input, Select, Checkbox, message } from "antd"
import { hasPermission } from "../../utils/permissionUtils"
import { fetchRoles } from "../roles/rolesSlice"
import { fetchPermissions } from "../permissions/permissionsSlice"

const { Option } = Select

const UsersPage = () => {
    const dispatch = useDispatch()
    const users = useSelector((state) => state.users.list)
    const roles = useSelector((state) => state.roles.list)
    const permissionsList = useSelector((state) => state.permissions.list)
    const permissions = useSelector((state) => state.auth.permissions)

    const [modalVisible, setModalVisible] = useState(false)
    const [editingUser, setEditingUser] = useState(null)

    const [form] = Form.useForm()

    useEffect(() => {
        dispatch(fetchUsers())
        dispatch(fetchRoles())
        dispatch(fetchPermissions())
    }, [dispatch])

    const canAdd = hasPermission(permissions, "users", "add")
    const canEdit = hasPermission(permissions, "users", "edit")
    const canDelete = hasPermission(permissions, "users", "delete")

    const openModal = (user = null) => {
        setEditingUser(user)
        if (user) {
            form.setFieldsValue({
                name: user.name,
                email: user.email,
                roleId: user.roleId,
                permissionIds: user.permissionIds || []
            })
        } else {
            form.resetFields()
        }
        setModalVisible(true)
    }

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteUser(id)).unwrap()
            message.success("User deleted")
        } catch (err) {
            message.error("Failed to delete")
        }
    }

    const handleFinish = async (values) => {
        try {
            if (editingUser) {
                await dispatch(updateUser({ id: editingUser.id, user: values })).unwrap()
                message.success("User updated")
            } else {
                await dispatch(createUser(values)).unwrap()
                message.success("User created")
            }
            setModalVisible(false)
            dispatch(fetchUsers())
        } catch (err) {
            message.error("Operation failed")
        }
    }

    const columns = [
        { title: "Name", dataIndex: "name" },
        { title: "Email", dataIndex: "email" },
        {
            title: "Actions",
            render: (record) => (
                <>
                    {canEdit && <Button onClick={() => openModal(record)}>Edit</Button>}
                    {canDelete && (
                        <Button danger onClick={() => handleDelete(record.id)}>
                            Delete
                        </Button>
                    )}
                </>
            )
        }
    ]

    return (
        <>
            {canAdd && (
                <Button type="primary" style={{ marginBottom: 12 }} onClick={() => openModal()}>
                    Add User
                </Button>
            )}
            <Table columns={columns} dataSource={users} rowKey="id" />

            <Modal
                title={editingUser ? "Edit User" : "Add User"}
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
                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[{ required: true }]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}
                    <Form.Item name="roleId" label="Role">
                        <Select allowClear>
                            {roles.map((r) => (
                                <Option key={r.id} value={Number(r.id)}>
                                    {r.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="permissionIds" label="Permissions">
                        <Checkbox.Group>
                            {permissionsList.map((p) => (
                                <Checkbox key={p.id} value={Number(p.id)}>
                                    {p.module} - {p.action}
                                </Checkbox>
                            ))}
                        </Checkbox.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default UsersPage