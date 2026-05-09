import { useState } from "react";
import "./Register.css";

const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{4,}$/;

function validate(fields) {
  const errors = {};

  if (!fields.username || fields.username.length < 2 || fields.username.length > 10)
    errors.username = "2–10 characters required";

  if (!fields.nome || fields.nome.length < 2 || fields.nome.length > 30)
    errors.nome = "2–30 characters required";

  if (!fields.cognome || fields.cognome.length < 2 || fields.cognome.length > 30)
    errors.cognome = "2–30 characters required";

  if (!fields.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errors.email = "Valid email required";

  if (!fields.password || !PASSWORD_REGEX.test(fields.password))
    errors.password = "Min 4 chars, upper + lowercase + number";

  return errors;
}

export default function Register({ onLogin, onRegister }) {
  const [fields, setFields] = useState({
    username: "", nome: "", cognome: "", email: "", password: ""
  });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields(f => ({ ...f, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");

    try {
      await onRegister(fields);
    } catch (err) {
      setApiError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const f = (name, placeholder, type = "text") => (
    <div className="field-group">
      <label htmlFor={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={fields[name]}
        onChange={handleChange}
        className={errors[name] ? "invalid" : ""}
        autoComplete={name}
      />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h1>Crypto<span>Bets</span></h1>
          <p>Create your account</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <div className="field-row">
            {f("nome",     "Mario")}
            {f("cognome",  "Rossi")}
          </div>

          {f("username", "mario123")}
          {f("email",    "you@example.com", "email")}
          {f("password", "••••••••",        "password")}

          {apiError && <div className="register-error">{apiError}</div>}

          <button
            type="submit"
            className={`register-btn ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account →"}
          </button>
        </form>

        <div className="register-back">
          Already have an account?{" "}
          <button onClick={onLogin}>Sign in</button>
        </div>
      </div>
    </div>
  );
}