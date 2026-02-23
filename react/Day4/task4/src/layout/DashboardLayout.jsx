import { Layout, Menu, Switch } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { toggleSidebar } from "../features/uiSlice";
import { toggleTheme } from "../features/themeSlice";

const { Header, Sider, Content } = Layout;

function DashboardLayout() {
  const collapsed = useSelector((state) => state.ui.collapsed);
  const mode = useSelector((state) => state.theme.mode);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Set data-theme attribute on document root for CSS theme variables
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  return (
    <Layout style={{ minHeight: "100vh" }} data-theme={mode}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={() => dispatch(toggleSidebar())}
        theme={mode}
      >
        <div className="sider-logo">
          {collapsed ? "AD" : "Admin Dashboard"}
        </div>

        <Menu
          theme={mode}
          mode="inline"
          onClick={({ key }) => navigate(key)}
          items={[
            {
              key: "/",
              icon: <DashboardOutlined />,
              label: "Dashboard"
            },
            {
              key: "/users",
              icon: <UserOutlined />,
              label: "Users"
            },
            {
              key: "/settings",
              icon: <SettingOutlined />,
              label: "Settings"
            }
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingRight: 20
          }}
        >
          <Switch
            checked={mode === "dark"}
            onChange={() => dispatch(toggleTheme())}
            checkedChildren="Dark"
            unCheckedChildren="Light"
          />
        </Header>

        <Content style={{ margin: "16px" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashboardLayout;