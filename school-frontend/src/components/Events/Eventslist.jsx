import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../config/constants';

export default function EventsList(){
  const [events, setEvents] = useState([]);
  useEffect(()=>{
    fetch(`${API_BASE}/api/events`)
      .then(r => r.json())
      .then(d => setEvents(d.data || d))
      .catch(console.error);
  },[]);
  return (
    <div>
      {events.length === 0 ? <p>No events</p> : events.map(e => (
        <div key={e.id}>
          <h3>{e.title}</h3>
          <p>{e.description}</p>
          <small>{e.event_date}</small>
        </div>
      ))}
    </div>
  );
}
