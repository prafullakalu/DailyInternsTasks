import { useDispatch } from "react-redux"
import { login } from "../features/auth/authSlice"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

function Login() {
  const [username, setUsername] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogin = () => {
    dispatch(login({ username }))
    navigate("/dashboard")
  }

  return (
    <div>
      <h2>Login</h2>
      <input 
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Enter username"
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}

export default Login