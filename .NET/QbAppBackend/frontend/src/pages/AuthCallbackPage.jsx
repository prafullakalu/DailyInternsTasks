import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setToken } from "../auth";

export function AuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      setToken(token);
      navigate("/dashboard", { replace: true });
      return;
    }

    navigate("/signin", { replace: true });
  }, [navigate, params]);

  return <div className="auth-layout"><div className="panel"><p>Completing sign-in...</p></div></div>;
}
