import { Eye, EyeOff, ShieldCheck } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

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

      navigate("/welcome");
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
    <main className="auth-page auth-tindahan-page">
      <section className="auth-card auth-modern-card">
        <div className="auth-logo auth-modern-intro">
          <span className="auth-brand-pill">TindaHan</span>

          <h1>Welcome back</h1>

          <p>
            Log in to buy and sell second-hand items safely across the
            Philippines.
          </p>
        </div>

        <div className="auth-info-box">
          <ShieldCheck size={21} />
          <span>
            Your account helps us protect conversations, orders, offers and
            buyer protection activity.
          </span>
        </div>

        <form className="auth-form auth-modern-form" onSubmit={handleSubmit}>
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
            <div className="auth-password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={updateField}
                placeholder="Your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>

          {errorMessage && <div className="auth-error">{errorMessage}</div>}

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