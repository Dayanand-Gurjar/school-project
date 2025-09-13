import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SCHOOL_NAME, API_BASE } from "../config/constants";
import "./AcademicsPage.css";

export default function AcademicsPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const location = useLocation();

  // Handle fragment scrolling
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    }
  }, [location.hash]);

  // Fetch teachers data for public display
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/public/teachers`);
        const data = await response.json();
        if (data.success) {
          setTeachers(data.data);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const activities = [
    { name: "Annual Sports Day", icon: "🏃‍♂️" },
    { name: "Science Fair", icon: "🧪" },
    { name: "Art Exhibition", icon: "🎨" },
    { name: "Reading Competition", icon: "📖" },
    { name: "Cultural Programs", icon: "🎭" },
    { name: "Field Trips", icon: "🚌" }
  ];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleMonthChange = (monthNumber) => {
    setSelectedMonth(monthNumber);
  };

  const getCalendarImage = (month) => {
    const monthString = month.toString().padStart(2, '0');
    return `/assets/${monthString}.jpg`;
  };

  return (
    <div className="academics-page">
      <div className="container">
        <div className="academics-header">
          <h1>Our Academic Program</h1>
          <p>Quality education for students from Grade 1 to Grade 8 at {SCHOOL_NAME}</p>
        </div>

        {/* Academic Calendar */}
        <section id="calendar" className="academic-calendar">
          <h2>📅 Academic Calendar</h2>
          <p>View our monthly school calendar and important dates</p>
          
          {/* Month Navigation */}
          <div className="calendar-navigation">
            <div className="month-selector">
              {monthNames.map((month, index) => (
                <button
                  key={index}
                  className={`month-btn ${selectedMonth === index + 1 ? 'active' : ''}`}
                  onClick={() => handleMonthChange(index + 1)}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Display */}
          <div className="calendar-display">
            <div className="calendar-header">
              <h3>{monthNames[selectedMonth - 1]} Calendar</h3>
            </div>
            <div className="calendar-image-container">
              <img
                src={getCalendarImage(selectedMonth)}
                alt={`${monthNames[selectedMonth - 1]} Calendar`}
                className="calendar-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="calendar-placeholder" style={{ display: 'none' }}>
                <div className="placeholder-icon">📅</div>
                <p>Calendar for {monthNames[selectedMonth - 1]} will be available soon</p>
              </div>
            </div>
          </div>
        </section>

        {/* School Activities */}
        <section className="school-activities">
          <h2>🎭 School Activities</h2>
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

        {/* Our Teachers */}
        <section id="teachers" className="our-teachers">
          <h2>👨‍🏫 Meet Our Teachers</h2>
          <p>Our dedicated and qualified teachers are committed to your child's success</p>
          {loading ? (
            <div className="teachers-loading">
              <div className="loading-spinner"></div>
              <p>Loading teachers...</p>
            </div>
          ) : teachers.length > 0 ? (
            <div className="teachers-grid">
              {teachers.map((teacher, index) => (
                <div key={teacher.id || index} className="teacher-card">
                  <div className="teacher-photo">
                    {teacher.profile_picture ? (
                      <img
                        src={`${API_BASE}${teacher.profile_picture}`}
                        alt={teacher.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="teacher-avatar" style={{ display: teacher.profile_picture ? 'none' : 'flex' }}>
                      👨‍🏫
                    </div>
                  </div>
                  <div className="teacher-info">
                    <h3>{teacher.name}</h3>
                    {teacher.subject && (
                      <p className="teacher-subject">{teacher.subject}</p>
                    )}
                    {teacher.phone && (
                      <p className="teacher-contact">📞 {teacher.phone}</p>
                    )}
                    {teacher.email && (
                      <p className="teacher-email">📧 {teacher.email}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-teachers">
              <p>Teacher information will be available soon!</p>
            </div>
          )}
        </section>

        {/* School Information */}
        <section className="school-info">
          <h2>📋 School Information</h2>
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