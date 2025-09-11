import React from "react";
import { Link } from "react-router-dom";
import "./Highlights.css";

export default function Highlights() {
  const highlights = [
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Academic Excellence",
      description: "Top-tier education with 95% success rate in board examinations and competitive entrance tests.",
      stats: "95% Success Rate",
      color: "primary"
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 13L12 8L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 1L20 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Modern Infrastructure",
      description: "State-of-the-art classrooms, laboratories, library, and sports facilities designed for comprehensive learning.",
      stats: "50+ Facilities",
      color: "secondary"
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Expert Faculty",
      description: "Highly qualified and experienced teachers committed to nurturing every student's potential.",
      stats: "150+ Teachers",
      color: "accent"
    }
  ];

  return (
    <section className="highlights">
      <div className="container">
        <div className="highlights__header">
          <h2 className="highlights__title">Why Choose Our School?</h2>
          <p className="highlights__subtitle">
            Discover what makes us the preferred choice for quality education and student success
          </p>
        </div>

        <div className="highlights__grid">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className={`highlights__card highlights__card--${highlight.color}`}
              style={{ '--delay': `${index * 0.1}s` }}
            >
              <div className="highlights__icon">
                {highlight.icon}
              </div>
              <div className="highlights__content">
                <h3 className="highlights__card-title">{highlight.title}</h3>
                <p className="highlights__description">{highlight.description}</p>
                <div className="highlights__stats">{highlight.stats}</div>
              </div>
              <div className="highlights__overlay"></div>
            </div>
          ))}
        </div>

        <div className="highlights__cta">
          <Link to="/about" className="btn btn-primary btn-lg">
            Learn More About Us
          </Link>
          <Link to="/contact" className="btn btn-outline btn-lg">
            Schedule a Visit
          </Link>
        </div>
      </div>
    </section>
  );
}
