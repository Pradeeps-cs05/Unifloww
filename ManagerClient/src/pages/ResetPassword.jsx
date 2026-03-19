// src/pages/ResetPassword.jsx

import { motion } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { resetPassword } from "../utils/api"; // We will create this API function next
import "./Login.css";

export default function ResetPassword() {
  const { token } = useParams(); // Get the token from the URL
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword(token, { password: form.password });
      setSuccess(res.message || "Password has been reset successfully!");
      setTimeout(() => navigate("/login"), 3000); // Redirect to login after 3s
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Invalid or expired token.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="login-card"
        >
          <h2 className="login-title">Set New Password</h2>
          <p className="login-subtitle">
            Please enter your new password below
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                New Password
              </label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="form-input password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="form-input password-input"
                />
              </div>
            </div>

            <div className="feedback" aria-live="polite">
              {error && <div className="error-text">{error}</div>}
              {success && <div className="success-text">{success}</div>}
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}