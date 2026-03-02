RBAC backend (json-server)

This folder contains a minimal json-server backend with JWT authentication and bcrypt password hashing.

Start backend:

```powershell
cd react\Day6\reduxTodoApp\rbac\backend
npm install
node server.js
```

Endpoints:
- POST /login -> { email, password } returns { token, user, permissions }
- /users, /roles, /permissions, /employees, /projects -> standard json-server CRUD

Notes:
- GET requests are allowed without auth for convenience; other methods require a Bearer token returned by /login.
- Passwords are hashed when creating/updating users.
- Default admin user: admin@mail.com (password hashed as "password").
