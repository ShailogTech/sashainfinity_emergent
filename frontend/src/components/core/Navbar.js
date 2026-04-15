import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const userMenuRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    document.body.style.overflow = "";
  }, [location]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
    document.body.style.overflow = !mobileOpen ? "hidden" : "";
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/courses", label: "Courses" },
    { to: "/blog", label: "Blog" },
    { to: "/contact", label: "Contact" },
    { to: "/meiporul-ar", label: "Meiporul AR" },
  ];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      const parts = user.name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.name[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <nav data-testid="navbar" className="navbar">
        {/* Logo - LEFT corner */}
        <Link to="/" className="navbar-logo" data-testid="nav-logo">
          <img
            src="https://sashainfinity.com/wp-content/uploads/2025/06/sasha-logo-small.png"
            alt="Sasha Infinity"
            className="logo-img"
          />
        </Link>

        {/* Navigation Links - CENTER */}
        <ul className="navbar-links">
          {navLinks.map(link => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={location.pathname === link.to ? "active" : ""}
                data-testid={`nav-link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Profile / Auth Buttons - RIGHT corner */}
        <div className="navbar-actions" ref={userMenuRef}>
          {isAuthenticated() ? (
            <div className="user-menu">
              <button
                className="user-menu-button"
                onClick={toggleUserMenu}
                data-testid="user-menu-btn"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <span className="user-avatar">
                  {getUserInitials()}
                </span>
                <span className="user-name">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <i className={`fa-solid fa-chevron-${userMenuOpen ? 'up' : 'down'} dropdown-icon`} />
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-avatar">
                      {getUserInitials()}
                    </div>
                    <div className="user-dropdown-info">
                      <div className="user-dropdown-name">{user?.name || 'User'}</div>
                      <div className="user-dropdown-email">{user?.email}</div>
                    </div>
                  </div>

                  <div className="user-dropdown-divider" />

                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="user-dropdown-item"
                  >
                    <i className="fa-regular fa-user item-icon" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="user-dropdown-item"
                  >
                    <i className="fa-solid fa-gear item-icon" />
                    <span>Settings</span>
                  </Link>

                  <Link
                    to="/courses"
                    onClick={() => setUserMenuOpen(false)}
                    className="user-dropdown-item"
                  >
                    <i className="fa-solid fa-book-open item-icon" />
                    <span>My Courses</span>
                  </Link>

                  {hasRole(['admin', 'instructor']) && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="user-dropdown-item"
                    >
                      <i className="fa-solid fa-shield-halved item-icon" />
                      <span>Admin</span>
                    </Link>
                  )}

                  <div className="user-dropdown-divider" />

                  <button
                    onClick={handleLogout}
                    className="user-dropdown-item user-dropdown-logout"
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket item-icon" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login" data-testid="nav-login-btn">
                Log In
              </Link>
              <Link to="/get-started" className="btn-get-started" data-testid="nav-get-started-btn">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            className={`hamburger ${mobileOpen ? "active" : ""}`}
            onClick={toggleMobile}
            data-testid="hamburger-btn"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-overlay ${mobileOpen ? "active" : ""}`} onClick={toggleMobile} />
      <div className={`mobile-menu ${mobileOpen ? "active" : ""}`} data-testid="mobile-menu">
        <div className="mobile-menu-content">
          {/* Mobile User Section */}
          {isAuthenticated() && (
            <div className="mobile-user-section">
              <div className="mobile-user-avatar">
                {getUserInitials()}
              </div>
              <div className="mobile-user-info">
                <div className="mobile-user-name">{user?.name || 'User'}</div>
                <div className="mobile-user-email">{user?.email}</div>
              </div>
            </div>
          )}

          {/* Mobile Nav Links */}
          <nav className="mobile-nav">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={toggleMobile}
                className={location.pathname === link.to ? "active" : ""}
                data-testid={`mobile-link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Auth / User Links */}
          {isAuthenticated() ? (
            <div className="mobile-user-links">
              <Link
                to="/profile"
                onClick={toggleMobile}
                className="mobile-user-link"
              >
                <i className="fa-regular fa-user" />
                <span>Profile</span>
              </Link>
              <Link
                to="/settings"
                onClick={toggleMobile}
                className="mobile-user-link"
              >
                <i className="fa-solid fa-gear" />
                <span>Settings</span>
              </Link>
              <Link
                to="/courses"
                onClick={toggleMobile}
                className="mobile-user-link"
              >
                <i className="fa-solid fa-book-open" />
                <span>My Courses</span>
              </Link>
              {hasRole(['admin', 'instructor']) && (
                <Link
                  to="/admin"
                  onClick={toggleMobile}
                  className="mobile-user-link"
                >
                  <i className="fa-solid fa-shield-halved" />
                  <span>Admin</span>
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  toggleMobile();
                }}
                className="mobile-logout-btn"
              >
                <i className="fa-solid fa-arrow-right-from-bracket" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="mobile-auth-buttons">
              <Link
                to="/login"
                onClick={toggleMobile}
                className="mobile-login-btn"
                data-testid="mobile-login-link"
              >
                Log In
              </Link>
              <Link
                to="/get-started"
                onClick={toggleMobile}
                className="mobile-get-started-btn"
                data-testid="mobile-get-started-link"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
