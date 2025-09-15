import React from "react";
import Hero from "../components/Home/Hero";
import PrincipalMessage from "../components/Home/PrincipalMessage";
import TeachersMessage from "../components/Home/TeachersMessage";
import EventsPreview from "../components/Home/EventsPreview";
import QuickLinks from "../components/Home/QuickLinks";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <PrincipalMessage />
      <TeachersMessage />
      <QuickLinks />
      <EventsPreview />
    </div>
  );
}
