import React from "react";
import { Link } from "react-router-dom";
import "./QuickLinks.css";

export default function QuickLinks() {
  const quickLinks = [
    {
      icon: "📅",
      title: "Academic Calendar",
      description: "View important dates and schedules",
      link: "/academic-calendar",
      color: "primary"
    },
    {
      icon: "💻",
      title: "Online Learning",
      description: "Access digital classrooms",
      link: "/online-learning", 
      color: "secondary"
    },
    {
      icon: "📊",
      title: "Student Portal",
      description: "Check grades and assignments",
      link: "/student-portal",
      color: "accent"
    },
    {
      icon: "🏫",
      title: "Campus Tour",
      description: "Explore our facilities through photos",
      link: "/gallery",
      color: "primary"
    }
  ];

  return (
    <section className="quicklinks">
      <div className="container">
        <div className="quicklinks__header">
          <h2 className="quicklinks__title">Quick Access</h2>
          <p className="quicklinks__subtitle">
            Essential resources and tools for students, parents, and faculty
          </p>
        </div>
        
        <div className="quicklinks__grid">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.link}
              className={`quicklinks__card quicklinks__card--${link.color}`}
            >
              <div className="quicklinks__icon">{link.icon}</div>
              <h3 className="quicklinks__card-title">{link.title}</h3>
              <p className="quicklinks__description">{link.description}</p>
              <div className="quicklinks__arrow">→</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
