import { useState } from "react";
import "./Login.css";

export default function Login({ onLogin, onRegister }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Crypto<span>Bets</span></h1>
          <p>Sign in to your account</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className={`login-btn ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>

        <div className="login-back">
          Don't have an account?{" "}
          <button onClick={onRegister}>Register</button>
        </div>
      </div>
    </div>
  );
}