import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { SCHOOL_NAME, LOGO_URL, NAV_LINKS } from "../../config/constants";
import "./Navbar.css";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

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

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
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

            {/* CTA Button */}
            <div className="navbar__cta">
              <Link to="/contact" className="btn btn-secondary btn-sm">
                Admission
              </Link>
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

          <div className="navbar__mobile-cta">
            <Link to="/contact" className="btn btn-secondary btn-lg">
              Apply for Admission
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
