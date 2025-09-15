import React from "react";
import "./PrincipalMessage.css";

export default function PrincipalMessage() {
  return (
    <section className="principal-message">
      <div className="container">
        <div className="principal-message__content">
          <div className="principal-message__image">
            <img 
              src="/assets/principal.jpg" 
              alt="Principal" 
              className="principal-message__photo"
            />
            <div className="principal-message__quote-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" fill="currentColor"/>
              </svg>
            </div>
          </div>
          
          <div className="principal-message__text">
            <div className="principal-message__header">
              <h2 className="principal-message__title">Principal's Message</h2>
              <div className="principal-message__line"></div>
            </div>
            
            <div className="principal-message__message">
              <p>
                "Every child who enters our doors carries within them immense potential, regardless of their past circumstances. Whether they come to us as rescued child laborers, homeless children, or those separated from their families by unfortunate events, we see not their struggles, but their strength."
              </p>
              
              <p>
                "Our residential school is more than an educational institution—it's a sanctuary where healing begins, dreams take shape, and futures are rebuilt. We provide not just academic excellence, but emotional support, nutritional care, and most importantly, unconditional love. Our mission is to ensure that every child experiences the childhood they deserve while preparing them for a bright future."
              </p>
            </div>
            
            <div className="principal-message__signature">
              <div className="principal-message__name">Mr. Naveen Kumar</div>
              <div className="principal-message__title-small">Principal</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}