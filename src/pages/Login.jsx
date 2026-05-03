import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function updateField(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setErrorMessage("");

    if (!form.email.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }

    if (!form.password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      await login(form.email.trim(), form.password);

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      if (error.message?.includes("Invalid login credentials")) {
        setErrorMessage("Incorrect email or password.");
      } else if (error.message?.includes("Email not confirmed")) {
        setErrorMessage("Please confirm your email before logging in.");
      } else {
        setErrorMessage(error.message || "Unable to log in.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo">
          <h1>Welcome back</h1>
          <p>Log in to continue on TindaHan.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              placeholder="you@email.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={updateField}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
          </label>

          {errorMessage && (
            <div className="auth-error">
              {errorMessage}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="auth-link">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}