import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../components/common/Alert.jsx";
import Button from "../components/common/Button.jsx";
import FormField from "../components/common/FormField.jsx";
import { register } from "../api/auth.js";
import { ApiError } from "../api/client.js";

const initialForm = {
  email: "",
  password: "",
  password_confirmation: "",
  nickname: "",
  facebook_contact: "",
  discord_contact: "",
  line_contact: "",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});
    setSubmitting(true);

    try {
      await register({
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        nickname: form.nickname,
        facebook_contact: form.facebook_contact || null,
        discord_contact: form.discord_contact || null,
        line_contact: form.line_contact || null,
      });
      navigate("/login", { state: { message: "註冊成功，請登入。" } });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "VALIDATION_ERROR" && err.details?.fields) {
          const flattened = {};
          Object.entries(err.details.fields).forEach(([field, messages]) => {
            flattened[field] = messages[0];
          });
          setFieldErrors(flattened);
        } else if (err.code === "EMAIL_ALREADY_EXISTS") {
          setFieldErrors({ email: "此 Email 已被註冊。" });
        } else if (err.code === "CONTACT_REQUIRED") {
          setFormError("請至少提供一項外部聯絡方式。");
        } else {
          setFormError(err.message || "註冊時發生錯誤，請稍後再試。");
        }
      } else {
        setFormError("註冊時發生錯誤，請稍後再試。");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-narrow">
      <div className="page-header">
        <h1>建立帳號</h1>
      </div>

      {formError && <Alert type="error">{formError}</Alert>}

      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Email" htmlFor="register-email" required error={fieldErrors.email}>
          <input
            id="register-email"
            type="email"
            required
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            autoComplete="email"
          />
        </FormField>

        <FormField
          label="密碼"
          htmlFor="register-password"
          required
          error={fieldErrors.password}
          helperText="長度 8-72 個字元，至少包含一個英文字母及一個數字"
        >
          <input
            id="register-password"
            type="password"
            required
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            autoComplete="new-password"
          />
        </FormField>

        <FormField
          label="確認密碼"
          htmlFor="register-password-confirmation"
          required
          error={fieldErrors.password_confirmation}
        >
          <input
            id="register-password-confirmation"
            type="password"
            required
            value={form.password_confirmation}
            onChange={(event) => updateField("password_confirmation", event.target.value)}
            autoComplete="new-password"
          />
        </FormField>

        <FormField label="暱稱" htmlFor="register-nickname" required error={fieldErrors.nickname}>
          <input
            id="register-nickname"
            type="text"
            required
            value={form.nickname}
            onChange={(event) => updateField("nickname", event.target.value)}
            autoComplete="nickname"
          />
        </FormField>

        <p className="helper-text">外部聯絡方式：至少填寫一項</p>

        <FormField label="Facebook" htmlFor="register-facebook">
          <input
            id="register-facebook"
            type="text"
            value={form.facebook_contact}
            onChange={(event) => updateField("facebook_contact", event.target.value)}
          />
        </FormField>

        <FormField label="Discord" htmlFor="register-discord">
          <input
            id="register-discord"
            type="text"
            value={form.discord_contact}
            onChange={(event) => updateField("discord_contact", event.target.value)}
          />
        </FormField>

        <FormField label="LINE" htmlFor="register-line">
          <input
            id="register-line"
            type="text"
            value={form.line_contact}
            onChange={(event) => updateField("line_contact", event.target.value)}
          />
        </FormField>

        <Button type="submit" fullWidth loading={submitting}>
          建立帳號
        </Button>
      </form>

      <p>
        已經有帳號？<Link to="/login">前往登入</Link>
      </p>
    </div>
  );
}
