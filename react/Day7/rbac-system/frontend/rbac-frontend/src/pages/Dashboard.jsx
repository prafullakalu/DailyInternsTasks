import { Typography } from "antd"

const { Title, Paragraph } = Typography

const Dashboard = () => {
	return (
		<div>
			<Title level={2}>Dashboard</Title>
			<Paragraph>Welcome to the RBAC demo dashboard.</Paragraph>
		</div>
	)
}

export default Dashboard

