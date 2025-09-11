import React, { useState } from "react";
import EventForm from "../components/Events/EventForm";
import EventsList from "../components/Events/Eventslist";
import { useAuth } from "../contexts/AuthContext";

export default function EventsPage() {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(false);

  return (
    <div>
      {user.role === "admin" && <EventForm onEventCreated={()=>setRefresh(!refresh)} />}
      <EventsList key={refresh} />
    </div>
  );
}
