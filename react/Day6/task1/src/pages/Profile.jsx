import React from "react"
import { Card, Row, Col } from "antd"
import { useSelector } from "react-redux"

export default function Profile() {
  const { user } = useSelector(state => state.auth)

  return (
    <div style={{ padding: 16 }}>
      <Row>
        <Col span={24}>
          <Card title="Profile">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p>This page demonstrates access to protected profile data.</p>
          </Card>
        </Col>
      </Row>
    </div>
  )
}