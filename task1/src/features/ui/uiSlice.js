import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  isSidebarCollapsed: false,
  isMobileMenuOpen: false,
  isNotificationOpen: false,
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.isSidebarCollapsed = !state.isSidebarCollapsed
    },
    toggleMobileMenu(state) {
      state.isMobileMenuOpen = !state.isMobileMenuOpen
    },
    closeMobileMenu(state) {
      state.isMobileMenuOpen = false
    },
    toggleNotification(state) {
      state.isNotificationOpen = !state.isNotificationOpen
    },
  },
})

export const {
  toggleSidebar,
  toggleMobileMenu,
  closeMobileMenu,
  toggleNotification,
} = uiSlice.actions

export default uiSlice.reducer