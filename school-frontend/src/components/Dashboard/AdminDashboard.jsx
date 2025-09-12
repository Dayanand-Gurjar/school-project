import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api, fetchEvents } from '../../services/api';
import EventForm from '../Events/EventForm';
import './Dashboard.css';

// Schedule Form Component
const ScheduleForm = ({ schedule, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    grade: schedule?.grade || '',
    section: schedule?.section || 'A',
    subject: schedule?.subject || '',
    teacher: schedule?.teacher || '',
    day: schedule?.day || 'Monday',
    startTime: schedule?.startTime || '',
    endTime: schedule?.endTime || '',
    room: schedule?.room || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.grade || !formData.subject || !formData.teacher || !formData.startTime || !formData.endTime || !formData.room) {
      alert('Please fill in all required fields');
      return;
    }

    // Time validation
    if (formData.startTime >= formData.endTime) {
      alert('End time must be after start time');
      return;
    }

    onSave(formData);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const grades = ['9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];
  const subjects = [
    'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Computer Science', 'Physical Education', 'Art', 'Music'
  ];

  return (
    <form onSubmit={handleSubmit} className="schedule-form">
      <div className="form-grid">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="grade">Grade *</label>
            <select
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Grade</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="section">Section *</label>
            <select
              id="section"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              required
            >
              {sections.map(section => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="teacher">Teacher *</label>
            <input
              type="text"
              id="teacher"
              name="teacher"
              value={formData.teacher}
              onChange={handleInputChange}
              placeholder="Enter teacher name"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="day">Day *</label>
            <select
              id="day"
              name="day"
              value={formData.day}
              onChange={handleInputChange}
              required
            >
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="room">Room *</label>
            <input
              type="text"
              id="room"
              name="room"
              value={formData.room}
              onChange={handleInputChange}
              placeholder="e.g. Room 101, Lab 301"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startTime">Start Time *</label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="endTime">End Time *</label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {schedule ? 'Update Schedule' : 'Create Schedule'}
        </button>
      </div>
    </form>
  );
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    pendingApprovals: 0,
    totalEvents: 0
  });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showAllEvents, setShowAllEvents] = useState(false);

  // Schedule Management State
  const [schedules, setSchedules] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [scheduleView, setScheduleView] = useState('overview'); // 'overview', 'create', 'list'

  useEffect(() => {
    fetchDashboardData();
    loadScheduleData();
  }, []);

  // Sample schedule data - replace with API calls later
  const loadScheduleData = () => {
    const sampleSchedules = [
      {
        id: 1,
        grade: '9',
        day: 'Monday',
        startTime: '09:00',
        endTime: '09:45',
        subject: 'Mathematics',
        teacher: 'Dr. Sarah Johnson',
        room: 'Room 101',
        section: 'A'
      },
      {
        id: 2,
        grade: '9',
        day: 'Monday',
        startTime: '09:45',
        endTime: '10:30',
        subject: 'English',
        teacher: 'Prof. Michael Brown',
        room: 'Room 205',
        section: 'A'
      },
      {
        id: 3,
        grade: '10',
        day: 'Monday',
        startTime: '09:00',
        endTime: '09:45',
        subject: 'Physics',
        teacher: 'Dr. Emily Davis',
        room: 'Lab 301',
        section: 'B'
      },
      {
        id: 4,
        grade: '9',
        day: 'Tuesday',
        startTime: '09:00',
        endTime: '09:45',
        subject: 'Science',
        teacher: 'Dr. Robert Wilson',
        room: 'Lab 201',
        section: 'A'
      }
    ];
    setSchedules(sampleSchedules);
  };

  // Schedule Management Functions
  const handleCreateSchedule = (scheduleData) => {
    const newSchedule = {
      id: schedules.length + 1,
      ...scheduleData
    };
    setSchedules(prev => [...prev, newSchedule]);
    setShowScheduleForm(false);
    setEditingSchedule(null);
    alert('✅ Schedule created successfully!');
  };

  const handleUpdateSchedule = (scheduleData) => {
    setSchedules(prev => prev.map(schedule =>
      schedule.id === editingSchedule.id ? { ...schedule, ...scheduleData } : schedule
    ));
    setShowScheduleForm(false);
    setEditingSchedule(null);
    alert('✅ Schedule updated successfully!');
  };

  const handleDeleteSchedule = (scheduleId) => {
    if (!confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
      return;
    }
    setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
    alert('✅ Schedule deleted successfully!');
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setShowScheduleForm(true);
  };

  const getFilteredSchedules = () => {
    if (selectedGrade === 'all') return schedules;
    return schedules.filter(schedule => schedule.grade === selectedGrade);
  };

  const getScheduleStats = () => {
    const grades = [...new Set(schedules.map(s => s.grade))];
    const subjects = [...new Set(schedules.map(s => s.subject))];
    const teachers = [...new Set(schedules.map(s => s.teacher))];
    
    return {
      totalSchedules: schedules.length,
      totalGrades: grades.length,
      totalSubjects: subjects.length,
      totalTeachersAssigned: teachers.length
    };
  };

  const fetchDashboardData = async () => {
    try {
      console.log('📊 Fetching admin dashboard data...');
      
      const [students, teachers, pending, allUsers, events] = await Promise.all([
        api.getStudents(),
        api.getTeachers(),
        api.getPendingUsers(),
        api.getAllUsers(),
        fetchEvents()
      ]);

      console.log('📈 Dashboard data received:', {
        students: students.length,
        teachers: teachers.length,
        pending: pending.length,
        allUsers: allUsers.length,
        events: events.length
      });

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        pendingApprovals: pending.length,
        totalEvents: events.length
      });

      setPendingUsers(pending);
      setAllUsers(allUsers);
      setEvents(events);
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserApproval = async (userId, action) => {
    try {
      console.log(`🔄 ${action === 'approve' ? 'Approving' : 'Rejecting'} user ${userId}`);
      
      const response = action === 'approve'
        ? await api.approveUser(userId)
        : await api.rejectUser(userId);

      console.log(`📝 ${action} response:`, response);

      if (response.success) {
        // Find the user being processed
        const user = pendingUsers.find(u => u.id === userId);
        
        // Remove from pending users
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        
        // Update stats
        if (action === 'approve' && user) {
          setStats(prev => ({
            ...prev,
            pendingApprovals: prev.pendingApprovals - 1,
            totalStudents: prev.totalStudents + (user.role === 'student' ? 1 : 0),
            totalTeachers: prev.totalTeachers + (user.role === 'teacher' ? 1 : 0)
          }));
          alert(`✅ ${user.firstName} ${user.lastName} has been approved!`);
        } else if (action === 'reject' && user) {
          setStats(prev => ({
            ...prev,
            pendingApprovals: prev.pendingApprovals - 1
          }));
          alert(`❌ ${user.firstName} ${user.lastName} has been rejected.`);
        }
      } else {
        alert(`Error: ${response.error || 'Failed to process request'}`);
      }
    } catch (error) {
      console.error('❌ Error handling user approval:', error);
      alert('Error processing user approval. Please try again.');
    }
  };

  const handleEventCreated = (newEvent) => {
    setEvents(prev => [newEvent, ...prev]);
    setStats(prev => ({
      ...prev,
      totalEvents: prev.totalEvents + 1
    }));
    setShowEventForm(false);
    setEditingEvent(null);
    alert('✅ Event created successfully!');
  };

  const handleEventUpdated = (updatedEvent) => {
    setEvents(prev => prev.map(event =>
      event.id === updatedEvent.id ? updatedEvent : event
    ));
    setShowEventForm(false);
    setEditingEvent(null);
    alert('✅ Event updated successfully!');
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const adminSecret = 'dev-secret';
      const response = await api.deleteEvent(eventId, adminSecret);
      
      if (response.success) {
        setEvents(prev => prev.filter(event => event.id !== eventId));
        setStats(prev => ({
          ...prev,
          totalEvents: prev.totalEvents - 1
        }));
        alert('✅ Event deleted successfully!');
      } else {
        alert('❌ Failed to delete event: ' + response.error);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('❌ Error deleting event. Please try again.');
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const tabContent = {
    overview: (
      <div className="dashboard-overview">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👨‍🎓</div>
            <div className="stat-content">
              <h3>{stats.totalStudents}</h3>
              <p>Total Students</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👩‍🏫</div>
            <div className="stat-content">
              <h3>{stats.totalTeachers}</h3>
              <p>Total Teachers</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{stats.pendingApprovals}</h3>
              <p>Pending Approvals</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{stats.totalEvents}</h3>
              <p>School Events</p>
            </div>
          </div>
        </div>

        {stats.pendingApprovals > 0 && (
          <div className="pending-approvals">
            <h3>Pending User Approvals</h3>
            <div className="approval-list">
              {pendingUsers.slice(0, 3).map(user => (
                <div key={user.id} className="approval-item">
                  <div className="user-info">
                    <h4>{user.firstName} {user.lastName}</h4>
                    <p>{user.email}</p>
                    <span className="user-role">{user.role}</span>
                  </div>
                  <div className="approval-actions">
                    <button 
                      onClick={() => handleUserApproval(user.id, 'approve')}
                      className="btn-approve"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleUserApproval(user.id, 'reject')}
                      className="btn-reject"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {pendingUsers.length > 3 && (
              <button 
                onClick={() => setActiveTab('approvals')}
                className="view-all-btn"
              >
                View All ({pendingUsers.length - 3} more)
              </button>
            )}
          </div>
        )}
      </div>
    ),

    approvals: (
      <div className="approvals-section">
        <h3>User Approvals</h3>
        {pendingUsers.length === 0 ? (
          <div className="empty-state">
            <p>No pending approvals</p>
          </div>
        ) : (
          <div className="approval-list">
            {pendingUsers.map(user => (
              <div key={user.id} className="approval-card">
                <div className="user-details">
                  <h4>{user.firstName} {user.lastName}</h4>
                  <p className="user-email">{user.email}</p>
                  <p className="user-phone">{user.phone}</p>
                  <div className="user-meta">
                    <span className={`user-role ${user.role}`}>{user.role}</span>
                    {user.role === 'student' && user.grade && (
                      <span className="user-grade">{user.grade}</span>
                    )}
                    {user.role === 'teacher' && user.subject && (
                      <span className="user-subject">{user.subject}</span>
                    )}
                  </div>
                </div>
                <div className="approval-actions">
                  <button 
                    onClick={() => handleUserApproval(user.id, 'approve')}
                    className="btn-approve"
                  >
                    ✓ Approve
                  </button>
                  <button 
                    onClick={() => handleUserApproval(user.id, 'reject')}
                    className="btn-reject"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),

    schedule: (
      <div className="schedule-section">
        <div className="section-header">
          <h3>Class Schedule Management</h3>
          <p>Create and manage class schedules for all grades and subjects</p>
        </div>

        {scheduleView === 'overview' && (
          <div className="schedule-overview">
            {/* Schedule Stats */}
            <div className="schedule-stats">
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-content">
                  <h3>{getScheduleStats().totalSchedules}</h3>
                  <p>Total Classes</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎓</div>
                <div className="stat-content">
                  <h3>{getScheduleStats().totalGrades}</h3>
                  <p>Grades</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📖</div>
                <div className="stat-content">
                  <h3>{getScheduleStats().totalSubjects}</h3>
                  <p>Subjects</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👨‍🏫</div>
                <div className="stat-content">
                  <h3>{getScheduleStats().totalTeachersAssigned}</h3>
                  <p>Teachers Assigned</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="schedule-actions">
              <button
                className="btn-primary"
                onClick={() => setScheduleView('create')}
              >
                + Create New Schedule
              </button>
              <button
                className="btn-secondary"
                onClick={() => setScheduleView('list')}
              >
                View All Schedules
              </button>
            </div>

            {/* Recent Schedules Preview */}
            {schedules.length > 0 && (
              <div className="recent-schedules">
                <h4>Recent Schedules ({schedules.slice(0, 6).length} of {schedules.length})</h4>
                <div className="schedule-grid">
                  {schedules.slice(0, 6).map(schedule => (
                    <div key={schedule.id} className="schedule-card">
                      <div className="schedule-header">
                        <span className="schedule-grade">Grade {schedule.grade}</span>
                        <span className="schedule-section">Section {schedule.section}</span>
                      </div>
                      <div className="schedule-content">
                        <h5>{schedule.subject}</h5>
                        <p className="schedule-teacher">👨‍🏫 {schedule.teacher}</p>
                        <p className="schedule-time">🕒 {schedule.startTime} - {schedule.endTime}</p>
                        <p className="schedule-room">🏫 {schedule.room}</p>
                        <span className="schedule-day">{schedule.day}</span>
                      </div>
                      <div className="schedule-actions-small">
                        <button
                          onClick={() => handleEditSchedule(schedule)}
                          className="btn-edit btn-small"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="btn-delete btn-small"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {scheduleView === 'list' && (
          <div className="schedule-list-view">
            <div className="schedule-header-controls">
              <button
                className="btn-secondary"
                onClick={() => setScheduleView('overview')}
              >
                ← Back to Overview
              </button>
              <div className="schedule-filters">
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="grade-filter"
                >
                  <option value="all">All Grades</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>
              </div>
              <button
                className="btn-primary"
                onClick={() => setScheduleView('create')}
              >
                + Add Schedule
              </button>
            </div>

            {getFilteredSchedules().length === 0 ? (
              <div className="empty-state">
                <p>No schedules found for the selected criteria</p>
              </div>
            ) : (
              <div className="schedule-table">
                <div className="schedule-table-header">
                  <div>Grade</div>
                  <div>Subject</div>
                  <div>Teacher</div>
                  <div>Day</div>
                  <div>Time</div>
                  <div>Room</div>
                  <div>Actions</div>
                </div>
                {getFilteredSchedules().map(schedule => (
                  <div key={schedule.id} className="schedule-table-row">
                    <div className="grade-cell">
                      <span className="grade-badge">Grade {schedule.grade}</span>
                      <span className="section-badge">Sec {schedule.section}</span>
                    </div>
                    <div className="subject-cell">{schedule.subject}</div>
                    <div className="teacher-cell">{schedule.teacher}</div>
                    <div className="day-cell">{schedule.day}</div>
                    <div className="time-cell">{schedule.startTime} - {schedule.endTime}</div>
                    <div className="room-cell">{schedule.room}</div>
                    <div className="actions-cell">
                      <button
                        onClick={() => handleEditSchedule(schedule)}
                        className="btn-edit btn-small"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="btn-delete btn-small"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {scheduleView === 'create' && (
          <div className="schedule-form-container">
            <div className="form-header">
              <button
                className="btn-secondary"
                onClick={() => {
                  setScheduleView('overview');
                  setEditingSchedule(null);
                }}
              >
                ← Back to Overview
              </button>
              <h4>{editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}</h4>
            </div>
            
            <ScheduleForm
              schedule={editingSchedule}
              onSave={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}
              onCancel={() => {
                setScheduleView('overview');
                setEditingSchedule(null);
              }}
            />
          </div>
        )}
      </div>
    ),

    users: (
      <div className="users-section">
        <div className="section-header">
          <h3>User Management</h3>
          <p>Manage all students and teachers in the system</p>
        </div>
        
        {!showAllUsers ? (
          <div className="users-preview">
            <div className="stats-summary">
              <div className="stat-card">
                <div className="stat-icon">👨‍🎓</div>
                <div className="stat-content">
                  <h3>{stats.totalStudents}</h3>
                  <p>Students</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👩‍🏫</div>
                <div className="stat-content">
                  <h3>{stats.totalTeachers}</h3>
                  <p>Teachers</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>{allUsers.length}</h3>
                  <p>Total Users</p>
                </div>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={() => setShowAllUsers(true)}
            >
              View All Users
            </button>
          </div>
        ) : (
          <div className="all-users">
            <div className="users-header">
              <button
                className="btn-secondary"
                onClick={() => setShowAllUsers(false)}
              >
                ← Back to Summary
              </button>
              <h4>All Users ({allUsers.length})</h4>
            </div>
            
            {allUsers.length === 0 ? (
              <div className="empty-state">
                <p>No users found</p>
              </div>
            ) : (
              <div className="users-grid">
                {allUsers.map(user => (
                  <div key={user.id} className="user-card">
                    <div className="user-info">
                      <h4>{user.firstName} {user.lastName}</h4>
                      <p className="user-email">{user.email}</p>
                      <p className="user-phone">{user.phone}</p>
                      <div className="user-meta">
                        <span className={`user-role ${user.role}`}>{user.role}</span>
                        <span className={`user-status ${user.status}`}>{user.status}</span>
                        {user.role === 'student' && user.grade && (
                          <span className="user-grade">Grade {user.grade}</span>
                        )}
                        {user.role === 'teacher' && user.subject && (
                          <span className="user-subject">{user.subject}</span>
                        )}
                      </div>
                    </div>
                    <div className="user-actions">
                      {user.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUserApproval(user.id, 'approve')}
                            className="btn-approve btn-small"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleUserApproval(user.id, 'reject')}
                            className="btn-reject btn-small"
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      {user.status === 'approved' && (
                        <span className="status-badge approved">Active</span>
                      )}
                      {user.status === 'rejected' && (
                        <span className="status-badge rejected">Rejected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    ),

    events: (
      <div className="events-section">
        <div className="section-header">
          <h3>Event Management</h3>
          <p>Create and manage school events</p>
        </div>
        
        {!showEventForm && !showAllEvents ? (
          <div className="events-overview">
            <div className="events-stats">
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <h3>{stats.totalEvents}</h3>
                  <p>Total Events</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎉</div>
                <div className="stat-content">
                  <h3>{events.filter(e => new Date(e.event_date) > new Date()).length}</h3>
                  <p>Upcoming Events</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📆</div>
                <div className="stat-content">
                  <h3>{events.filter(e => new Date(e.event_date) < new Date()).length}</h3>
                  <p>Past Events</p>
                </div>
              </div>
            </div>
            
            <div className="events-actions">
              <button
                className="btn-primary"
                onClick={() => setShowEventForm(true)}
              >
                + Create New Event
              </button>
              {events.length > 0 && (
                <button
                  className="btn-secondary"
                  onClick={() => setShowAllEvents(true)}
                >
                  View All Events
                </button>
              )}
            </div>

            {events.length > 0 && (
              <div className="recent-events">
                <h4>Recent Events ({events.slice(0, 3).length} of {events.length})</h4>
                <div className="events-list">
                  {events.slice(0, 3).map(event => (
                    <div key={event.id} className="event-card recent-event-card">
                      <div className="event-image-preview">
                        {event.image_urls && event.image_urls.length > 0 ? (
                          <img src={event.image_urls[0]} alt={event.title} />
                        ) : (
                          <div className="no-image-preview">📅</div>
                        )}
                      </div>
                      <div className="event-date">
                        {new Date(event.event_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="event-info">
                        <h4>{event.title}</h4>
                        <p>{event.description.substring(0, 100)}...</p>
                        <div className="event-meta">
                          <span className={`event-status ${new Date(event.event_date) > new Date() ? 'upcoming' : 'past'}`}>
                            {new Date(event.event_date) > new Date() ? 'Upcoming' : 'Past'}
                          </span>
                        </div>
                      </div>
                      <div className="event-actions">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="btn-edit btn-small"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="btn-delete btn-small"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : showAllEvents ? (
          <div className="all-events">
            <div className="events-header">
              <button
                className="btn-secondary"
                onClick={() => setShowAllEvents(false)}
              >
                ← Back to Overview
              </button>
              <h4>All Events ({events.length})</h4>
              <button
                className="btn-primary"
                onClick={() => {
                  setShowAllEvents(false);
                  setShowEventForm(true);
                }}
              >
                + Create New Event
              </button>
            </div>
            
            {events.length === 0 ? (
              <div className="empty-state">
                <p>No events found</p>
              </div>
            ) : (
              <div className="events-grid">
                {events.map(event => (
                  <div key={event.id} className="event-management-card">
                    <div className="event-image">
                      {event.image_urls && event.image_urls.length > 0 ? (
                        <img src={event.image_urls[0]} alt={event.title} />
                      ) : (
                        <div className="no-image">📅</div>
                      )}
                    </div>
                    <div className="event-content">
                      <h4>{event.title}</h4>
                      <p className="event-description">{event.description.substring(0, 150)}...</p>
                      <div className="event-details">
                        <span className="event-date-full">
                          📅 {new Date(event.event_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span className={`event-status ${new Date(event.event_date) > new Date() ? 'upcoming' : 'past'}`}>
                          {new Date(event.event_date) > new Date() ? 'Upcoming' : 'Past'}
                        </span>
                      </div>
                    </div>
                    <div className="event-actions">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="btn-edit"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="btn-delete"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="event-form-container">
            <div className="form-header">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowEventForm(false);
                  setEditingEvent(null);
                }}
              >
                ← Back to Events
              </button>
              <h4>{editingEvent ? 'Edit Event' : 'Create New Event'}</h4>
            </div>
            <EventForm
              event={editingEvent}
              onEventCreated={editingEvent ? handleEventUpdated : handleEventCreated}
            />
          </div>
        )}
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
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.firstName}! Here's what's happening at school.</p>
      </div>

      <div className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('overview');
            setShowAllUsers(false);
            setShowEventForm(false);
          }}
        >
          📊 Overview
        </button>
        <button
          className={`nav-tab ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('approvals');
            setShowAllUsers(false);
            setShowEventForm(false);
          }}
        >
          ⏳ Approvals {stats.pendingApprovals > 0 && (
            <span className="notification-badge">{stats.pendingApprovals}</span>
          )}
        </button>
        <button
          className={`nav-tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('schedule');
            setShowAllUsers(false);
            setShowEventForm(false);
          }}
        >
          📅 Schedule
        </button>
        <button
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('users');
            setShowAllUsers(false);
            setShowEventForm(false);
          }}
        >
          👥 Users
        </button>
        <button
          className={`nav-tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('events');
            setShowAllUsers(false);
            setShowEventForm(false);
          }}
        >
          🎉 Events
        </button>
      </div>

      <div className="dashboard-content">
        {tabContent[activeTab]}
      </div>
    </div>
  );
}