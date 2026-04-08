import { useState } from "react";

export function QuickBooksButton({
  label = "Continue with QuickBooks",
  className = "secondary-button full-width",
  onError
}) {
  const [loading, setLoading] = useState(false);
  const baseUrl = (import.meta.env.VITE_API_URL || "https://localhost:7228").replace(/\/$/, "");

  function handleClick() {
    setLoading(true);
    try {
      window.location.href = `${baseUrl}/api/auth/intuit/login`;
    } catch (error) {
      setLoading(false);
      onError?.(error.message);
    }
  }

  return (
    <button type="button" className={className} onClick={handleClick} disabled={loading}>
      {loading ? "Redirecting..." : label}
    </button>
  );
}
