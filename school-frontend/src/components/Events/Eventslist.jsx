import React, { useEffect, useState } from "react";
import { fetchEvents } from "../../services/api";

export default function EventsList() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    fetchEvents().then(setEvents).catch(console.error);
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>All Events</h2>
      {events.map((e) => (
        <div key={e.id} style={{ borderBottom: "1px solid #ccc", marginBottom: "1rem" }}>
          <h4>{e.title}</h4>
          <p>{e.description}</p>
          <small>{e.event_date}</small>
        </div>
      ))}
    </div>
  );
}
