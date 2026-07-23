import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Alert from "../components/common/Alert.jsx";
import Button from "../components/common/Button.jsx";
import FormField from "../components/common/FormField.jsx";
import { ApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectPath = location.state?.redirectPath ?? "/";
  const redirectNotice = location.state?.message;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const sessionUser = await login(email, password);
      if (sessionUser?.permissions?.is_admin) {
        navigate("/admin", { replace: true });
      } else {
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === "AUTH_INVALID_CREDENTIALS") {
        setError("Email 或密碼錯誤。");
      } else {
        setError("登入時發生錯誤，請稍後再試。");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-narrow">
      <div className="page-header">
        <h1>登入 WuWaGroup</h1>
      </div>

      {redirectNotice && <Alert type="info">{redirectNotice}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Email" htmlFor="login-email" required>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </FormField>

        <FormField label="密碼" htmlFor="login-password" required>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </FormField>

        <Button type="submit" fullWidth loading={submitting}>
          登入
        </Button>
      </form>

      <p>
        還沒有帳號？<Link to="/register">前往註冊</Link>
      </p>
    </div>
  );
}
