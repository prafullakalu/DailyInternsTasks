# QB Workflow App

Full-stack QuickBooks workflow project with:

- `.NET 10` backend
- `React + Vite` frontend
- `MongoDB` for users and QuickBooks company connections
- `SQL Server` for invoice storage only

## Project Structure

- `QbAppBackend/` - ASP.NET Core API
- `frontend/` - React UI

## Backend Features

- Sign up and sign in with JWT
- Intuit SSO callback flow
- QuickBooks connect and disconnect flow
- Account, customer, and item creation endpoints
- Invoice create, list, update, and delete
- MongoDB storage for:
  - users
  - QuickBooks connection/company details
- SQL Server storage for:
  - invoice data only

## Frontend Pages

- `/signup`
- `/signin`
- `/dashboard`
- `/connections`
- `/master-data`
- `/invoices`

## Required Services

- MongoDB running locally on `mongodb://localhost:27017`
- SQL Server with a database named `InvoiceDevDb`

## Backend Configuration

Update `QbAppBackend/appsettings.json` as needed:

- `Intuit.Environment` (`Sandbox` or `Production`)
- `MongoDB.ConnectionString`
- `ConnectionStrings.DefaultConnection`
- `Jwt.*`
- `FrontendUrl`
- `Intuit.ClientId`
- `Intuit.ClientSecret`
- `Intuit.RedirectUri`
- `Intuit.SignInRedirectUri`

QuickBooks API base URL is now chosen automatically:

- `Sandbox` -> `https://sandbox-quickbooks.api.intuit.com`
- `Production` -> `https://quickbooks.api.intuit.com`

## Run Backend

```powershell
cd QbAppBackend
dotnet restore
dotnet run
```

Backend URLs from launch settings:

- `https://localhost:7228`
- `http://localhost:5179`

## Run Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://localhost:5173`

## Build Verification

Verified locally:

- `dotnet build`
- `npm run build`

## Notes

- SQL tables are created automatically with `Database.EnsureCreated()`.
- QuickBooks invoice changes are synced to QuickBooks and mirrored into SQL.
- Accounts, customers, and items are fetched live from QuickBooks and are not stored locally.
