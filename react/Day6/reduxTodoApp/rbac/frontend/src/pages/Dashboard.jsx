import { Button, Card } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { hasPermission } from '../utils/permissionUtils'
import { logout } from '../features/auth/authSlice'

const Dashboard = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const permissions = useSelector((state) => state.auth.permissions)

  return (
    <div style={{ padding: 20 }}>
      <Card title={`Welcome ${user?.name || 'User'}`} style={{ maxWidth: 900 }}>
        <p>Use the sidebar or buttons to test permission behavior.</p>
        {hasPermission(permissions, 'users', 'view') && <Button style={{ marginRight: 8 }}>Users</Button>}
        {hasPermission(permissions, 'employees', 'view') && <Button style={{ marginRight: 8 }}>Employees</Button>}
        {hasPermission(permissions, 'projects', 'view') && <Button style={{ marginRight: 8 }}>Projects</Button>}
        <div style={{ marginTop: 16 }}>
          <Button danger onClick={() => dispatch(logout())}>Logout</Button>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard
