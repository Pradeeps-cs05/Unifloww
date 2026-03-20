import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Eye, EyeOff, User, Lock } from "lucide-react"; 
import { login } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { user, loginUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedForm = {
      email: form.email.trim().toLowerCase(),
      password: form.password.trim(),
    };

    if (!trimmedForm.email || !trimmedForm.password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(trimmedForm);
      localStorage.setItem("token", res.token);
      loginUser(res.user || { email: trimmedForm.email });
      setSuccess(res?.message || "Login successful!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="login-card"
        >
          <h2 className="login-title">UniFloww</h2>
          <p className="login-subtitle">
            Please sign in to continue
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              {/* --- NEW WRAPPER --- */}
              <div className="input-wrapper">
                <User size={20} className="input-icon" />
                <input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              {/* --- NEW WRAPPER (replaces password-wrapper) --- */}
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  autoComplete="current-password"
                  className="form-input password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="feedback" aria-live="polite">
              {error && <div className="error-text">{error}</div>}
              {success && <div className="success-text">{success}</div>}
            </div>          

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="forgot-password-text">
            Forgot Password?{" "}
            <Link to="/forgot-password" className="forgot-password-link">
              Reset it
            </Link>
          </p>

          <p className="signup-text">
            Don’t have an account?{" "}
            <Link to="/signup" className="signup-link">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
