import React from "react"
import { Form, Input, Button, Card, Row, Col, message } from "antd"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import { useDispatch } from "react-redux"
import { login } from "../features/auth/authSlice"
import { useNavigate } from "react-router-dom"

const mockUsers = {
  "admin@example.com": { password: "admin123", name: "Admin User", role: "admin" },
  "user@example.com": { password: "user123", name: "Regular User", role: "user" }
}

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onFinish = ({ email, password }) => {
    const user = mockUsers[email]
    if (!user) {
      message.error("User not found")
      return
    }
    if (user.password !== password) {
      message.error("Invalid password")
      return
    }

    const userData = { email, name: user.name, role: user.role }
    dispatch(login(userData))
    navigate("/")
  }

  return (
    <Row justify="center" align="middle" style={{ minHeight: "80vh" }}>
      <Col xs={22} sm={16} md={12} lg={8}>
        <Card title="Sign in">
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="email" rules={[{ required: true, type: "email" }]}> 
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true }]}> 
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Login
              </Button>
            </Form.Item>
          </Form>
          <div style={{ fontSize: 12, color: "#666" }}>
            Demo: admin@example.com / admin123  —  user@example.com / user123
          </div>
        </Card>
      </Col>
    </Row>
  )
}