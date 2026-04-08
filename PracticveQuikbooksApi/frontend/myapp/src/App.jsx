import { useState } from "react"

function App() {
  const [data, setData] = useState(null)

  const handleLogin = () => {
    window.location.href = "http://localhost:5000/auth"
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>QuickBooks OAuth Demo</h1>

      <button onClick={handleLogin}>
        Connect to QuickBooks
      </button>

      {data && (
        <pre>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default App