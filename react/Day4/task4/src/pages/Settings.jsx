import { Card, Form, Input, Select, Button, Switch, Row, Col, Divider } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useState } from "react";

function Settings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Settings saved:", values);
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginTop: 0, marginBottom: "32px" }}>Settings</h1>

      {/* General Settings Card */}
      <Card
        title={<h2 style={{ marginBottom: 0 }}>General Settings</h2>}
        style={{
          marginBottom: "24px",
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)"
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Application Name"
                name="appName"
                initialValue="Admin Dashboard"
              >
                <Input placeholder="Enter application name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Organization Name"
                name="orgName"
                initialValue="Your Company"
              >
                <Input placeholder="Enter organization name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email Address"
                name="email"
                initialValue="admin@example.com"
              >
                <Input type="email" placeholder="Enter email address" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Support Email"
                name="supportEmail"
                initialValue="support@example.com"
              >
                <Input type="email" placeholder="Enter support email" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Website URL"
            name="website"
            initialValue="https://example.com"
          >
            <Input placeholder="Enter website URL" />
          </Form.Item>

          <Divider />

          <Form.Item
            label="Timezone"
            name="timezone"
            initialValue="UTC"
          >
            <Select
              options={[
                { label: "UTC", value: "UTC" },
                { label: "EST", value: "EST" },
                { label: "CST", value: "CST" },
                { label: "PST", value: "PST" },
                { label: "IST", value: "IST" }
              ]}
            />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Items Per Page"
                name="itemsPerPage"
                initialValue="10"
              >
                <Select
                  options={[
                    { label: "5", value: "5" },
                    { label: "10", value: "10" },
                    { label: "20", value: "20" },
                    { label: "50", value: "50" }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Language"
                name="language"
                initialValue="English"
              >
                <Select
                  options={[
                    { label: "English", value: "English" },
                    { label: "Spanish", value: "Spanish" },
                    { label: "French", value: "French" },
                    { label: "German", value: "German" }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
            >
              Save General Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Notification Settings Card */}
      <Card
        title={<h2 style={{ marginBottom: 0 }}>Notification Settings</h2>}
        style={{
          marginBottom: "24px",
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)"
        }}
      >
        <Form layout="vertical">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              paddingBottom: "16px",
              borderBottom: "1px solid var(--border-color)"
            }}
          >
            <div>
              <h4 style={{ margin: 0, marginBottom: "4px" }}>
                Email Notifications
              </h4>
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                Receive email updates about your account
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              paddingBottom: "16px",
              borderBottom: "1px solid var(--border-color)"
            }}
          >
            <div>
              <h4 style={{ margin: 0, marginBottom: "4px" }}>
                Push Notifications
              </h4>
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                Get instant notifications on your device
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              paddingBottom: "16px",
              borderBottom: "1px solid var(--border-color)"
            }}
          >
            <div>
              <h4 style={{ margin: 0, marginBottom: "4px" }}>
                Marketing Emails
              </h4>
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                Receive promotional and marketing content
              </p>
            </div>
            <Switch />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <h4 style={{ margin: 0, marginBottom: "4px" }}>
                Security Alerts
              </h4>
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                Get alerts about security-related activities
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </Form>
      </Card>

      {/* Privacy & Security Card */}
      <Card
        title={<h2 style={{ marginBottom: 0 }}>Privacy & Security</h2>}
        style={{
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)"
        }}
      >
        <Form layout="vertical">
          <Form.Item>
            <Button size="large">Change Password</Button>
          </Form.Item>

          <Form.Item>
            <Button size="large">Two-Factor Authentication</Button>
          </Form.Item>

          <Form.Item>
            <Button size="large" danger>
              Delete Account
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Settings;