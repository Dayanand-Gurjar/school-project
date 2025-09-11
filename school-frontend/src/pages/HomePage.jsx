import React from "react";
import Hero from "../components/Home/Hero";
import Highlights from "../components/Home/Highlights";
import EventsPreview from "../components/Home/EventsPreview";
import QuickLinks from "../components/Home/QuickLinks";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Highlights />
      <EventsPreview />
      <QuickLinks />
    </div>
  );
}
