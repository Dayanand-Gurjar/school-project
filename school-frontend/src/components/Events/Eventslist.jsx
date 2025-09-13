import React, { useEffect, useState } from "react";
import { useData } from "../../contexts/DataContext";
import { deleteEvent } from "../../services/api";
import ImageCarousel from "../common/ImageCarousel";
import "./EventsList.css";

export default function EventsList() {
  const { getEvents, updateCache } = useData();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const adminSecret = "dev-secret";
  
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const eventData = await getEvents();
      setEvents(eventData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const result = await deleteEvent(id, adminSecret);
      if (result.success) {
        const updatedEvents = events.filter(event => event.id !== id);
        setEvents(updatedEvents);
        // Update cache
        updateCache('events', updatedEvents);
      } else {
        alert('Failed to delete event: ' + result.error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="events-list">
        <div className="container">
          <h2 className="events-list__title">All Events</h2>
          <div className="events-list__empty">Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="events-list">
      <div className="container">
        <h2 className="events-list__title">All Events</h2>
        {events.length === 0 ? (
          <div className="events-list__empty">No events available</div>
        ) : (
          <div className="events-list__container">
            {events.map((event) => (
              <article key={event.id} className="events-list__item">
                <div className="events-list__item-image-container">
                  <ImageCarousel 
                    images={event.image_urls || (event.image_url ? [event.image_url] : [])}
                    alt={event.title}
                  />
                </div>
                
                <div className="events-list__item-content">
                  <div className="events-list__item-header">
                    <h3 className="events-list__item-title">{event.title}</h3>
                    <span className="events-list__item-date">
                      {formatDate(event.event_date)}
                    </span>
                  </div>
                  
                  <p className="events-list__item-description">
                    {event.description}
                  </p>
                  
                  <div className="events-list__item-footer">
                    <div className="events-list__item-meta">
                      <span>📍 School Campus</span>
                      {event.image_urls && event.image_urls.length > 1 && (
                        <span>🖼️ {event.image_urls.length} images</span>
                      )}
                    </div>
                    
                    <div className="events-list__item-actions">
                      <button 
                        className="events-list__item-btn events-list__item-btn--edit"
                        onClick={() => alert('Edit functionality coming soon!')}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="events-list__item-btn events-list__item-btn--delete"
                        onClick={() => handleDelete(event.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
