import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { SCHOOL_NAME, LOGO_URL, NAV_LINKS } from "../../config/constants";
import "./Navbar.css";

export default function Navbar({ isDashboard = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setShowUserMenu(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/dashboard';
    }
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  };

  const getUserRole = () => {
    if (!user) return '';
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''} ${isDashboard ? 'navbar--dashboard' : ''}`}>
        <div className="container">
          <div className="navbar__content">
            {/* Logo and Brand */}
            <Link to="/" className="navbar__brand">
              <img 
                src={LOGO_URL} 
                alt={`${SCHOOL_NAME} Logo`} 
                className="navbar__logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="navbar__title">{SCHOOL_NAME}</span>
            </Link>

            {/* Desktop Navigation */}
            {!isDashboard && (
              <div className="navbar__nav">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`navbar__link ${isActiveLink(link.path) ? 'navbar__link--active' : ''}`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}

            {/* User Menu / Auth Buttons */}
            <div className="navbar__actions">
              {isAuthenticated ? (
                <div className="navbar__user-menu">
                  <button
                    className="navbar__user-button"
                    onClick={toggleUserMenu}
                  >
                    <div className="user-avatar">
                      {user?.firstName?.charAt(0) || 'U'}
                    </div>
                    <div className="user-info">
                      <span className="user-name">{getUserDisplayName()}</span>
                      <span className="user-role">{getUserRole()}</span>
                    </div>
                    <svg 
                      className={`dropdown-arrow ${showUserMenu ? 'dropdown-arrow--open' : ''}`}
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 10l5 5 5-5z" fill="currentColor" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <div className="navbar__dropdown">
                      <Link to={getDashboardLink()} className="dropdown__item">
                        <span className="dropdown__icon">📊</span>
                        Dashboard
                      </Link>
                      <Link to="/profile" className="dropdown__item">
                        <span className="dropdown__icon">👤</span>
                        Profile
                      </Link>
                      <div className="dropdown__divider"></div>
                      <button onClick={handleLogout} className="dropdown__item dropdown__item--button">
                        <span className="dropdown__icon">🚪</span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="navbar__auth">
                  <Link to="/login" className="btn btn-outline btn-sm">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className={`navbar__toggle ${isMenuOpen ? 'navbar__toggle--active' : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              <span className="navbar__toggle-bar"></span>
              <span className="navbar__toggle-bar"></span>
              <span className="navbar__toggle-bar"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`navbar__overlay ${isMenuOpen ? 'navbar__overlay--active' : ''}`}>
        <div className="navbar__mobile-menu">
          <div className="navbar__mobile-header">
            <Link to="/" className="navbar__brand">
              <img 
                src={LOGO_URL} 
                alt={`${SCHOOL_NAME} Logo`} 
                className="navbar__logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="navbar__title">{SCHOOL_NAME}</span>
            </Link>
          </div>
          
          {/* Mobile Navigation Links */}
          <nav className="navbar__mobile-nav">
            {NAV_LINKS.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar__mobile-link ${isActiveLink(link.path) ? 'navbar__mobile-link--active' : ''}`}
                style={{ '--delay': `${index * 0.1}s` }}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Auth/User Section */}
          <div className="navbar__mobile-auth">
            {isAuthenticated ? (
              <div className="mobile-user-section">
                <div className="mobile-user-info">
                  <div className="user-avatar large">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{getUserDisplayName()}</span>
                    <span className="user-role">{getUserRole()}</span>
                  </div>
                </div>
                <div className="mobile-user-actions">
                  <Link to={getDashboardLink()} className="btn btn-primary btn-lg">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn btn-outline btn-lg">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="mobile-auth-buttons">
                <Link to="/login" className="btn btn-outline btn-lg">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
