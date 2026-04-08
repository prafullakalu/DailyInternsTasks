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
    <div className="min-h-screen flex items-center justify-center
      bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900
      px-4"
    >
      <div
        className="
          w-full max-w-md p-8
          backdrop-blur-xl
          bg-white/10
          border border-white/20
          rounded-2xl
          shadow-2xl
          text-white
        "
      >
        <h2 className="text-3xl font-bold mb-8 text-center tracking-wide">
          Employee Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="
              w-full p-3 rounded-xl
              bg-white/20
              border border-white/30
              placeholder-white/70
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-400
              transition
            "
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="
              w-full p-3 rounded-xl
              bg-white/20
              border border-white/30
              placeholder-white/70
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-400
              transition
            "
            onChange={e => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="
              w-full py-3 rounded-xl
              bg-indigo-500
              hover:bg-indigo-600
              transition
              font-semibold
              shadow-lg text-black
            "
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login