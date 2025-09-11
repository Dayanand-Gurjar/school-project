import React, { useEffect, useState } from "react";
import { fetchEvents } from "../../services/api";
import "./EventsPreview.css";

export default function EventsPreview() {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    fetchEvents().then(setEvents).catch(console.error);
  }, []);

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
                <h4 className="events-preview__item-title">{event.title}</h4>
                <p className="events-preview__item-description">{event.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
