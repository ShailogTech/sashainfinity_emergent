import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glassmorphic-footer" data-testid="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* About Section */}
          <div className="footer-about">
            <div className="footer-logo">
              <Link to="/">
                <img src="https://sashainfinity.com/wp-content/uploads/2025/06/sasha-logo-small.png" alt="Sashainfinity" />
              </Link>
            </div>
            <p className="footer-description">
              Empowering learners with cutting-edge technology and personalized education experiences.
            </p>
            <div className="footer-contact">
              <p className="footer-address">
                1477/5/630-E, near Sona College of Technology, Salem, Tamil Nadu 636004
              </p>
              <p className="footer-phone">+91 8438740893</p>
            </div>
            <div className="footer-socials">
              <a
                href="https://www.instagram.com/sashainfinityedu"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-instagram"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://www.linkedin.com/company/sashainfinity/"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-linkedin"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a
                href="https://twitter.com/sashainfinity"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-twitter"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="https://www.youtube.com/@sashainfinity"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-youtube"
                aria-label="YouTube"
              >
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          {/* Resources Section */}
          <div className="footer-section">
            <h4 className="footer-heading">Resources</h4>
            <ul className="footer-links">
              <li><Link to="/">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/courses">All Courses</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/meiporul-ar">Meiporul AR</Link></li>
            </ul>
          </div>

          {/* Courses Section */}
          <div className="footer-section">
            <h4 className="footer-heading">Popular Courses</h4>
            <ul className="footer-links">
              <li><Link to="/courses">Data Analytics</Link></li>
              <li><Link to="/courses">Full Stack Development</Link></li>
              <li><Link to="/courses">React JS Mastery</Link></li>
              <li><Link to="/courses">MS Excel Advanced</Link></li>
              <li><Link to="/courses">Python Programming</Link></li>
            </ul>
          </div>

          {/* Quick Links Section */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/get-started">Join as Student</Link></li>
              <li><Link to="/get-started">Join as Instructor</Link></li>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/contact">Get Support</Link></li>
            </ul>

            <div className="footer-hours">
              <h4 className="footer-heading">Working Hours</h4>
              <p className="footer-hours-text">Mon - Sat: 9:00 AM - 7:00 PM</p>
              <p className="footer-hours-text">Sunday: Closed</p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              Copyright &copy; {currentYear} Sashainfinity. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <Link to="/contact">Privacy Policy</Link>
              <span className="footer-divider">•</span>
              <Link to="/contact">Terms & Conditions</Link>
              <span className="footer-divider">•</span>
              <Link to="/contact">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
