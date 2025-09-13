import React from "react";
import Hero from "../components/Home/Hero";
import EventsPreview from "../components/Home/EventsPreview";
import QuickLinks from "../components/Home/QuickLinks";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <QuickLinks />
      <EventsPreview />
    </div>
  );
}
