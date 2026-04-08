import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { setToken } from "../auth";
import { QuickBooksButton } from "../components/QuickBooksButton";
import { validateEmail, validatePassword } from "../utils";

export function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!validateEmail(form.email)) nextErrors.email = "Enter a valid email.";
    if (!validatePassword(form.password)) nextErrors.password = "Use 8+ chars with uppercase, lowercase, and number.";
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");
    try {
      const response = await api.post("/auth/signup", {
        fullName: form.fullName,
        email: form.email,
        password: form.password
      });
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
      <section className="hero-panel accent">
        <p className="eyebrow">Fast Onboarding</p>
        <h1>Start secure and land in a professional accounting workspace.</h1>
        <p className="hero-copy">
          Users stay in MongoDB, invoices stay in SQL Server, and QuickBooks remains the operational source of truth.
        </p>
        <div className="auth-feature-list">
          <div>Secure sign-up checks</div>
          <div>Intuit sign-in support</div>
          <div>Production-style UI flow</div>
        </div>
      </section>
      <section className="panel auth-panel">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            Full Name
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </label>
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
          <label>
            Confirm Password
            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </label>
          {serverError && <div className="alert error">{serverError}</div>}
          <button className="primary-button" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <QuickBooksButton onError={setServerError} />
        <p className="footnote">
          Already registered? <Link to="/signin">Sign in</Link>
        </p>
      </section>
    </div>
  );
}
