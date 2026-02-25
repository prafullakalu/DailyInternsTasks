import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchProjects } from "./projectsSlice"
import { Table, Button } from "antd"
import { hasPermission } from "../../utils/permissionUtils"

const ProjectsPage = () => {
  const dispatch = useDispatch()
  const projects = useSelector((state) => state.projects.list)
  const permissions = useSelector((state) => state.auth.permissions)

  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])

  const canAdd = hasPermission(permissions, "projects", "add")
  const canEdit = hasPermission(permissions, "projects", "edit")
  const canDelete = hasPermission(permissions, "projects", "delete")

  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Owner", dataIndex: "owner", key: "owner" },
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
      {canAdd && <Button type="primary" style={{ marginBottom: 12 }}>Add Project</Button>}
      <Table columns={columns} dataSource={projects} rowKey="id" />
    </div>
  )
}

export default ProjectsPage
