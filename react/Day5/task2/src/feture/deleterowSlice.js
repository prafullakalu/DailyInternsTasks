import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  data: [
    { id: 1, name: "Laptop", price: 1000 },
    { id: 2, name: "Phone", price: 600 },
    { id: 3, name: "Tablet", price: 400 },
    { id: 4, name: "Monitor", price: 300 },
    { id: 5, name: "Keyboard", price: 100 }
  ]
}

const deleteRowSlice = createSlice({
  name: "deleteRow",
  initialState,
  reducers: {
    deleteRow: (state, action) => {
      state.data = state.data.filter(
        (item) => item.id !== action.payload
      )
    }
  }
})

export const { deleteRow } = deleteRowSlice.actions
export default deleteRowSlice.reducer