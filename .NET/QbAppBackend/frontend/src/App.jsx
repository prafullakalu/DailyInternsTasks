import { Navigate, Route, Routes } from "react-router-dom";
import { isAuthenticated } from "./auth";
import { AppShell } from "./components/AppShell";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { ChartOfAccountsPage } from "./pages/ChartOfAccountsPage";
import { ConnectionsPage } from "./pages/ConnectionsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InvoicePage } from "./pages/InvoicePage";
import { ItemsPage } from "./pages/ItemsPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/signin" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/signin"} replace />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/connections"
        element={
          <ProtectedRoute>
            <AppShell>
              <ConnectionsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/master-data"
        element={
          <ProtectedRoute>
            <Navigate to="/chart-of-accounts" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chart-of-accounts"
        element={
          <ProtectedRoute>
            <AppShell>
              <ChartOfAccountsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <AppShell>
              <CustomersPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/items"
        element={
          <ProtectedRoute>
            <AppShell>
              <ItemsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <AppShell>
              <InvoicePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
