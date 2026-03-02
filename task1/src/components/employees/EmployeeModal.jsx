import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import {
  addEmployee,
  updateEmployee,
} from "../../features/employees/employeeSlice"

function EmployeeModal({ employee, close }) {
  const dispatch = useDispatch()

  const isEditMode = employee?.id ? true : false

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "IT",
    role: "Employee",
    status: "Active",
  })

  useEffect(() => {
    if (isEditMode) {
      setFormData(employee)
    }
  }, [employee, isEditMode])

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = e => {
    e.preventDefault()

    if (isEditMode) {
      dispatch(updateEmployee(formData))
    } else {
      dispatch(
        addEmployee({
          ...formData,
          id: Date.now(),
        })
      )
    }

    close()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      
      {/* Modal Container */}
      <div className="
        bg-white dark:bg-gray-800
        w-full
        max-w-2xl
        max-h-[90vh]
        overflow-y-auto
        rounded-xl
        shadow-xl
        p-6
      ">

        <h2 className="text-xl font-bold mb-6">
          {isEditMode ? "Edit Employee" : "Add Employee"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="p-2 border rounded w-full"
            />

            <input
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="p-2 border rounded w-full"
            />
          </div>

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="p-2 border rounded w-full"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="p-2 border rounded w-full"
            >
              <option>IT</option>
              <option>HR</option>
              <option>Finance</option>
              <option>Marketing</option>
            </select>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="p-2 border rounded w-full"
            >
              <option>Employee</option>
              <option>Manager</option>
              <option>Admin</option>
            </select>
          </div>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          >
            <option>Active</option>
            <option>On Leave</option>
            <option>Probation</option>
            <option>Terminated</option>
          </select>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 border rounded text-black"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded"
            >
              {isEditMode ? "Update" : "Create"}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default EmployeeModal