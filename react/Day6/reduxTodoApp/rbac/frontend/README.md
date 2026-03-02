RBAC Frontend (minimal)

This is a minimal React frontend to test the RBAC backend.

Setup:

```powershell
cd react\Day6\reduxTodoApp\rbac\frontend
npm install
npm run dev
```

- Login at `/login` using the admin user: `admin@mail.com` (password: `password`).
- After login you'll be redirected to `/dashboard` where the UI shows buttons based on permissions.

For a full production app (AntD layout, role management, users, employees, projects) you can copy the Day7 `rbac-system/frontend/rbac-frontend` implementation in this workspace.
