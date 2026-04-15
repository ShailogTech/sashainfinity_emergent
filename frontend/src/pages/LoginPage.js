import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLoading(true);

    try {
      const result = await login(form.email, form.password);

      if (result.success) {
        // Redirect to the page they came from or home
        navigate(from, { replace: true });
      } else {
        setLocalError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setLocalError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="sasha-auth-page" data-testid="login-page">
      {/* Mobile header */}
      <div className="auth-mobile-header">
        <Link to="/" className="auth-mobile-logo" data-testid="auth-mobile-logo">
          <img src="https://sashainfinity.com/wp-content/uploads/2025/06/sasha-logo-small.png" alt="SashaInfinity" />
        </Link>
        <p>Future of Education</p>
      </div>

      <div className="auth-container">
        {/* Left - Branding */}
        <div className="auth-branding">
          <Link to="/" className="auth-logo" data-testid="auth-logo">
            <img src="https://sashainfinity.com/wp-content/uploads/2025/06/sasha-logo-small.png" alt="SashaInfinity" />
          </Link>
          <div className="auth-brand-content">
            <h2>Welcome to <span>SashaInfinity</span></h2>
            <p>Transform your education with immersive AR/VR learning experiences, personalized paths, and expert guidance.</p>
            <div className="auth-brand-features">
              <div><i className="fa-solid fa-check-circle"></i> Immersive AR/VR Learning</div>
              <div><i className="fa-solid fa-check-circle"></i> Personalized Learning Paths</div>
              <div><i className="fa-solid fa-check-circle"></i> Expert Tutors & Mentors</div>
              <div><i className="fa-solid fa-check-circle"></i> Certificate on Completion</div>
            </div>
            <div className="auth-brand-stats">
              <div><strong>50+</strong><span>Students</span></div>
              <div><strong>70+</strong><span>Lessons</span></div>
              <div><strong>5+</strong><span>Tutors</span></div>
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="auth-form-side">
          <div className="auth-form-wrapper">
            <h3>Welcome back</h3>
            <p className="auth-subtitle">Sign in to your account to continue learning</p>

            {displayError && (
              <div style={{
                background: 'rgba(245, 87, 108, 0.1)',
                color: '#f5576c',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '14px',
                fontWeight: '500',
                border: '1px solid rgba(245, 87, 108, 0.2)'
              }}>
                {displayError}
              </div>
            )}

            <form onSubmit={handleSubmit} data-testid="login-form">
              <div className="auth-form-group">
                <label>Email</label>
                <div className="auth-input-wrap">
                  <i className="fa-solid fa-envelope"></i>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    data-testid="login-email"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="auth-form-group">
                <label>Password</label>
                <div className="auth-input-wrap">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                    data-testid="login-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-pass"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="toggle-password"
                    disabled={loading}
                  >
                    <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>

              <div className="auth-options">
                <label className="remember-me">
                  <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} data-testid="remember-me" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="forgot-link" data-testid="forgot-password">Forgot password?</button>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                data-testid="login-submit"
                disabled={loading}
              >
                {loading ? (
                  <>Signing in...</>
                ) : (
                  <>Sign in <i className="fa-solid fa-arrow-right"></i></>
                )}
              </button>
            </form>

            <div className="auth-divider"><span>Or continue with</span></div>

            <div className="auth-social-btns">
              <button className="social-btn google" data-testid="google-login">
                <i className="fa-brands fa-google"></i> Google
              </button>
              <button className="social-btn linkedin" data-testid="linkedin-login">
                <i className="fa-brands fa-linkedin-in"></i> LinkedIn
              </button>
            </div>

            <p className="auth-switch">
              Don't have an account? <Link to="/get-started" data-testid="switch-to-register">Sign up for free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
