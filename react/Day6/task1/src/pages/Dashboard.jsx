import React from "react"
import { Card, Row, Col, Button } from "antd"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

export default function Dashboard() {
  const { user } = useSelector(state => state.auth)

  return (
    <div style={{ padding: 16 }}>
      <Row>
        <Col span={24}>
          <Card title="Dashboard">
            <p>Welcome, <strong>{user?.name}</strong> ({user?.role})</p>
            <p>This is a protected page visible only to authenticated users.</p>
            <div style={{ marginTop: 12 }}>
              <Button type="primary" style={{ marginRight: 8 }}>
                <Link to="/profile">Profile</Link>
              </Button>
              {user?.role === "admin" && (
                <Button>
                  <Link to="/admin">Admin Panel</Link>
                </Button>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}