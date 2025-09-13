import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import ProfileForm from '../Profile/ProfileForm';
import './Dashboard.css';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [schedule, setSchedule] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Students section state
  const [selectedClass, setSelectedClass] = useState('all');
  const [availableClasses, setAvailableClasses] = useState([]);
  
  // Day selector state for overview
  const [selectedDay, setSelectedDay] = useState(() => {
    // Default to today's day
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return today;
  });

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
      
      // Extract unique classes from students data
      const classes = [...new Set(studentsData.map(student => student.grade).filter(Boolean))];
      setAvailableClasses(classes.sort());
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason.trim()) {
      alert('Please fill in all required fields (start date, end date, and reason)');
      return;
    }

    // Date validation
    const startDate = new Date(leaveForm.startDate);
    const endDate = new Date(leaveForm.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      alert('Start date cannot be in the past');
      return;
    }

    if (endDate < startDate) {
      alert('End date must be on or after start date');
      return;
    }

    // Calculate date difference for validation
    const daysDifference = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    if (daysDifference > 30) {
      alert('Leave request cannot exceed 30 days');
      return;
    }

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
        alert('Leave request submitted and approved successfully!');
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

  const getSelectedDaySchedule = () => {
    return schedule.filter(period => period.day === selectedDay);
  };

  const isToday = (day) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return day === today;
  };

  const tabContent = {
    overview: (
      <div className="dashboard-overview">
        <div className="welcome-section">
          <h2>Welcome, {user?.firstName}!</h2>
          <p>Have a great day teaching!</p>
        </div>

        <div className="day-schedule-section">
          <div className="schedule-header">
            <h3>
              {isToday(selectedDay) ? "Today's Schedule" : `${selectedDay}'s Schedule`}
            </h3>
            <div className="day-selector">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="day-select"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <option key={day} value={day}>
                    {day} {isToday(day) ? '(Today)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="schedule-grid">
            {getSelectedDaySchedule().length > 0 ? (
              getSelectedDaySchedule()
                .sort((a, b) => a.startTime.localeCompare(b.startTime)) // Sort by time
                .map((period, index) => (
                <div key={index} className="period-card">
                  <div className="period-time">
                    {period.startTime} - {period.endTime}
                  </div>
                  <div className="period-info">
                    <h4>{period.subject}</h4>
                    <p>Grade {period.grade} - Section {period.section}</p>
                    <span className="room">🏫 {period.room}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-schedule">
                <p>No classes scheduled for {selectedDay}</p>
                {isToday(selectedDay) && <p>Enjoy your free day! 🎉</p>}
              </div>
            )}
          </div>
          
          {/* Show today's summary if different day is selected */}
          {!isToday(selectedDay) && (
            <div className="today-summary">
              <h4>Today's Quick Summary:</h4>
              <p>
                {getCurrentDaySchedule().length > 0
                  ? `${getCurrentDaySchedule().length} classes scheduled today`
                  : 'No classes today'
                }
              </p>
            </div>
          )}
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
              <h3>{leaveRequests.filter(req => req.status === 'approved').length}</h3>
              <p>Approved Leaves</p>
            </div>
          </div>
        </div>
      </div>
    ),

    schedule: (
      <div className="schedule-section">
        <h3>Weekly Schedule</h3>
        <div className="weekly-schedule">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
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
        <div className="section-header">
          <h3>My Students</h3>
          <div className="class-selector">
            <label htmlFor="classSelect">Select Class:</label>
            <select
              id="classSelect"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="class-select"
            >
              <option value="all">All Classes</option>
              {availableClasses.map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="students-display">
          {(() => {
            const filteredStudents = selectedClass === 'all'
              ? students
              : students.filter(student => student.grade === selectedClass);
            
            return filteredStudents.length > 0 ? (
              <>
                <div className="students-summary">
                  <p>
                    Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                    {selectedClass !== 'all' ? ` from Grade ${selectedClass}` : ' from all classes'}
                  </p>
                </div>
                <div className="students-grid">
                  {filteredStudents.map((student, index) => (
                    <div key={index} className="student-card">
                      <div className="student-info">
                        <h4>{student.firstName} {student.lastName}</h4>
                        <p className="student-grade">Grade {student.grade}</p>
                        <p className="student-email">{student.email}</p>
                      </div>
                      <div className="student-actions">
                        <span className="student-status">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>
                  {selectedClass === 'all'
                    ? 'No students assigned to you'
                    : `No students found in Grade ${selectedClass}`
                  }
                </p>
              </div>
            );
          })()}
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