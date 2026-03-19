import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
// Import the necessary icons, including Mail
import { Eye, EyeOff, User, Lock, Mail } from "lucide-react"; 
import { signup } from "../utils/api";
// Import the new SignUp.css file
import './SignUp.css';

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  // Add state for the password toggle
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await signup(form);
      setSuccess(res?.message || "Account created successfully.");
      setTimeout(() => navigate("/Login"), 1400);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to sign up.");
    } finally {
      setLoading(false);
    }
  }

  return (
    // Use consistent root class names like the signup page
    <div className="signup-page">
      <div className="signup-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          // Use the same 'signup-card' class for identical styling
          className="signup-card"
        >
          <h2 className="signup-title">UniFloww</h2>
          <p className="signup-subtitle">
            Create Account
          </p>

          <form className="signup-form" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name</label>
              <div className="input-wrapper">
                <User size={20} className="input-icon" />
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  type="text"
                  placeholder="John Doe"
                  className="form-input"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="you@example.com"
                  className="form-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
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
            
            {/* Feedback Area */}
            <div className="feedback" aria-live="polite">
              {error && <div className="error-text">{error}</div>}
              {success && <div className="success-text">{success}</div>}
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="signup-text">
            Already have an account?{" "}
            <Link to="/Login" className="signup-link">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}