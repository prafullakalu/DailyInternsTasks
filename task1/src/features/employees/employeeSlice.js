import { createSlice, nanoid } from "@reduxjs/toolkit"

const initialState = {
  employees: [
    {
      id: nanoid(),
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "555-1234",
      department: "IT",
      jobTitle: "Frontend Developer",
      status: "Active",
      manager: "Jane Smith",
      location: "New York",
      dateOfJoining: "2022-03-15",
      contractStart: "2022-03-15",
      contractEnd: "2024-03-14",
      probationEnd: "2022-09-15",
      salary: "75k",
      gradeLevel: "L2",
      role: "Developer",
      employmentType: "Full-time",
      workLocation: "NYC",
    },
    {
      id: nanoid(),
      firstName: "Alice",
      lastName: "Wong",
      email: "alice.wong@example.com",
      phone: "555-5678",
      department: "HR",
      jobTitle: "HR Manager",
      status: "On Leave",
      manager: "Robert Brown",
      location: "San Francisco",
      dateOfJoining: "2021-06-01",
      contractStart: "2021-06-01",
      contractEnd: "2023-06-01",
      probationEnd: "2021-12-01",
      salary: "85k",
      gradeLevel: "L4",
      role: "Manager",
      employmentType: "Full-time",
      workLocation: "SFO",
    },
    {
      id: nanoid(),
      firstName: "Carlos",
      lastName: "Garcia",
      email: "carlos.garcia@example.com",
      phone: "555-9012",
      department: "Finance",
      jobTitle: "Accountant",
      status: "Probation",
      manager: "Angela Lee",
      location: "Chicago",
      dateOfJoining: "2023-01-20",
      contractStart: "2023-01-20",
      contractEnd: "2023-07-19",
      probationEnd: "2023-04-20",
      salary: "60k",
      gradeLevel: "L1",
      role: "Accountant",
      employmentType: "Contract",
      workLocation: "CHI",
    },
    {
      id: nanoid(),
      firstName: "Priya",
      lastName: "Sharma",
      email: "priya.sharma@example.com",
      phone: "555-3456",
      department: "Marketing",
      jobTitle: "Content Strategist",
      status: "Active",
      manager: "Samuel Lee",
      location: "Boston",
      dateOfJoining: "2022-09-10",
      contractStart: "2022-09-10",
      contractEnd: "2024-09-09",
      probationEnd: "2023-03-10",
      salary: "68k",
      gradeLevel: "L3",
      role: "Strategist",
      employmentType: "Full-time",
      workLocation: "BOS",
    },
    {
      id: nanoid(),
      firstName: "Liam",
      lastName: "Nguyen",
      email: "liam.nguyen@example.com",
      phone: "555-7890",
      department: "IT",
      jobTitle: "DevOps Engineer",
      status: "Active",
      manager: "John Doe",
      location: "Seattle",
      dateOfJoining: "2021-11-05",
      contractStart: "2021-11-05",
      contractEnd: "2023-11-04",
      probationEnd: "2022-05-05",
      salary: "95k",
      gradeLevel: "L5",
      role: "Engineer",
      employmentType: "Full-time",
      workLocation: "SEA",
    },
    {
      id: nanoid(),
      firstName: "Emma",
      lastName: "Williams",
      email: "emma.williams@example.com",
      phone: "555-2345",
      department: "HR",
      jobTitle: "Recruiter",
      status: "Active",
      manager: "Alice Wong",
      location: "Denver",
      dateOfJoining: "2020-02-20",
      contractStart: "2020-02-20",
      contractEnd: "2022-02-19",
      probationEnd: "2020-08-20",
      salary: "62k",
      gradeLevel: "L2",
      role: "Recruiter",
      employmentType: "Full-time",
      workLocation: "DEN",
    },
    {
      id: nanoid(),
      firstName: "Olivia",
      lastName: "Brown",
      email: "olivia.brown@example.com",
      phone: "555-6789",
      department: "Finance",
      jobTitle: "Financial Analyst",
      status: "Active",
      manager: "Carlos Garcia",
      location: "Austin",
      dateOfJoining: "2019-04-12",
      contractStart: "2019-04-12",
      contractEnd: "2021-04-11",
      probationEnd: "2019-10-12",
      salary: "80k",
      gradeLevel: "L4",
      role: "Analyst",
      employmentType: "Full-time",
      workLocation: "AUS",
    },
    {
      id: nanoid(),
      firstName: "David",
      lastName: "Khan",
      email: "david.khan@example.com",
      phone: "555-4321",
      department: "IT",
      jobTitle: "Backend Developer",
      status: "On Leave",
      manager: "Liam Nguyen",
      location: "Houston",
      dateOfJoining: "2021-07-22",
      contractStart: "2021-07-22",
      contractEnd: "2023-07-21",
      probationEnd: "2022-01-22",
      salary: "88k",
      gradeLevel: "L3",
      role: "Developer",
      employmentType: "Full-time",
      workLocation: "HOU",
    },
  ],
  search: "",
  departmentFilter: "All",
  statusFilter: "All",
  currentPage: 1,
  itemsPerPage: 10,
}

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    addEmployee: {
      reducer(state, action) {
        state.employees.push(action.payload)
      },
      prepare(data) {
        return {
          payload: { id: nanoid(), ...data },
        }
      },
    },

    updateEmployee(state, action) {
      const index = state.employees.findIndex(e => e.id === action.payload.id)
      if (index !== -1) {
        state.employees[index] = action.payload
      }
    },

    deleteEmployee(state, action) {
      state.employees = state.employees.filter(e => e.id !== action.payload)
    },

    setSearch(state, action) {
      state.search = action.payload
      state.currentPage = 1
    },

    setDepartmentFilter(state, action) {
      state.departmentFilter = action.payload
      state.currentPage = 1
    },

    setStatusFilter(state, action) {
      state.statusFilter = action.payload
      state.currentPage = 1
    },

    setPage(state, action) {
      state.currentPage = action.payload
    },
    loadInitial(state) {
      if (state.employees.length < initialState.employees.length) {
        state.employees = [...initialState.employees]
      }
    },
  },
})

export const {
  addEmployee,
  updateEmployee,
  deleteEmployee,
  setSearch,
  setDepartmentFilter,
  setStatusFilter,
  setPage,
  loadInitial,
} = employeeSlice.actions

export default employeeSlice.reducer