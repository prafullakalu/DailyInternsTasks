import { useDispatch, useSelector } from "react-redux"
import { logout } from "../features/auth/authSlice"
import { addTodo, deleteTodo } from "../features/todos/todoSlice"
import { increment, decrement } from "../features/counter/counterSlice"
import { useState } from "react"

function Dashboard() {
  const dispatch = useDispatch()
  const todos = useSelector(state => state.todos.items)
  const counter = useSelector(state => state.counter.value)
  const user = useSelector(state => state.auth.user)
  const [text, setText] = useState("")

  return (
    <div>
      <h2>Welcome {user}</h2>
      <button onClick={() => dispatch(logout())}>Logout</button>

      <h3>Counter (Not Persisted)</h3>
      <button onClick={() => dispatch(decrement())}>-</button>
      <span>{counter}</span>
      <button onClick={() => dispatch(increment())}>+</button>

      <h3>Todo List (Persisted)</h3>
      <input 
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button onClick={() => {
        dispatch(addTodo(text))
        setText("")
      }}>Add</button>

      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text}
            <button onClick={() => dispatch(deleteTodo(todo.id))}>
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Dashboard