import React from "react"
import { Card } from "antd"

export default function AdminPage() {
  return (
    <div style={{ padding: 16 }}>
      <Card title="Admin Panel">
        <p>This page is restricted to users with the <strong>admin</strong> role.</p>
        <p>In the simplified app, this demonstrates role-based route protection.</p>
      </Card>
    </div>
  )
}