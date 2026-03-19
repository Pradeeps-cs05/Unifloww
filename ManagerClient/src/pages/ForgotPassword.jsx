// src/pages/ForgotPassword.jsx

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Mail } from "lucide-react";
import { forgotPassword } from "../utils/api"; // We will create this API function next
import "./Login.css"; // We can reuse the login styles

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword({ email });
      setSuccess(res.message || "Password reset link sent. Please check your email.");
      setEmail("");
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "An error occurred.";
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
            Reset Password
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="form-input"
                />
              </div>
            </div>

            <div className="feedback" aria-live="polite">
              {error && <div className="error-text">{error}</div>}
              {success && <div className="success-text">{success}</div>}
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="signup-text">
            Remember your password?{" "}
            <Link to="/login" className="signup-link">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}