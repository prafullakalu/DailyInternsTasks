import { useDispatch, useSelector } from "react-redux"
import { fetchUsers } from "../feture/userSlice"
import { Button, Spin, Alert, List, Card ,} from "antd"
import "./UserSerch.css"

function UserSearch() {
  const dispatch = useDispatch()
  const { users, loading, error } = useSelector(
    (state) => state.users
  )

  const handleFetch = () => {
    dispatch(fetchUsers())
  }

  return (
    <div className="user-search" style={{ padding: 40 }}>
      <Button type="primary" onClick={handleFetch}>
        Fetch Users
      </Button>

      {error && (
        <Alert
          style={{ marginTop: 20 }}
          description={error}
          type="error"
          showIcon
        />
      )}

      {loading && (
        <div style={{ marginTop: 20 }}>
          <Spin size="large" />
        </div>
      )}

      {!loading && users.length > 0 && (
        <List
          style={{ marginTop: 20 }}
          grid={{ gutter: 16, column: 3 }}
          dataSource={users}
          renderItem={(user) => (
            <List.Item>
              <Card title={user.name}>
                <p>Email: {user.email}</p>
                <p>Username: {user.username}</p>
                <p>Company: {user.company.name}</p>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  )
}

export default UserSearch