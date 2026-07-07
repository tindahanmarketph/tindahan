import { Eye, EyeOff, MailCheck, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [createdEmail, setCreatedEmail] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function cleanUsername(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");
  }

  function validateForm() {
    const username = cleanUsername(form.username);
    const email = form.email.trim();

    if (!username || !email || !form.password || !form.confirmPassword) {
      return "Please fill all fields.";
    }

    if (username.length < 3) {
      return "Your username must contain at least 3 characters.";
    }

    if (form.password.length < 6) {
      return "Your password must contain at least 6 characters.";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const username = cleanUsername(form.username);
    const email = form.email.trim();

    const { data, error: signUpError } = await signUp({
      email,
      password: form.password,
      username
    });

    if (signUpError) {
      setError(signUpError.message || "Unable to create your account.");
      setLoading(false);
      return;
    }

    setLoading(false);

    if (data?.session) {
      navigate("/welcome");
      return;
    }

    setCreatedEmail(email);
    setVerificationSent(true);
  }

  if (verificationSent) {
    return (
      <main className="auth-page auth-tindahan-page register-modern-page">
        <section className="auth-card auth-modern-card register-modern-card auth-verification-card">
          <div className="auth-success-icon">
            <MailCheck size={34} />
          </div>

          <span className="auth-brand-pill">TindaHan</span>

          <h1>Check your email</h1>

          <p>
            We sent a verification link to <strong>{createdEmail}</strong>.
            Open the email and confirm your account to continue to TindaHan.
          </p>

          <div className="auth-info-box">
            <ShieldCheck size={21} />
            <span>
              Email verification helps us keep TindaHan safer for buyers and
              sellers across the Philippines.
            </span>
          </div>

          <button
            type="button"
            className="auth-primary-wide"
            onClick={() => navigate("/login")}
          >
            Go to login
          </button>

          <p className="auth-link">
            Already verified? <Link to="/login">Log in now</Link>
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page auth-tindahan-page register-modern-page">
      <section className="auth-card auth-modern-card register-modern-card">
        <div className="auth-logo auth-modern-intro">
          <span className="auth-brand-pill">TindaHan</span>

          <h1>Create your account</h1>

          <p>
            Join the Filipino second-hand marketplace. Sell what you no longer
            use, discover unique finds, and trade safely with your community.
          </p>
        </div>

        <div className="auth-info-box">
          <Sparkles size={21} />
          <span>
            Create your profile, verify your email, then start buying and
            selling safely on TindaHan.
          </span>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form auth-modern-form">
          <label>
            Username
            <input
              value={form.username}
              onChange={(event) => updateField("username", event.target.value)}
              placeholder="ex: angie_delarosa"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
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
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
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

          <label>
            Confirm password
            <div className="auth-password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(event) =>
                  updateField("confirmPassword", event.target.value)
                }
                placeholder="Retype your password"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                onClick={() => setShowConfirmPassword((current) => !current)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}