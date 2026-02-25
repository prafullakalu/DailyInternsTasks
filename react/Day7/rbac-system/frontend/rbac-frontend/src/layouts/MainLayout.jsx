import { Layout, Menu, Button } from "antd"
import { useNavigate, Outlet } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "../features/auth/authSlice"
import { hasPermission } from "../utils/permissionUtils"

const { Header, Sider, Content } = Layout

const MainLayout = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const permissions = useSelector((state) => state.auth.permissions)

    const handleLogout = () => {
        dispatch(logout())
        navigate("/login")
    }

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider>
                <Menu theme="dark" mode="inline">
                    {hasPermission(permissions, "users", "view") &&
                        <Menu.Item onClick={() => navigate("/users")}>Users</Menu.Item>}

                    {hasPermission(permissions, "roles", "view") &&
                        <Menu.Item onClick={() => navigate("/roles")}>Roles</Menu.Item>}

                    {hasPermission(permissions, "employees", "view") &&
                        <Menu.Item onClick={() => navigate("/employees")}>Employees</Menu.Item>}

                    {hasPermission(permissions, "projects", "view") &&
                        <Menu.Item onClick={() => navigate("/projects")}>Projects</Menu.Item>}
                </Menu>
            </Sider>

            <Layout>
                <Header style={{ textAlign: "right" }}>
                    <Button onClick={handleLogout}>Logout</Button>
                </Header>
                <Content style={{ padding: 20 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    )
}

export default MainLayout