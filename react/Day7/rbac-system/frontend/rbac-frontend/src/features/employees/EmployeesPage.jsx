import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchEmployees } from "./employeesSlice"
import { Table, Button } from "antd"
import { hasPermission } from "../../utils/permissionUtils"

const EmployeesPage = () => {
  const dispatch = useDispatch()
  const employees = useSelector((state) => state.employees.list)
  const permissions = useSelector((state) => state.auth.permissions)

  useEffect(() => {
    dispatch(fetchEmployees())
  }, [dispatch])

  const canAdd = hasPermission(permissions, "employees", "add")
  const canEdit = hasPermission(permissions, "employees", "edit")
  const canDelete = hasPermission(permissions, "employees", "delete")

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Designation", dataIndex: "designation", key: "designation" },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <>
          {canEdit && <Button type="link">Edit</Button>}
          {canDelete && <Button type="link" danger>Delete</Button>}
        </>
      )
    }
  ]

  return (
    <div>
      {canAdd && <Button type="primary" style={{ marginBottom: 12 }}>Add Employee</Button>}
      <Table columns={columns} dataSource={employees} rowKey="id" />
    </div>
  )
}

export default EmployeesPage
