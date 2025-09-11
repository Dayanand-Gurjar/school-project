import React from "react";
import { SCHOOL_NAME } from "../config/constants";
import "./ContactPage.css";

export default function ContactPage() {
  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you! Get in touch with {SCHOOL_NAME}</p>
        </div>

        <div className="contact-content">
          {/* Contact Information */}
          <div className="contact-info">
            <div className="contact-card">
              <h2>📍 Visit Us</h2>
              <p>123 School Street<br />
              Education City, EC 12345</p>
            </div>

            <div className="contact-card">
              <h2>📞 Call Us</h2>
              <p><strong>Main Office:</strong> (555) 123-4567<br />
              <strong>Principal:</strong> (555) 123-4568</p>
            </div>

            <div className="contact-card">
              <h2>✉️ Email Us</h2>
              <p><strong>General:</strong> info@nscbschool.edu<br />
              <strong>Admissions:</strong> admissions@nscbschool.edu</p>
            </div>

            <div className="contact-card">
              <h2>🕒 School Hours</h2>
              <p><strong>Classes:</strong> Mon-Fri 8:00 AM - 3:00 PM<br />
              <strong>Office:</strong> Mon-Fri 7:30 AM - 4:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}