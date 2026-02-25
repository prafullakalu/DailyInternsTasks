import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchRoles } from "./rolesSlice"
import { Table } from "antd"

const RolesPage = () => {
  const dispatch = useDispatch()
  const roles = useSelector((state) => state.roles.list)

  useEffect(() => {
    dispatch(fetchRoles())
  }, [dispatch])

  const columns = [{ title: "Name", dataIndex: "name", key: "name" }]

  return <Table columns={columns} dataSource={roles} rowKey="id" />
}

export default RolesPage
