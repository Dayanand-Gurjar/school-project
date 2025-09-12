import React from "react";
import { SCHOOL_NAME } from "../config/constants";
import "./AcademicsPage.css";

export default function AcademicsPage() {
  const gradeStructure = [
    {
      title: "Primary Section",
      grades: "Grades 1-3",
      age: "Ages 6-8",
      focus: "Building Foundation Skills",
      subjects: ["English", "Mathematics", "Science", "Social Studies", "Art & Craft", "Physical Education"],
      icon: "🎨"
    },
    {
      title: "Elementary Section", 
      grades: "Grades 4-5",
      age: "Ages 9-10",
      focus: "Developing Core Knowledge",
      subjects: ["English", "Mathematics", "Science", "Social Studies", "Computer Basics", "Music", "Sports"],
      icon: "📚"
    },
    {
      title: "Middle Section",
      grades: "Grades 6-8", 
      age: "Ages 11-13",
      focus: "Preparing for Higher Learning",
      subjects: ["English", "Mathematics", "Science", "Social Studies", "Computer Science", "Hindi", "Physical Education"],
      icon: "🔬"
    }
  ];

  const keyFeatures = [
    {
      title: "Small Class Sizes",
      description: "Maximum 25 students per class for personalized attention",
      icon: "👥"
    },
    {
      title: "Qualified Teachers",
      description: "Experienced and caring teachers who know each student",
      icon: "👩‍🏫"
    },
    {
      title: "Fun Learning",
      description: "Interactive and engaging teaching methods",
      icon: "🎮"
    },
    {
      title: "Regular Assessment",
      description: "Continuous evaluation to track student progress", 
      icon: "📊"
    }
  ];

  const activities = [
    { name: "Annual Sports Day", icon: "🏃‍♂️" },
    { name: "Science Fair", icon: "🧪" },  
    { name: "Art Exhibition", icon: "🎨" },
    { name: "Reading Competition", icon: "📖" },
    { name: "Cultural Programs", icon: "🎭" },
    { name: "Field Trips", icon: "🚌" }
  ];

  return (
    <div className="academics-page">
      <div className="container">
        <div className="academics-header">
          <h1>Our Academic Program</h1>
          <p>Quality education for students from Grade 1 to Grade 8 at {SCHOOL_NAME}</p>
        </div>

        {/* Grade Structure */}
        <section className="grade-structure">
          <h2>Grade Structure</h2>
          <div className="grade-cards">
            {gradeStructure.map((section, index) => (
              <div key={index} className="grade-card">
                <div className="grade-card-header">
                  <span className="grade-icon">{section.icon}</span>
                  <div>
                    <h3>{section.title}</h3>
                    <p className="grade-info">{section.grades} • {section.age}</p>
                  </div>
                </div>
                <p className="grade-focus">{section.focus}</p>
                <div className="subjects">
                  <h4>Subjects:</h4>
                  <div className="subject-tags">
                    {section.subjects.map((subject, idx) => (
                      <span key={idx} className="subject-tag">{subject}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Features */}
        <section className="key-features">
          <h2>Why Choose Our School?</h2>
          <div className="features-grid">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* School Activities */}
        <section className="school-activities">
          <h2>School Activities</h2>
          <p>We believe learning happens both inside and outside the classroom!</p>
          <div className="activities-grid">
            {activities.map((activity, index) => (
              <div key={index} className="activity-item">
                <span className="activity-icon">{activity.icon}</span>
                <span className="activity-name">{activity.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* School Timings */}
        <section className="school-info">
          <div className="info-cards">
            <div className="info-card">
              <h3>🕒 School Timings</h3>
              <p><strong>Classes:</strong> 8:00 AM - 3:00 PM<br />
              <strong>Break Time:</strong> 11:00 AM - 11:30 AM<br />
              <strong>Lunch Time:</strong> 1:00 PM - 1:30 PM</p>
            </div>
            <div className="info-card">
              <h3>📅 Academic Year</h3>
              <p><strong>Session:</strong> April to March<br />
              <strong>Summer Break:</strong> May - June<br />
              <strong>Winter Break:</strong> December</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}