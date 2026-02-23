import { Card, Table, Button, Space, Tag, Input, Row, Col } from "antd";
import { EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { useState } from "react";

function Users() {
  const [searchText, setSearchText] = useState("");

  // Sample user data
  const usersData = [
    {
      key: "1",
      id: "USR001",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Admin",
      status: "Active",
      joinDate: "2024-01-15"
    },
    {
      key: "2",
      id: "USR002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "User",
      status: "Active",
      joinDate: "2024-02-10"
    },
    {
      key: "3",
      id: "USR003",
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      role: "Editor",
      status: "Inactive",
      joinDate: "2024-01-20"
    },
    {
      key: "4",
      id: "USR004",
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      role: "User",
      status: "Active",
      joinDate: "2024-02-01"
    },
    {
      key: "5",
      id: "USR005",
      name: "Robert Brown",
      email: "robert.brown@example.com",
      role: "User",
      status: "Active",
      joinDate: "2024-02-05"
    },
    {
      key: "6",
      id: "USR006",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "Editor",
      status: "Active",
      joinDate: "2024-02-12"
    }
  ];

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: "15%"
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "20%"
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "25%"
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: "15%",
      render: (role) => {
        let color = "#0066ff";
        if (role === "Admin") color = "#ef4444";
        if (role === "Editor") color = "#f59e0b";
        return <Tag color={color}>{role}</Tag>;
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status) => (
        <Tag color={status === "Active" ? "#10b981" : "#9ca3af"}>
          {status}
        </Tag>
      )
    },
    {
      title: "Actions",
      key: "actions",
      width: "10%",
      render: () => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            style={{ color: "#0066ff" }}
          />
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            style={{ color: "#ef4444" }}
          />
        </Space>
      )
    }
  ];

  const handleSearch = (value) => {
    setSearchText(value);
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "24px", marginTop: 0 }}>Users Management</h1>

      <Card
        style={{
          marginBottom: "24px",
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)"
        }}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12}>
            <Input
              placeholder="Search by name, email, or ID"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} style={{ display: "flex", gap: "8px" }}>
            <Button
              type="primary"
              size="large"
              style={{ marginLeft: "auto" }}
            >
              Add User
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={usersData}
          pagination={{
            pageSize: 10,
            total: usersData.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} users`
          }}
          bordered={false}
          size="large"
        />
      </Card>
    </div>
  );
}

export default Users;