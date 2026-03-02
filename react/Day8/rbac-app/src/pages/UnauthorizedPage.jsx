import React from 'react'
import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="text-center max-w-md">
        <Result
          status="403"
          title={<span className="text-3xl font-black text-slate-100">403 – Access Denied</span>}
          subTitle={<span className="text-slate-400">You don't have permission to access this page. Contact your administrator.</span>}
          extra={[
            <Button key="dash" type="primary" onClick={() => navigate('/dashboard')}
              className="rounded-lg font-bold h-10 px-6 bg-indigo-600 border-none hover:bg-indigo-700">
              Back to Dashboard
            </Button>,
            <Button key="back" onClick={() => navigate(-1)}
              className="rounded-lg font-bold h-9 px-6 mt-2">
              Go Back
            </Button>,
          ]}
        />
      </div>
    </div>
  )
}