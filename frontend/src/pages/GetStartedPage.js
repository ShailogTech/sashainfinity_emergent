import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function GetStartedPage() {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const { register, error: authError } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};

    if (!form.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!form.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!validateForm()) {
      return;
    }

    if (!agreed) {
      setLocalError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
        role: role,
        confirm_password: form.confirmPassword
      };

      const result = await register(userData);

      if (result.success) {
        // Registration successful, redirect to login
        navigate("/login", {
          state: {
            message: "Registration successful! Please sign in to continue.",
            email: form.email
          }
        });
      } else {
        setLocalError(result.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setLocalError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="sasha-auth-page" data-testid="get-started-page">
      {/* Mobile header */}
      <div className="auth-mobile-header">
        <Link to="/" className="auth-mobile-logo" data-testid="register-mobile-logo">
          <img src="https://sashainfinity.com/wp-content/uploads/2025/06/sasha-logo-small.png" alt="SashaInfinity" />
        </Link>
        <p>Future of Education</p>
      </div>

      <div className="auth-container">
        {/* Left - Branding */}
        <div className="auth-branding register-branding">
          <Link to="/" className="auth-logo" data-testid="register-logo">
            <img src="https://sashainfinity.com/wp-content/uploads/2025/06/sasha-logo-small.png" alt="SashaInfinity" />
          </Link>
          <div className="auth-brand-content">
            <h2>Start Your <span>Journey</span></h2>
            <p>Join thousands of learners and unlock the future of education with AR/VR, personalized learning paths, and expert-led courses.</p>
            <div className="auth-brand-features">
              <div><i className="fa-solid fa-check-circle"></i> Immersive AR/VR Learning</div>
              <div><i className="fa-solid fa-check-circle"></i> Personalized Learning Paths</div>
              <div><i className="fa-solid fa-check-circle"></i> Expert Tutors & Mentors</div>
              <div><i className="fa-solid fa-check-circle"></i> Certificate on Completion</div>
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="auth-form-side">
          <div className="auth-form-wrapper">
            <h3>Create your account</h3>
            <p className="auth-subtitle">Join thousands of learners and start your journey today</p>

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

            {/* Role selector */}
            <div className="role-selector" data-testid="role-selector">
              <button
                className={`role-btn ${role === "student" ? "active" : ""}`}
                onClick={() => setRole("student")}
                data-testid="role-student"
                type="button"
                disabled={loading}
              >
                <i className="fa-solid fa-graduation-cap"></i>
                <span>Student</span>
                <small>Learn from experts</small>
              </button>
              <button
                className={`role-btn ${role === "instructor" ? "active" : ""}`}
                onClick={() => setRole("instructor")}
                data-testid="role-instructor"
                type="button"
                disabled={loading}
              >
                <i className="fa-solid fa-chalkboard-user"></i>
                <span>Instructor</span>
                <small>Teach &amp; earn</small>
              </button>
            </div>

            <form onSubmit={handleSubmit} data-testid="register-form">
              <div className="auth-form-row">
                <div className="auth-form-group">
                  <label>First name</label>
                  <div className="auth-input-wrap" style={{
                    borderColor: validationErrors.firstName ? '#f5576c' : undefined
                  }}>
                    <i className="fa-solid fa-user"></i>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={e => setForm({ ...form, firstName: e.target.value })}
                      placeholder="First name"
                      required
                      data-testid="register-first-name"
                      disabled={loading}
                    />
                  </div>
                  {validationErrors.firstName && (
                    <span style={{ color: '#f5576c', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {validationErrors.firstName}
                    </span>
                  )}
                </div>
                <div className="auth-form-group">
                  <label>Last name</label>
                  <div className="auth-input-wrap" style={{
                    borderColor: validationErrors.lastName ? '#f5576c' : undefined
                  }}>
                    <i className="fa-solid fa-user"></i>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={e => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Last name"
                      required
                      data-testid="register-last-name"
                      disabled={loading}
                    />
                  </div>
                  {validationErrors.lastName && (
                    <span style={{ color: '#f5576c', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {validationErrors.lastName}
                    </span>
                  )}
                </div>
              </div>
              <div className="auth-form-group">
                <label>Email</label>
                <div className="auth-input-wrap" style={{
                  borderColor: validationErrors.email ? '#f5576c' : undefined
                }}>
                  <i className="fa-solid fa-envelope"></i>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    data-testid="register-email"
                    disabled={loading}
                  />
                </div>
                {validationErrors.email && (
                  <span style={{ color: '#f5576c', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {validationErrors.email}
                  </span>
                )}
              </div>
              <div className="auth-form-group">
                <label>Create a password</label>
                <div className="auth-input-wrap" style={{
                  borderColor: validationErrors.password ? '#f5576c' : undefined
                }}>
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Create a password"
                    required
                    data-testid="register-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-pass"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
                {validationErrors.password && (
                  <span style={{ color: '#f5576c', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {validationErrors.password}
                  </span>
                )}
              </div>
              <div className="auth-form-group">
                <label>Confirm your password</label>
                <div className="auth-input-wrap" style={{
                  borderColor: validationErrors.confirmPassword ? '#f5576c' : undefined
                }}>
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    required
                    data-testid="register-confirm-password"
                    disabled={loading}
                  />
                </div>
                {validationErrors.confirmPassword && (
                  <span style={{ color: '#f5576c', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {validationErrors.confirmPassword}
                  </span>
                )}
              </div>

              <label className="remember-me" style={{ marginBottom: 20 }}>
                <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} data-testid="agree-terms" />
                <span>I agree to the <Link to="/contact">Terms of Service</Link> and <Link to="/contact">Privacy Policy</Link></span>
              </label>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={!agreed || loading}
                data-testid="register-submit"
              >
                {loading ? (
                  <>Creating Account...</>
                ) : (
                  <>Create Account <i className="fa-solid fa-arrow-right"></i></>
                )}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login" data-testid="switch-to-login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
