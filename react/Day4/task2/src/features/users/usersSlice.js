import {createSlice} from "@reduxjs/toolkit";

const initialState = {
  users: [
    { id: 1, name: "John Doe", email: "john@gmail.com", role: "Admin" },
    { id: 2, name: "Jane Smith", email: "jane@gmail.com", role: "Editor" },
    { id: 3, name: "Robert King", email: "robert@gmail.com", role: "Viewer" },
    { id: 4, name: "Emily Clark", email: "emily@gmail.com", role: "Editor" },
    { id: 5, name: "Michael Lee", email: "michael@gmail.com", role: "Admin" }
  ]
};


const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    deleteUser(state, action) {
      state.users = state.users.filter(
        (user) => user.id !== action.payload
      );
    }
  }
});



export const { deleteUser} = usersSlice.actions;
export default usersSlice.reducer;