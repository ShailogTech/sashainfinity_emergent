import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useCart } from '@/contexts/CartContext';
import styles from './PublicHeader.module.css';

const PublicHeader = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuthStore();
  const { getItemCount } = useCart();
  const navigate = useNavigate();

  // Handle scroll effect for header
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle escape key to close mobile menu
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.headerContainer}`}>
          {/* Logo */}
          <Link to="/" className={styles.logoLink}>
            <img
              src="/assets/images/sasha-logo-small.png"
              alt="SashaInfinity Logo"
              className={styles.logo}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.nav}>
            <NavLink
              to="/"
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            >
              About Us
            </NavLink>
            <NavLink
              to="/courses"
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            >
              Courses
            </NavLink>
            <NavLink
              to="/blog"
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            >
              Blog
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            >
              Contact
            </NavLink>
            <NavLink
              to="/meiporul-ar"
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            >
              Meiporul AR
            </NavLink>
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Search */}
            <form onSubmit={handleSearch} className={styles.searchContainer}>
              <select className={styles.categorySelect}>
                <option>Categories</option>
                <option>Full Stack Development</option>
                <option>AI & Machine Learning</option>
                <option>Cloud Computing</option>
                <option>Cybersecurity</option>
              </select>
              <input
                type="text"
                placeholder="Search courses..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className={styles.searchButton}>
                <Search size={18} />
              </button>
            </form>

            {/* Cart */}
            <Link to="/cart" className={styles.actionIcon}>
              <ShoppingCart size={20} />
              <span className={styles.cartCount}>{getItemCount()}</span>
            </Link>

            {/* Auth Buttons */}
            {user ? (
              <>
                <Link to={user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard'} className={styles.loginLink}>
                  <User size={18} />
                  Dashboard
                </Link>
                <button onClick={handleLogout} className={styles.instructorButton}>
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.loginLink}>
                  Log In
                </Link>
                <Link to="/register?role=instructor" className={styles.instructorButton}>
                  Become an Instructor
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuButton}
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className={styles.mobileBackdrop}
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Menu */}
          <div className={styles.mobileMenu}>
            <div className="container">
              <nav className={styles.mobileNav}>
            <NavLink
              to="/"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </NavLink>
            <NavLink
              to="/courses"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Courses
            </NavLink>
            <NavLink
              to="/blog"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </NavLink>
            <NavLink
              to="/contact"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </NavLink>
            <NavLink
              to="/meiporul-ar"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Meiporul AR
            </NavLink>

            <div className={styles.mobileDivider} />

            {user ? (
              <>
                <Link
                  to={user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard'}
                  className={styles.mobileNavLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className={styles.mobileNavLink}
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={styles.mobileNavLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/register?role=instructor"
                  className={styles.mobileNavLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Become an Instructor
                </Link>
              </>
            )}
          </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default PublicHeader;
