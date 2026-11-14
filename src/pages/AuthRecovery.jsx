import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import BrandLogo from "../components/BrandLogo";

/* Mot de passe oublié + réinitialisation (cahier L4.5). */

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (resetError) throw resetError;
      /* Message volontairement identique que le compte existe ou non. */
      setSent(true);
    } catch (err) {
      setError(err.message || "Unable to send the reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page auth-tindahan-page">
      <section className="auth-card auth-modern-card">
        <div className="auth-logo auth-modern-intro">
          <BrandLogo variant="vertical" className="auth-brand-logo" height={64} />
          <h1>Forgot your password?</h1>
          <p>Enter your email and we will send you a link to choose a new one.</p>
        </div>

        {sent ? (
          <div className="auth-info-box" role="status" data-testid="reset-sent">
            <span>
              If an account exists for {email.trim()}, a reset link is on its way. Check your inbox
              and your spam folder.
            </span>
          </div>
        ) : (
          <form className="auth-form auth-modern-form" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                required
              />
            </label>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="auth-link">
          <Link to="/login">Back to log in</Link>
        </p>
      </section>
    </main>
  );
}

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError("Use at least 8 characters with letters and numbers.");
      return;
    }

    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(
        err.message ||
          "This reset link is invalid or has expired. Request a new one from the login page."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page auth-tindahan-page">
      <section className="auth-card auth-modern-card">
        <div className="auth-logo auth-modern-intro">
          <BrandLogo variant="vertical" className="auth-brand-logo" height={64} />
          <h1>Choose a new password</h1>
        </div>

        {done ? (
          <div className="auth-info-box" role="status">
            <span>Password updated. Redirecting to log in…</span>
          </div>
        ) : (
          <form className="auth-form auth-modern-form" onSubmit={handleSubmit}>
            <label>
              New password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </label>

            <label>
              Confirm password
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                autoComplete="new-password"
                required
              />
            </label>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save new password"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
