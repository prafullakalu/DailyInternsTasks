import { Layout, Menu, Button } from "antd"
import "./LayoutShell.css"
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  SettingOutlined
} from "@ant-design/icons"

import { Link, Outlet, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { toggleSidebar } from "../feture/uiSlice"

const { Sider, Header, Content } = Layout

function LayoutShell() {
  const dispatch = useDispatch()
  const collapsed = useSelector((state) => state.ui.collapsed)

  const location = useLocation()

  return (
    <Layout className="layout-shell" style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={[
            {
              key: "/",
              icon: <DashboardOutlined />,
              label: <Link to="/">Dashboard</Link>
            },
            {
              key: "/settings",
              icon: <SettingOutlined />,
              label: <Link to="/settings">Settings</Link>
            }
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: "#fff" }}>
          <Button
            type="text"
            icon={
              collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
            }
            onClick={() => dispatch(toggleSidebar())}
            style={{ fontSize: "18px", width: 64, height: 64 }}
          />
        </Header>

        <Content style={{ margin: "16px" }}>
          <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default LayoutShell