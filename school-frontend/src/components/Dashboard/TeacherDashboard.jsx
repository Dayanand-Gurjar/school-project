import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import './Dashboard.css';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [schedule, setSchedule] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Leave request form state
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'sick' // sick, personal, emergency
  });

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const [scheduleData, leaveData, studentsData] = await Promise.all([
        api.getTeacherSchedule(),
        api.getTeacherLeaveRequests(),
        api.getTeacherStudents()
      ]);

      setSchedule(scheduleData);
      setLeaveRequests(leaveData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.submitTeacherLeaveRequest(leaveForm);
      if (response.success) {
        setLeaveRequests(prev => [response.data, ...prev]);
        setLeaveForm({
          startDate: '',
          endDate: '',
          reason: '',
          type: 'sick'
        });
        alert('Leave request submitted successfully!');
      } else {
        alert('Error submitting leave request: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Error submitting leave request');
    }
  };

  const getCurrentDaySchedule = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return schedule.filter(period => period.day === today);
  };

  const tabContent = {
    overview: (
      <div className="dashboard-overview">
        <div className="welcome-section">
          <h2>Welcome, {user?.firstName}!</h2>
          <p>Subject: {user?.subject} | Employee ID: {user?.employeeId}</p>
        </div>

        <div className="today-schedule">
          <h3>Today's Schedule</h3>
          <div className="schedule-grid">
            {getCurrentDaySchedule().length > 0 ? (
              getCurrentDaySchedule().map((period, index) => (
                <div key={index} className="period-card">
                  <div className="period-time">
                    {period.startTime} - {period.endTime}
                  </div>
                  <div className="period-info">
                    <h4>{period.subject}</h4>
                    <p>Grade {period.grade} - {period.section}</p>
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

        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">👨‍🎓</div>
            <div className="stat-content">
              <h3>{students.length}</h3>
              <p>Total Students</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{schedule.length}</h3>
              <p>Weekly Periods</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>{leaveRequests.filter(req => req.status === 'pending').length}</h3>
              <p>Pending Leaves</p>
            </div>
          </div>
        </div>
      </div>
    ),

    schedule: (
      <div className="schedule-section">
        <h3>Weekly Schedule</h3>
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
                      <p>Grade {period.grade} - {period.section}</p>
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

    leave: (
      <div className="leave-section">
        <div className="leave-form-container">
          <h3>Request Leave</h3>
          <form onSubmit={handleLeaveSubmit} className="leave-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="type">Leave Type</label>
              <select
                id="type"
                value={leaveForm.type}
                onChange={(e) => setLeaveForm({...leaveForm, type: e.target.value})}
              >
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="emergency">Emergency Leave</option>
                <option value="vacation">Vacation</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="reason">Reason</label>
              <textarea
                id="reason"
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                placeholder="Please provide a reason for your leave..."
                required
              />
            </div>
            <button type="submit" className="btn-primary">Submit Leave Request</button>
          </form>
        </div>

        <div className="leave-history">
          <h3>Leave History</h3>
          <div className="leave-list">
            {leaveRequests.length > 0 ? (
              leaveRequests.map((request, index) => (
                <div key={index} className="leave-item">
                  <div className="leave-info">
                    <div className="leave-dates">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </div>
                    <div className="leave-type">{request.type.charAt(0).toUpperCase() + request.type.slice(1)} Leave</div>
                    <div className="leave-reason">{request.reason}</div>
                  </div>
                  <div className={`leave-status ${request.status}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No leave requests found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    ),

    students: (
      <div className="students-section">
        <h3>My Students</h3>
        <div className="students-grid">
          {students.length > 0 ? (
            students.map((student, index) => (
              <div key={index} className="student-card">
                <div className="student-info">
                  <h4>{student.firstName} {student.lastName}</h4>
                  <p>Grade {student.grade}</p>
                  <p>{student.email}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No students assigned</p>
            </div>
          )}
        </div>
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
        <h1>Teacher Dashboard</h1>
        <p>Manage your classes, schedule, and leave requests</p>
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
          className={`nav-tab ${activeTab === 'leave' ? 'active' : ''}`}
          onClick={() => setActiveTab('leave')}
        >
          📝 Leave Management
        </button>
        <button 
          className={`nav-tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          👨‍🎓 My Students
        </button>
      </div>

      <div className="dashboard-content">
        {tabContent[activeTab]}
      </div>
    </div>
  );
}