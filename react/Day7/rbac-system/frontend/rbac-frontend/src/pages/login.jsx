import { Form, Input, Button, message } from "antd"
import { useDispatch } from "react-redux"
import { loginUser } from "../features/auth/authSlice"
import { useNavigate } from "react-router-dom"

const Login = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const onFinish = async (values) => {
		try {
			await dispatch(loginUser(values)).unwrap()
			navigate("/dashboard")
		} catch (err) {
			message.error(err?.message || "Login failed")
		}
	}

	return (
		<div style={{ maxWidth: 380, margin: "80px auto" }}>
			<Form name="login" onFinish={onFinish} layout="vertical">
				<Form.Item name="email" label="Email" rules={[{ required: true }]}> 
					<Input />
				</Form.Item>

				<Form.Item name="password" label="Password" rules={[{ required: true }]}> 
					<Input.Password />
				</Form.Item>

				<Form.Item>
					<Button type="primary" htmlType="submit" block>
						Sign In
					</Button>
				</Form.Item>
			</Form>
		</div>
	)
}

export default Login

