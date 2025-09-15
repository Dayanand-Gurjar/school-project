import React, { useState, useEffect } from "react";
import "./TeachersMessage.css";

export default function TeachersMessage() {
  const [currentCard, setCurrentCard] = useState(0);
  
  const teacherMessages = [
    {
      name: "Ms. Dinesh Kumar",
      role: "Teacher",
      image: "/assets/dineshsir.jpg",
      message: "Working with children who have faced trauma requires patience, understanding, and unconditional love. Every small breakthrough - a shy smile, a raised hand in class, or a moment of trust - reminds me why I chose this path. These children teach me resilience every day."
    }
  ];

  // Auto-rotate cards for mobile
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % teacherMessages.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [teacherMessages.length]);

  return (
    <section className="teachers-message">
      <div className="container">
        <div className="teachers-message__header">
          <h2 className="teachers-message__title">Voices from Our Heart</h2>
          <p className="teachers-message__subtitle">
            Our dedicated team shares their experiences in transforming young lives
          </p>
          <div className="teachers-message__line"></div>
        </div>

        {/* Desktop Grid */}
        <div className="teachers-message__grid">
          {teacherMessages.map((teacher, index) => (
            <div key={index} className="teachers-message__card">
              <div className="teachers-message__avatar">
                <img
                  src={teacher.image}
                  alt={teacher.name}
                  className="teachers-message__photo"
                />
                <div className="teachers-message__quote-small">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              
              <div className="teachers-message__card-content">
                <div className="teachers-message__card-header">
                  <div className="teachers-message__info">
                    <h3 className="teachers-message__name">{teacher.name}</h3>
                    <p className="teachers-message__role">{teacher.role}</p>
                  </div>
                </div>
                
                <div className="teachers-message__content">
                  <p className="teachers-message__text">"{teacher.message}"</p>
                </div>
                
                <div className="teachers-message__decoration">
                  <div className="teachers-message__heart">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="teachers-message__mobile-carousel">
          <div className="teachers-message__carousel-container">
            {teacherMessages.map((teacher, index) => (
              <div
                key={index}
                className={`teachers-message__mobile-card ${index === currentCard ? 'teachers-message__mobile-card--active' : ''}`}
              >
                <div className="teachers-message__card-header">
                  <div className="teachers-message__avatar">
                    <img
                      src={teacher.image}
                      alt={teacher.name}
                      className="teachers-message__photo"
                    />
                    <div className="teachers-message__quote-small">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" fill="currentColor"/>
                      </svg>
                    </div>
                  </div>
                  <div className="teachers-message__info">
                    <h3 className="teachers-message__name">{teacher.name}</h3>
                    <p className="teachers-message__role">{teacher.role}</p>
                  </div>
                </div>
                
                <div className="teachers-message__content">
                  <p className="teachers-message__text">"{teacher.message}"</p>
                </div>
                
                <div className="teachers-message__decoration">
                  <div className="teachers-message__heart">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile Indicators */}
          <div className="teachers-message__indicators">
            {teacherMessages.map((_, index) => (
              <div
                key={index}
                className={`teachers-message__indicator ${index === currentCard ? 'teachers-message__indicator--active' : ''}`}
                onClick={() => setCurrentCard(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}