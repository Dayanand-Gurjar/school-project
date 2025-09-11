import React, { useState } from "react";
import { createEvent } from "../../services/api";
import "./EventForm.css";

export default function EventForm({ onEventCreated }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const adminSecret = "dev-secret"; // replace later with auth JWT

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createEvent({ title, description: desc, event_date: date, image_url: "" }, adminSecret);
    if (res.success) {
      onEventCreated(res.data[0]);
      setTitle("");
      setDesc("");
      setDate("");
    } else {
      alert("Failed to create event: " + res.error);
    }
  };

  return (
    <div className="event-form">
      <h3 className="event-form__title">Add New Event</h3>
      <form onSubmit={handleSubmit} className="event-form__form">
        <input
          className="event-form__input"
          placeholder="Event Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <textarea
          className="event-form__textarea"
          placeholder="Event Description"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          required
        />
        <input
          className="event-form__input"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
        <button type="submit" className="event-form__submit">
          Add Event
        </button>
      </form>
    </div>
  );
}
