import { Result, Button } from "antd"
import { useNavigate } from "react-router-dom"
import "./Unauthorized.css"

const Unauthorized = () => {
  const navigate = useNavigate()

  return (
    <div className="unauthorized-container">
      <Result
        status="403"
        title="Access Denied"
        subTitle="You don't have permission to access this page. Please contact your administrator if you believe this is a mistake."
        extra={
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            <Button type="primary" onClick={() => navigate("/")}>
              Go to Dashboard
            </Button>
            <Button onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        }
      />
    </div>
  )
}

export default Unauthorized