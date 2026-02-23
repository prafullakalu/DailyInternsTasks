import { Row, Col, Card, Statistic, Table, Button, Space } from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  RiseOutlined
} from "@ant-design/icons";

function Dashboard() {
  // Sample statistics data
  const stats = [
    {
      title: "Total Users",
      value: 2847,
      icon: <UserOutlined />,
      color: "#0066ff"
    },
    {
      title: "Total Orders",
      value: 1426,
      icon: <ShoppingOutlined />,
      color: "#10b981"
    },
    {
      title: "Revenue",
      value: "$48,295",
      icon: <DollarOutlined />,
      color: "#3b82f6"
    },
    {
      title: "Growth",
      value: "23.5%",
      icon: <RiseOutlined />,
      color: "#8b5cf6"
    }
  ];

  // Sample recent activity data
  const recentActivityData = [
    {
      key: "1",
      user: "John Doe",
      action: "Created new project",
      time: "2 hours ago",
      status: "Completed"
    },
    {
      key: "2",
      user: "Jane Smith",
      action: "Updated profile",
      time: "3 hours ago",
      status: "Completed"
    },
    {
      key: "3",
      user: "Mike Johnson",
      action: "Uploaded files",
      time: "5 hours ago",
      status: "In Progress"
    },
    {
      key: "4",
      user: "Sarah Wilson",
      action: "Shared document",
      time: "1 day ago",
      status: "Completed"
    }
  ];

  const activityColumns = [
    {
      title: "User",
      dataIndex: "user",
      key: "user"
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action"
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time"
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          style={{
            color: status === "Completed" ? "#10b981" : "#f59e0b",
            fontWeight: 500
          }}
        >
          {status}
        </span>
      )
    }
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "24px", marginTop: 0 }}>Dashboard</h1>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "32px" }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              className="stat-box"
              style={{
                borderLeft: `4px solid ${stat.color}`
              }}
            >
              <div>
                <div className="stat-label">{stat.title}</div>
                <div className="stat-number">{stat.value}</div>
              </div>
              <div className="stat-icon">{stat.icon}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Activity Section */}
      <Card style={{ marginBottom: "24px" }}>
        <h2 style={{ marginTop: 0, marginBottom: "16px" }}>Recent Activity</h2>
        <Table
          columns={activityColumns}
          dataSource={recentActivityData}
          pagination={false}
          bordered={false}
        />
      </Card>

      {/* Quick Actions */}
      <Card>
        <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Quick Actions</h3>
        <Space wrap>
          <Button type="primary">Create User</Button>
          <Button>Generate Report</Button>
          <Button>View Analytics</Button>
        </Space>
      </Card>
    </div>
  );
}

export default Dashboard;