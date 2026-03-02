import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { registerUser } from "../features/auth/authSlice"
import { useNavigate, Link } from "react-router-dom"
import { Form, Input, Button, Alert } from "antd"

function Register() {
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isError, message, token } = useSelector((state) => state.auth)

  useEffect(() => {
    if (token) navigate("/dashboard")
  }, [token])

  const onFinish = (values) => {
    dispatch(registerUser(values))
  }

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Register</h2>
      {isError && <Alert type="error" message={message} />}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Register
          </Button>
        </Form.Item>
        <p>
          Already have account? <Link to="/">Login</Link>
        </p>
      </Form>
    </div>
  )
}

export default Register