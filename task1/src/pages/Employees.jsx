import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect } from "react"
import {
  deleteEmployee,
  setSearch,
  setDepartmentFilter,
  setStatusFilter,
  setPage,
} from "../features/employees/employeeSlice"
import EmployeeModal from "../components/employees/EmployeeModal"
import Skeleton from "../components/ui/Skeleton"

function Employees() {
  const dispatch = useDispatch()

  const {
    employees,
    search,
    departmentFilter,
    statusFilter,
    currentPage,
    itemsPerPage,
  } = useSelector(state => state.employees)

  const [editingEmployee, setEditingEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (employees.length < 1) {
      dispatch({ type: "employees/loadInitial" })
    }
  }, [employees.length, dispatch])

  // loading skeleton
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const filtered = employees
    .filter(e =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase())
    )
    .filter(e => departmentFilter === "All" || e.department === departmentFilter)
    .filter(e => statusFilter === "All" || e.status === statusFilter)

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const start = (currentPage - 1) * itemsPerPage
  const paginated = filtered.slice(start, start + itemsPerPage)

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      dispatch(setPage(1))
    }
  }, [totalPages, currentPage, dispatch])

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-bold">Employees</h2>

        <button
          onClick={() => setEditingEmployee({})}
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          Add Employee
        </button>
      </div>

      {/* FILTERS */}
      <div className="grid md:grid-cols-4 gap-4">
        <input
          placeholder="Search..."
          className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-inner"
          value={search}
          onChange={e => dispatch(setSearch(e.target.value))}
        />

        <select
          className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-inner"
          value={departmentFilter}
          onChange={e => dispatch(setDepartmentFilter(e.target.value))}
        >
          <option>All</option>
          <option>IT</option>
          <option>HR</option>
          <option>Finance</option>
          <option>Marketing</option>
        </select>

        <select
          className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-inner"
          value={statusFilter}
          onChange={e => dispatch(setStatusFilter(e.target.value))}
        >
          <option>All</option>
          <option>Active</option>
          <option>On Leave</option>
          <option>Terminated</option>
          <option>Probation</option>
        </select>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-auto">
        <table className="w-full text-sm table-auto">
          <thead className="border-b bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Department</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading
              ? Array.from({ length: itemsPerPage }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="p-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="p-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-3"><Skeleton className="h-4 w-20" /></td>
                  </tr>
                ))
              : paginated.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3">{emp.firstName} {emp.lastName}</td>
                    <td className="p-3">{emp.email}</td>
                    <td className="p-3">{emp.department}</td>
                    <td className="p-3">{emp.role}</td>
                    <td className="p-3">{emp.status}</td>
                    <td className="p-3">
                      <div className="flex gap-4">
                        <button
                          onClick={() => setEditingEmployee(emp)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => dispatch(deleteEmployee(emp.id))}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-4">
        {paginated.map(emp => (
          <div key={emp.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-soft">
            <p className="font-semibold text-lg">
              {emp.firstName} {emp.lastName}
            </p>
            <p className="text-sm">{emp.email}</p>
            <p className="text-sm">{emp.department}</p>
            <p className="text-sm">{emp.role}</p>
            <p className="text-sm">{emp.status}</p>

            <div className="mt-2 flex gap-4">
              <button
                onClick={() => setEditingEmployee(emp)}
                className="text-blue-600 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => dispatch(deleteEmployee(emp.id))}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => dispatch(setPage(i + 1))}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1
                ? "bg-primary text-white"
                : "border"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {editingEmployee !== null && (
        <EmployeeModal
          employee={editingEmployee}
          close={() => setEditingEmployee(null)}
        />
      )}
    </div>
  )
}

export default Employees