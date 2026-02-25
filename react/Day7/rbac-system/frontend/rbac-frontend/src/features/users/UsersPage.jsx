import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchUsers } from "./usersSlice"
import { Table, Button } from "antd"
import { hasPermission } from "../../utils/permissionUtils"

const UsersPage = () => {
    const dispatch = useDispatch()
    const users = useSelector((state) => state.users.list)
    const permissions = useSelector((state) => state.auth.permissions)

    useEffect(() => {
        dispatch(fetchUsers())
    }, [dispatch])

    const canAdd = hasPermission(permissions, "users", "add")
    const canEdit = hasPermission(permissions, "users", "edit")
    const canDelete = hasPermission(permissions, "users", "delete")

    const columns = [
        { title: "Name", dataIndex: "name" },
        { title: "Email", dataIndex: "email" },
        {
            title: "Actions",
            render: () => (
                <>
                    {canEdit && <Button>Edit</Button>}
                    {canDelete && <Button danger>Delete</Button>}
                </>
            )
        }
    ]

    return (
        <>
            {canAdd && <Button type="primary">Add User</Button>}
            <Table columns={columns} dataSource={users} rowKey="id" />
        </>
    )
}

export default UsersPage