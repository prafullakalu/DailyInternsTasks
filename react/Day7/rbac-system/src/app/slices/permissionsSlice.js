import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as permissionService from '../../services/permissionService'


export const fetchPermissionDefs = createAsyncThunk(
  'permissions/fetchDefs',
  async (_, { rejectWithValue }) => {
    try { return await permissionService.getPermissionDefinitions() }
    catch (e) { return rejectWithValue(e.message) }
  }
)


export const fetchRolePermissions = createAsyncThunk(
  'permissions/fetchRoles',
  async (_, { rejectWithValue }) => {
    try { return await permissionService.getAllRolePermissions() }
    catch (e) { return rejectWithValue(e.message) }
  }
)

export const saveRolePermissions = createAsyncThunk(
  'permissions/save',
  async ({ id, permissions }, { rejectWithValue }) => {
    try { return await permissionService.updateRolePermissions(id, permissions) }
    catch (e) { return rejectWithValue(e.message) }
  }
)

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState: {
    definitions:      [],  
    rolePermissions:  [],  
    loading:          false,
    error:            null,
  },
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(fetchPermissionDefs.pending,   (s) => { s.loading = true })
      .addCase(fetchPermissionDefs.fulfilled, (s, a) => { s.loading = false; s.definitions = a.payload })
      .addCase(fetchPermissionDefs.rejected,  (s, a) => { s.loading = false; s.error = a.payload })

      .addCase(fetchRolePermissions.pending,   (s) => { s.loading = true })
      .addCase(fetchRolePermissions.fulfilled, (s, a) => { s.loading = false; s.rolePermissions = a.payload })
      .addCase(fetchRolePermissions.rejected,  (s, a) => { s.loading = false; s.error = a.payload })

      .addCase(saveRolePermissions.fulfilled, (s, a) => {
        s.rolePermissions = s.rolePermissions.map(r => r.id === a.payload.id ? a.payload : r)
      })
  },
})

export default permissionsSlice.reducer