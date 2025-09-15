import React from "react";
import { SCHOOL_NAME, SCHOOL_CONTACT } from "../config/constants";
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
              <p>{SCHOOL_CONTACT.address.street}<br />
              {SCHOOL_CONTACT.address.city}, {SCHOOL_CONTACT.address.state} {SCHOOL_CONTACT.address.zipCode}</p>
            </div>

            <div className="contact-card">
              <h2>📞 Call Us</h2>
              <p><strong>Main Office:</strong> {SCHOOL_CONTACT.phone.main}<br />
              <strong>Principal:</strong> {SCHOOL_CONTACT.phone.principal}</p>
            </div>

            <div className="contact-card">
              <h2>✉️ Email Us</h2>
              <p><strong>General:</strong> {SCHOOL_CONTACT.email.general}<br />
              <strong>Admissions:</strong> {SCHOOL_CONTACT.email.admissions}</p>
            </div>

            <div className="contact-card">
              <h2>🕒 School Hours</h2>
              <p><strong>Summer:</strong> {SCHOOL_CONTACT.hours.summer}<br />
              <strong>Winter:</strong> {SCHOOL_CONTACT.hours.winter}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}