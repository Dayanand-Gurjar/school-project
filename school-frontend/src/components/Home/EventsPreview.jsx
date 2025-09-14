import React, { useEffect, useState } from "react";
import { fetchEvents } from "../../services/api";
import ImageCarousel from "../common/ImageCarousel";
import "./EventsPreview.css";

export default function EventsPreview() {
  const [events, setEvents] = useState([]);
  const [expandedEvents, setExpandedEvents] = useState(new Set());
  
  useEffect(() => {
    fetchEvents().then(setEvents).catch(console.error);
  }, []);

  const toggleExpanded = (eventId) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const isExpanded = (eventId) => expandedEvents.has(eventId);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section className="events-preview">
      <div className="container">
        <h2 className="events-preview__title">Latest Events</h2>
        {events.length === 0 ? (
          <p className="events-preview__empty">No events yet</p>
        ) : (
          <div className="events-preview__list">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="events-preview__item">
                <div className="events-preview__item-image-container">
                  <ImageCarousel
                    images={event.image_urls || (event.image_url ? [event.image_url] : [])}
                    alt={event.title}
                  />
                </div>
                <div className="events-preview__item-content">
                  <h4 className="events-preview__item-title">{event.title}</h4>
                  <div className="events-preview__item-description-container">
                    <p
                      className={`events-preview__item-description ${isExpanded(event.id) ? 'expanded' : ''}`}
                    >
                      {event.description}
                    </p>
                    {event.description && event.description.length > 100 && (
                      <button
                        className="events-preview__expand-btn"
                        onClick={() => toggleExpanded(event.id)}
                      >
                        {isExpanded(event.id) ? 'Show less' : '...more'}
                      </button>
                    )}
                  </div>
                  <div className="events-preview__item-footer">
                    <div className="events-preview__item-date">
                      {formatDate(event.event_date)}
                    </div>
                    {event.image_urls && event.image_urls.length > 1 && (
                      <div className="events-preview__item-image-count">
                        🖼️ {event.image_urls.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
