# 🔐 Secure React Authentication Application

A professional, role-based access control (RBAC) authentication system built with React, Redux Toolkit, and Ant Design.

## 🚀 Features

### Authentication & Authorization
- ✅ **Centralized Redux Store** - All authentication state managed centrally
- ✅ **Persistent Login State** - Login details survive page refresh using localStorage
- ✅ **Cross-Tab Sync** - Login/logout automatically synced across multiple browser tabs
- ✅ **Protected Routes** - Unauthorized users cannot access protected pages
- ✅ **Role-Based Access Control (RBAC)** - Different features for different roles
- ✅ **Automatic URL Protection** - Users cannot access restricted routes directly via URL

### User Experience
- ✅ **Professional Login Form** - Clean, modern design with quick login options
- ✅ **User Info Display** - Logged-in user's name and role visible in top-right
- ✅ **Role-Based Navigation** - Menu items shown based on user role
- ✅ **Common Layout** - Consistent header, sidebar, and footer across all pages
- ✅ **Logout Functionality** - Easy logout option in top navigation with confirmation
- ✅ **Responsive Design** - Works seamlessly on mobile, tablet, and desktop

## 🔑 User Roles & Permissions

### Admin Role (admin@example.com / admin123)
- Access to Admin Panel
- Manage all users
- View system logs
- Configure system settings
- Manage roles and permissions

### Manager Role (manager@example.com / manager123)
- Access to Manager Dashboard
- View team members
- Approve reports
- View analytics
- Manage team tasks

### User Role (user@example.com / user123)
- View personal profile
- Access assigned tasks
- Submit reports
- View dashboard
- Update personal information

## 🛠️ Technology Stack

- **React 19** - UI library
- **React Router v7** - Client-side routing
- **Redux Toolkit** - State management
- **Ant Design** - UI component library
- **Vite** - Build tool and development server
- **JavaScript ES6+** - Modern JavaScript

## 🚀 Getting Started

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server

The application runs on `http://localhost:5173` by default (or another port if 5173 is in use).

## 📝 Demo Accounts

Login with these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Manager | manager@example.com | manager123 |
| User | user@example.com | user123 |

Or use the quick login buttons on the login page.

## 📁 Project Structure

```
src/
├── app/
│   └── store.js                      # Redux store configuration
├── features/
│   └── auth/
│       ├── authSlice.js              # Redux slice for auth state
│       └── useAuthSync.js            # Hook for cross-tab sync
├── layouts/
│   ├── MainLayout.jsx                # Main application layout
│   └── MainLayout.css                # Layout styling
├── pages/
│   ├── Login.jsx, Login.css          # Login page with form
│   ├── Dashboard.jsx, Dashboard.css  # User dashboard
│   ├── Profile.jsx, Profile.css      # User profile page
│   ├── AdminPage.jsx, AdminPage.css  # Admin-only panel
│   ├── ManagerPage.jsx, ManagerPage.css # Manager dashboard
│   └── Unauthorized.jsx, Unauthorized.css # Access denied page
├── routes/
│   └── ProtectedRoute.jsx            # Route protection component
├── App.jsx                           # Main app component
├── App.css                           # App styles
├── main.jsx                          # Entry point
└── index.css                         # Global styles
```

## 🔐 Authentication Flow

1. **Login** - User enters credentials on login page
2. **Validation** - Credentials validated against mock user database
3. **Storage** - User data stored in Redux state and localStorage
4. **Sync** - Login state synced across tabs via storage event
5. **Navigation** - User redirected to dashboard
6. **Protection** - ProtectedRoute blocks unauthorized access
7. **Logout** - User data cleared and synced across all tabs

## 🔍 Key Components

### ProtectedRoute Component
Validates user authentication and authorization.

```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

### useAuthSync Hook
Synchronizes authentication state across browser tabs.

### Redux Auth Slice
Manages all authentication state with localStorage persistence.

## 🎨 Ant Design Components Used

Layout, Card, Button, Form, Input, Table, Avatar, Tag, Menu, Dropdown, Message, Modal, Statistic, Descriptions, Row, Col, Space, Alert

## 🔒 Security Features

1. **Protected Routes** - Unauthorized access prevention
2. **Role-Based Authorization** - Feature access by role
3. **Automatic Logout** - Synced across tabs
4. **Direct URL Protection** - Cannot bypass routing
5. **LocalStorage Persistence** - Survives page refresh

## 📱 Responsive Design

- Mobile-first approach
- Collapsible sidebar on mobile
- Touch-friendly interface
- Optimized for all screen sizes

## 🔄 Cross-Tab Synchronization

- **Login in Tab A** → Tab B auto-logs in
- **Logout in Tab A** → Tab B auto-logs out
- **Refresh Tab A** → Login state persists
- Uses localStorage events & Redux sync

## 📋 Pages Overview

- **Login** (`/login`) - Email/password form with quick login options
- **Dashboard** (`/`) - Welcome, stats, recent activity, permissions
- **Profile** (`/profile`) - Edit profile, security settings
- **Admin Panel** (`/admin`) - User management, system settings
- **Manager Dashboard** (`/manager`) - Team stats, task management
- **Unauthorized** (`/unauthorized`) - Access denied page

## 🔧 Configuration

Modify user credentials in `src/pages/Login.jsx`.

## 📚 Learn More

- [React](https://react.dev)
- [React Router](https://reactrouter.com)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Ant Design](https://ant.design)

---

**Professional Authentication System built with React & Ant Design** ❤️
