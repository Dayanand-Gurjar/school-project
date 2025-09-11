import React from "react";
import { Link } from "react-router-dom";
import { SCHOOL_NAME, LOGO_URL } from "../../config/constants";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Academics", path: "/academics" },
    { name: "Admissions", path: "/admissions" },
    { name: "Events", path: "/events" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact", path: "/contact" }
  ];

  const contactInfo = {
    address: "123 Education Street, Knowledge City, KC 12345",
    phone: "+1 (555) 123-4567",
    email: "info@nscbschool.edu",
    hours: "Monday - Friday: 8:00 AM - 4:00 PM"
  };

  return (
    <footer className="footer">
        <div className="footer__main">
          <div className="container">
            <div className="footer__content">
              {/* School Info */}
              <div className="footer__section">
                <div className="footer__brand">
                  <Link to="/" className="footer__logo-link">
                    <img 
                      src={LOGO_URL} 
                      alt={`${SCHOOL_NAME} Logo`} 
                      className="footer__logo"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <span className="footer__school-name">{SCHOOL_NAME}</span>
                  </Link>
                </div>
                <p className="footer__description">
                  Empowering students with knowledge, character, and leadership skills 
                  for over 30 years. Building tomorrow's leaders today.
                </p>
                <div className="footer__social">
                  <a href="#" className="footer__social-link" aria-label="Facebook">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                  <a href="#" className="footer__social-link" aria-label="Twitter">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M23 3C22.0424 3.67548 20.9821 4.19211 19.86 4.53C19.2577 3.83751 18.4573 3.34669 17.567 3.12393C16.6767 2.90116 15.7395 2.95718 14.8821 3.28445C14.0247 3.61171 13.2884 4.19439 12.773 4.95372C12.2575 5.71305 11.9877 6.61232 12 7.53V8.53C10.2426 8.57557 8.50127 8.18581 6.93101 7.39624C5.36074 6.60667 4.01032 5.43666 3 4C3 4 -1 13 8 17C5.94053 18.398 3.48716 19.099 1 19C10 24 21 19 21 7.5C20.9991 7.22145 20.9723 6.94359 20.92 6.67C21.9406 5.66349 22.6608 4.39271 23 3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                  <a href="#" className="footer__social-link" aria-label="Instagram">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2"/>
                      <path d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61992 14.1902 8.22773 13.4229 8.09407 12.5922C7.9604 11.7616 8.09207 10.9099 8.47033 10.1584C8.84859 9.40685 9.45419 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87658 12.63 8C13.4789 8.12588 14.2649 8.52146 14.8717 9.1283C15.4785 9.73515 15.8741 10.5211 16 11.37Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M17.5 6.5H17.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                  <a href="#" className="footer__social-link" aria-label="LinkedIn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M16 8C18.5013 8 20.9049 9.05449 22.6377 10.9373C24.3704 12.8202 25.25 15.3591 25 18V22H21V18C21 16.9391 20.5786 15.9217 19.8284 15.1716C19.0783 14.4214 18.0609 14 17 14C15.9391 14 14.9217 14.4214 14.1716 15.1716C13.4214 15.9217 13 16.9391 13 18V22H9V18C8.75 15.3591 9.62961 12.8202 11.3623 10.9373C13.0951 9.05449 15.4987 8 16 8V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="2" y="9" width="4" height="13" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="footer__section">
                <h3 className="footer__title">Quick Links</h3>
                <ul className="footer__links">
                  {quickLinks.map((link) => (
                    <li key={link.path}>
                      <Link to={link.path} className="footer__link">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Info */}
              <div className="footer__section">
                <h3 className="footer__title">Contact Information</h3>
                <div className="footer__contact">
                  <div className="footer__contact-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{contactInfo.address}</span>
                  </div>
                  <div className="footer__contact-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3522 21.4019C21.1471 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59344 1.99522 8.06544 2.16708 8.43945 2.48353C8.81346 2.79999 9.06926 3.23945 9.15999 3.72C9.33 4.68007 9.6088 5.61273 9.98999 6.5C10.1056 6.78793 10.1441 7.10365 10.1011 7.41336C10.0581 7.72306 9.93514 8.01718 9.73999 8.26L8.51999 9.48C9.85112 11.9135 11.8865 13.9489 14.32 15.28L15.54 14.06C15.7828 13.8649 16.0769 13.7419 16.3866 13.6989C16.6963 13.6559 17.0121 13.6944 17.3 13.81C18.1873 14.1912 19.1199 14.47 20.08 14.64C20.5662 14.7315 21.0098 14.9900 21.3265 15.3684C21.6431 15.7469 21.8122 16.2245 21.8 16.71L22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{contactInfo.phone}</span>
                  </div>
                  <div className="footer__contact-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{contactInfo.email}</span>
                  </div>
                  <div className="footer__contact-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{contactInfo.hours}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <div className="container">
            <div className="footer__bottom-content">
              <p className="footer__copyright">
                © {currentYear} {SCHOOL_NAME}. All rights reserved.
              </p>
              <div className="footer__legal">
                <Link to="/privacy" className="footer__legal-link">Privacy Policy</Link>
                <Link to="/terms" className="footer__legal-link">Terms of Service</Link>
                <Link to="/accessibility" className="footer__legal-link">Accessibility</Link>
              </div>
            </div>
          </div>
        </div>
    </footer>
  );
}
