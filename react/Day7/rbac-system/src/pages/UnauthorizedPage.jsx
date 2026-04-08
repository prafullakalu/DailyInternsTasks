import React from 'react'
import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Result
        status="403"
        title="403 – Access Denied"
        subTitle="You don't have permission to access this page. Contact your administrator."
        extra={[
          <Button key="dash" type="primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>,
          <Button key="back" onClick={() => navigate(-1)}>Go Back</Button>,
        ]}
      />
    </div>
  )
}