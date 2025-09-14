import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SCHOOL_NAME } from "../../config/constants";
import "./Hero.css";

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    {
      title: `Welcome to ${SCHOOL_NAME}`,
      subtitle: "Nurturing Excellence Since 2000",
      description: "Empowering students with knowledge, character, and leadership skills for a brighter tomorrow.",
      image: "/assets/photo1.jpg",
      cta: "Explore Programs",
      themeColor: "primary"
    },
    {
      title: "Academic Excellence",
      subtitle: "World-Class Education",
      description: "Our comprehensive curriculum and expert faculty ensure students reach their full potential.",
      image: "/assets/photo2.jpg",
      cta: "View Academics",
      themeColor: "secondary"
    },
    {
      title: "Innovation & Technology",
      subtitle: "Future-Ready Learning",
      description: "State-of-the-art facilities and modern teaching methods prepare students for tomorrow's challenges.",
      image: "/assets/photo3.jpg",
      cta: "View Gallery",
      themeColor: "accent"
    }
  ];

  // Auto-rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="hero">
      <div className="hero__slider">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`hero__slide hero__slide--${slide.themeColor} ${index === currentSlide ? 'hero__slide--active' : ''}`}
          >
            <div className="hero__background">
              <div className={`hero__overlay hero__overlay--${slide.themeColor}`}></div>
              <div className="hero__blend-layer"></div>
              <img
                src={slide.image}
                alt={slide.title}
                className="hero__image"
                onError={(e) => {
                  e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%231e3a8a;stop-opacity:1" /><stop offset="100%" style="stop-color:%233730a3;stop-opacity:1" /></linearGradient></defs><rect width="1200" height="600" fill="url(%23grad)"/><text x="600" y="300" font-family="Arial,sans-serif" font-size="48" fill="white" text-anchor="middle" dy=".3em">School Campus</text></svg>`;
                }}
              />
            </div>
            
            <div className="container">
              <div className="hero__content">
                <div className="hero__text">
                  <h1 className="hero__title">
                    {slide.title}
                  </h1>
                  <p className="hero__subtitle">
                    {slide.subtitle}
                  </p>
                  <p className="hero__description">
                    {slide.description}
                  </p>
                  <div className="hero__actions">
                    <Link
                      to={slide.cta === "View Gallery" ? "/gallery" : "/academics"}
                      className="btn btn-primary btn-lg"
                    >
                      {slide.cta}
                    </Link>
                    <Link to="/contact" className="btn btn-outline btn-lg">
                      Contact Us
                    </Link>
                  </div>
                </div>
                
                <div className="hero__stats">
                  <div className="hero__stat">
                    <span className="hero__stat-number">100+</span>
                    <span className="hero__stat-label">Students</span>
                  </div>
                  <div className="hero__stat">
                    <span className="hero__stat-number">11</span>
                    <span className="hero__stat-label">Teachers</span>
                  </div>
                  <div className="hero__stat">
                    <span className="hero__stat-number">95%</span>
                    <span className="hero__stat-label">Success Rate</span>
                  </div>
                  <div className="hero__stat">
                    <span className="hero__stat-number">20+</span>
                    <span className="hero__stat-label">Years Legacy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="hero__controls">
        <button 
          className="hero__nav hero__nav--prev"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button 
          className="hero__nav hero__nav--next"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="hero__indicators">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={`hero__indicator ${index === currentSlide ? 'hero__indicator--active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="hero__scroll-indicator">
        <div className="hero__scroll-text">Scroll to explore</div>
        <div className="hero__scroll-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M7 13L12 18L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </section>
  );
}
