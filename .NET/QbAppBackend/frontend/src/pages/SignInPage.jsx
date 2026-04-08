import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { setToken } from "../auth";
import { QuickBooksButton } from "../components/QuickBooksButton";
import { validateEmail } from "../utils";

export function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(searchParams.get("error") ?? "");
  const [loading, setLoading] = useState(false);

  function validate() {
    const nextErrors = {};
    if (!validateEmail(form.email)) nextErrors.email = "Enter a valid email.";
    if (!form.password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");
    try {
      const response = await api.post("/auth/signin", form);
      setToken(response.token);
      navigate("/dashboard");
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="hero-panel">
        <p className="eyebrow">LedgerFlow Workspace</p>
        <h1>Serious accounting operations need a sharper front office.</h1>
        <p className="hero-copy">
          Run customer setup, master data creation, invoice issuance, and QuickBooks sync from one clean accounting console.
        </p>
        <div className="auth-feature-list">
          <div>Connection control</div>
          <div>Validated operational forms</div>
          <div>Invoice register workflow</div>
        </div>
      </section>
      <section className="panel auth-panel">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            Email
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </label>
          {serverError && <div className="alert error">{serverError}</div>}
          <button className="primary-button" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <QuickBooksButton onError={setServerError} />
        <p className="footnote">
          Need an account? <Link to="/signup">Create one</Link>
        </p>
      </section>
    </div>
  );
}
