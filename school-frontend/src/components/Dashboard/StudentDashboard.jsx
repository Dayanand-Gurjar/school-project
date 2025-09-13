import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import ProfileForm from '../Profile/ProfileForm';
import './Dashboard.css';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [schedule, setSchedule] = useState([]);
  const [events, setEvents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const [scheduleRes, eventsRes, attendanceRes] = await Promise.all([
        api.get('/student/schedule'),
        api.get('/student/events'),
        api.get('/student/attendance')
      ]);

      if (scheduleRes.data.success) {
        setSchedule(scheduleRes.data.data);
      }

      if (eventsRes.data.success) {
        setEvents(eventsRes.data.data);
      }

      if (attendanceRes.data.success) {
        setAttendance(attendanceRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDaySchedule = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return schedule.filter(period => period.day === today);
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return events.filter(event => new Date(event.event_date) >= today).slice(0, 3);
  };

  const calculateAttendancePercentage = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(record => record.status === 'present').length;
    return Math.round((present / attendance.length) * 100);
  };

  const tabContent = {
    overview: (
      <div className="dashboard-overview">
        <div className="welcome-section">
          <h2>Welcome, {user?.firstName}!</h2>
          <p>Grade {user?.grade} | Student ID: {user?.studentId || 'Pending'}</p>
        </div>

        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{schedule.length}</h3>
              <p>Weekly Periods</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{calculateAttendancePercentage()}%</h3>
              <p>Attendance</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{getUpcomingEvents().length}</h3>
              <p>Upcoming Events</p>
            </div>
          </div>
        </div>

        <div className="today-schedule">
          <h3>Today's Classes</h3>
          <div className="schedule-grid">
            {getCurrentDaySchedule().length > 0 ? (
              getCurrentDaySchedule().map((period, index) => (
                <div key={index} className="period-card">
                  <div className="period-time">
                    {period.startTime} - {period.endTime}
                  </div>
                  <div className="period-info">
                    <h4>{period.subject}</h4>
                    <p>Teacher: {period.teacher}</p>
                    <span className="room">Room {period.room}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-schedule">
                <p>No classes scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        <div className="upcoming-events">
          <h3>Upcoming Events</h3>
          <div className="events-list">
            {getUpcomingEvents().length > 0 ? (
              getUpcomingEvents().map((event, index) => (
                <div key={index} className="event-card">
                  <div className="event-date">
                    {new Date(event.event_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="event-info">
                    <h4>{event.title}</h4>
                    <p>{event.description.substring(0, 100)}...</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No upcoming events</p>
              </div>
            )}
          </div>
        </div>
      </div>
    ),

    schedule: (
      <div className="schedule-section">
        <h3>My Weekly Schedule</h3>
        <div className="weekly-schedule">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
            <div key={day} className="day-schedule">
              <h4>{day}</h4>
              <div className="day-periods">
                {schedule.filter(period => period.day === day).map((period, index) => (
                  <div key={index} className="period-item">
                    <div className="period-time">
                      {period.startTime} - {period.endTime}
                    </div>
                    <div className="period-details">
                      <strong>{period.subject}</strong>
                      <p>Teacher: {period.teacher}</p>
                      <span className="room-info">Room {period.room}</span>
                    </div>
                  </div>
                ))}
                {schedule.filter(period => period.day === day).length === 0 && (
                  <div className="no-periods">No classes</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    attendance: (
      <div className="attendance-section">
        <div className="attendance-summary">
          <h3>Attendance Summary</h3>
          <div className="attendance-stats">
            <div className="attendance-stat">
              <div className="stat-value">{calculateAttendancePercentage()}%</div>
              <div className="stat-label">Overall Attendance</div>
            </div>
            <div className="attendance-stat">
              <div className="stat-value">{attendance.filter(r => r.status === 'present').length}</div>
              <div className="stat-label">Days Present</div>
            </div>
            <div className="attendance-stat">
              <div className="stat-value">{attendance.filter(r => r.status === 'absent').length}</div>
              <div className="stat-label">Days Absent</div>
            </div>
          </div>
        </div>

        <div className="attendance-records">
          <h3>Recent Attendance</h3>
          <div className="attendance-list">
            {attendance.slice(0, 10).map((record, index) => (
              <div key={index} className="attendance-record">
                <div className="record-date">
                  {new Date(record.date).toLocaleDateString()}
                </div>
                <div className="record-subject">{record.subject}</div>
                <div className={`record-status ${record.status}`}>
                  {record.status === 'present' ? '✅' : '❌'} {record.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    calendar: (
      <div className="calendar-section">
        <h3>School Calendar</h3>
        <div className="calendar-events">
          <h4>All School Events</h4>
          <div className="events-list">
            {events.map((event, index) => (
              <div key={index} className="event-item">
                <div className="event-date">
                  {new Date(event.event_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="event-details">
                  <h4>{event.title}</h4>
                  <p>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    profile: (
      <div className="profile-section">
        <ProfileForm />
      </div>
    )
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>View your schedule, attendance, and school events</p>
      </div>

      <div className="dashboard-nav">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          📅 My Schedule
        </button>
        <button 
          className={`nav-tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          ✅ Attendance
        </button>
        <button
          className={`nav-tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📆 Calendar
        </button>
        <button
          className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
      </div>

      <div className="dashboard-content">
        {tabContent[activeTab]}
      </div>
    </div>
  );
}