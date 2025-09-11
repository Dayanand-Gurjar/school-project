import React, { useState, useEffect } from 'react';
import './ImageCarousel.css';

export default function ImageCarousel({ images, alt = "Event image", autoPlay = true, autoPlayInterval = 4000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="image-carousel__placeholder">
        <span className="image-carousel__placeholder-icon">📅</span>
      </div>
    );
  }

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || images.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, images.length, isHovered]);

  // If only one image, show it without carousel controls
  if (images.length === 1) {
    return (
      <div className="image-carousel">
        <img
          src={images[0]}
          alt={alt}
          className="image-carousel__image"
        />
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div
      className="image-carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="image-carousel__container">
        <img 
          src={images[currentIndex]} 
          alt={`${alt} ${currentIndex + 1}`}
          className="image-carousel__image"
        />
        
        {/* Navigation arrows */}
        <button 
          className="image-carousel__nav image-carousel__nav--prev"
          onClick={goToPrevious}
          aria-label="Previous image"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button 
          className="image-carousel__nav image-carousel__nav--next"
          onClick={goToNext}
          aria-label="Next image"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Image counter with play/pause indicator */}
        <div className="image-carousel__counter">
          {currentIndex + 1} / {images.length}
          {autoPlay && images.length > 1 && (
            <span className="image-carousel__play-indicator">
              {isHovered ? '⏸️' : '▶️'}
            </span>
          )}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="image-carousel__dots">
        {images.map((_, index) => (
          <button
            key={index}
            className={`image-carousel__dot ${index === currentIndex ? 'image-carousel__dot--active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}