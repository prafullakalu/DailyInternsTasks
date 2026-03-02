import { useDispatch } from "react-redux"
import { loginSuccess } from "../features/auth/authSlice"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = e => {
    e.preventDefault()

    if (email && password) {
      dispatch(loginSuccess({ email }))
      navigate("/")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-secondary">
      <div className="bg-black/90 dark:bg-indigo-900 p-8 rounded-xl shadow-soft w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white ">
          Employee Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg dark:bg-gray-700 text-gray-900 text-white"
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg dark:bg-gray-700 text-gray-900 text-white"
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login