import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { api } from '../../services/api';
import EventForm from '../Events/EventForm';
import ProfileForm from '../Profile/ProfileForm';
import NotificationManager from '../Notifications/NotificationManager';
import GalleryManager from '../Admin/GalleryManager';
import './Dashboard.css';

// Schedule Form Component
const ScheduleForm = ({ schedule, onSave, onCancel, availableGrades, availableSubjects, approvedTeachers }) => {
  const [formData, setFormData] = useState({
    grade: schedule?.grade || '',
    section: schedule?.section || 'A',
    subject: schedule?.subject || '',
    teacher: schedule?.teacher || '',
    teacherId: schedule?.teacher_id || '',
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

  const handleTeacherChange = (e) => {
    const selectedTeacherId = e.target.value;
    const selectedTeacher = approvedTeachers.find(teacher => teacher.id.toString() === selectedTeacherId);
    
    setFormData(prev => ({
      ...prev,
      teacherId: selectedTeacherId,
      teacher: selectedTeacher ? selectedTeacher.name : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.grade || !formData.subject || !formData.teacher || !formData.teacherId || !formData.startTime || !formData.endTime || !formData.room) {
      alert('Please fill in all required fields');
      return;
    }

    // Time validation
    if (formData.startTime >= formData.endTime) {
      alert('End time must be after start time');
      return;
    }

    // Send the data with teacherId included
    const scheduleData = {
      ...formData,
      teacherId: formData.teacherId,
      teacher: formData.teacher
    };
    onSave(scheduleData);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const sections = ['A', 'B', 'C', 'D'];

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
              {availableGrades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
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
              {availableSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="teacher">Teacher *</label>
            <select
              id="teacher"
              name="teacher"
              value={formData.teacherId}
              onChange={handleTeacherChange}
              required
            >
              <option value="">Select Teacher</option>
              {approvedTeachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} {teacher.subject ? `(${teacher.subject})` : ''}
                </option>
              ))}
            </select>
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
              <option value="All Days">All Days (Monday to Saturday)</option>
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
  const {
    getEvents,
    getStudents,
    getTeachers,
    getPendingUsers,
    getAllUsers,
    getSchedules,
    invalidateCache,
    updateCache,
    isLoading
  } = useData();
  
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
  const [scheduleView, setScheduleView] = useState('overview'); // 'overview', 'create'
  const [availableGrades, setAvailableGrades] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [approvedTeachers, setApprovedTeachers] = useState([]);
  const [scheduleViewType, setScheduleViewType] = useState('classwise'); // 'classwise' or 'teacherwise'
  const [selectedDay, setSelectedDay] = useState('Monday'); // For schedule organization day filter
  const [selectedClassForView, setSelectedClassForView] = useState('all'); // For class-wise tab filtering
  const [selectedTeacherForView, setSelectedTeacherForView] = useState('all'); // For teacher-wise tab filtering

  useEffect(() => {
    fetchDashboardData();
    loadScheduleData();
    fetchAvailableData();
  }, []);

  // Fetch available grades, subjects, and approved teachers
  const fetchAvailableData = async () => {
    try {
      // Fetch teachers from teachers table
      const teachersData = await api.getTeachersData();
      setApprovedTeachers(teachersData);

      // Set constant grades (1st through 8th)
      const constantGrades = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
      setAvailableGrades(constantGrades);

      // Get available subjects from teachers table
      const subjects = [...new Set(teachersData.map(teacher => teacher.subject).filter(Boolean))];
      // Add some common subjects if not enough from database
      const commonSubjects = [
        'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
        'History', 'Geography', 'Computer Science', 'Physical Education', 'Art', 'Music'
      ];
      const allSubjects = [...new Set([...subjects, ...commonSubjects])];
      setAvailableSubjects(allSubjects);

      console.log('📚 Available data fetched:', {
        teachers: teachersData.length,
        grades: constantGrades.length,
        subjects: allSubjects.length
      });
    } catch (error) {
      console.error('❌ Error fetching available data:', error);
      
      // Fallback data if API calls fail - same constant grades
      setAvailableGrades(['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']);
      setAvailableSubjects([
        'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
        'History', 'Geography', 'Computer Science', 'Physical Education', 'Art', 'Music'
      ]);
    }
  };

  // Load schedule data from API
  const loadScheduleData = async () => {
    try {
      console.log('📚 Loading schedules from cache...');
      const schedulesData = await getSchedules();
      setSchedules(schedulesData);
      console.log('✅ Schedules loaded:', schedulesData.length);
    } catch (error) {
      console.error('❌ Error loading schedules:', error);
      setSchedules([]);
    }
  };

  // Schedule Management Functions
  const handleCreateSchedule = async (scheduleData) => {
    try {
      if (scheduleData.day === 'All Days') {
        // Create schedule for all days
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const createdSchedules = [];
        
        for (const day of days) {
          const dayScheduleData = { ...scheduleData, day };
          const response = await api.createSchedule(dayScheduleData);
          
          if (response.success) {
            createdSchedules.push(response.data);
          } else {
            console.error(`Failed to create schedule for ${day}:`, response.error);
            alert(`❌ Error creating schedule for ${day}: ${response.error}`);
            return;
          }
        }
        
        setSchedules(prev => [...prev, ...createdSchedules]);
        setShowScheduleForm(false);
        setEditingSchedule(null);
        setScheduleView('overview'); // Redirect to overview
        alert(`✅ Schedule created successfully for all days (${days.length} schedules)!`);
      } else {
        // Create schedule for single day
        const response = await api.createSchedule(scheduleData);
        
        if (response.success) {
          setSchedules(prev => [...prev, response.data]);
          setShowScheduleForm(false);
          setEditingSchedule(null);
          setScheduleView('overview'); // Redirect to overview
          alert('✅ Schedule created successfully!');
        } else {
          alert(`❌ Error creating schedule: ${response.error}`);
        }
      }
    } catch (error) {
      console.error('❌ Error creating schedule:', error);
      alert('❌ Error creating schedule. Please try again.');
    }
  };

  const handleUpdateSchedule = async (scheduleData) => {
    try {
      const response = await api.updateSchedule(editingSchedule.id, scheduleData);
      
      if (response.success) {
        setSchedules(prev => prev.map(schedule =>
          schedule.id === editingSchedule.id ? response.data : schedule
        ));
        setShowScheduleForm(false);
        setEditingSchedule(null);
        setScheduleView('overview'); // Redirect to overview
        alert('✅ Schedule updated successfully!');
      } else {
        alert(`❌ Error updating schedule: ${response.error}`);
      }
    } catch (error) {
      console.error('❌ Error updating schedule:', error);
      alert('❌ Error updating schedule. Please try again.');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await api.deleteSchedule(scheduleId);
      
      if (response.success) {
        setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
        alert('✅ Schedule deleted successfully!');
      } else {
        alert(`❌ Error deleting schedule: ${response.error}`);
      }
    } catch (error) {
      console.error('❌ Error deleting schedule:', error);
      alert('❌ Error deleting schedule. Please try again.');
    }
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setShowScheduleForm(true);
    setScheduleView('create'); // Navigate to the create/edit form view
  };



  // Get schedules organized by class for selected day
  const getSchedulesByClass = (day = selectedDay) => {
    const schedulesByClass = {};
    schedules
      .filter(schedule => schedule.day === day)
      .forEach(schedule => {
        const classKey = `${schedule.grade} - Section ${schedule.section}`;
        if (!schedulesByClass[classKey]) {
          schedulesByClass[classKey] = [];
        }
        schedulesByClass[classKey].push(schedule);
      });
    return schedulesByClass;
  };

  // Get schedules organized by teacher for selected day
  const getSchedulesByTeacher = (day = selectedDay) => {
    const schedulesByTeacher = {};
    schedules
      .filter(schedule => schedule.day === day)
      .forEach(schedule => {
        if (!schedulesByTeacher[schedule.teacher]) {
          schedulesByTeacher[schedule.teacher] = [];
        }
        schedulesByTeacher[schedule.teacher].push(schedule);
      });
    return schedulesByTeacher;
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      console.log('📊 Fetching admin dashboard data from cache...');
      
      const [students, teachers, pending, allUsers, events] = await Promise.all([
        getStudents(),
        getTeachers(),
        getPendingUsers(),
        getAllUsers(),
        getEvents()
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
  }, [getStudents, getTeachers, getPendingUsers, getAllUsers, getEvents]);

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
        
        // Update cache to reflect changes
        updateCache('allUsers', (data) => data.map(user =>
          user.id === userId ? { ...user, status: action === 'approve' ? 'approved' : 'rejected' } : user
        ));
        
        // Invalidate related caches to force refresh
        if (action === 'approve') {
          invalidateCache(['allUsers']);
        }
        
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
            {/* Action Buttons */}
            <div className="schedule-actions">
              <button
                className="btn-primary"
                onClick={() => setScheduleView('create')}
              >
                + Create New Schedule
              </button>
            </div>

            {/* Schedule Organization - Class-wise and Teacher-wise */}
            {schedules.length > 0 && (
              <div className="schedule-organization">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h4 style={{ margin: 0 }}>Schedule Organization</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Select Day:</label>
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="schedule-tabs" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb' }}>
                    <button
                      className={`schedule-tab ${scheduleViewType === 'classwise' ? 'active' : ''}`}
                      onClick={() => setScheduleViewType('classwise')}
                      style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: scheduleViewType === 'classwise' ? '#1e3a8a' : 'transparent',
                        color: scheduleViewType === 'classwise' ? 'white' : '#6b7280',
                        borderRadius: '6px 6px 0 0',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        marginRight: '0.25rem',
                        borderBottom: scheduleViewType === 'classwise' ? '2px solid #1e3a8a' : '2px solid transparent'
                      }}
                    >
                      📚 Class-wise View
                    </button>
                    <button
                      className={`schedule-tab ${scheduleViewType === 'teacherwise' ? 'active' : ''}`}
                      onClick={() => setScheduleViewType('teacherwise')}
                      style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: scheduleViewType === 'teacherwise' ? '#10b981' : 'transparent',
                        color: scheduleViewType === 'teacherwise' ? 'white' : '#6b7280',
                        borderRadius: '6px 6px 0 0',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        borderBottom: scheduleViewType === 'teacherwise' ? '2px solid #10b981' : '2px solid transparent'
                      }}
                    >
                      👨‍🏫 Teacher-wise View
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="schedule-tab-content">
                  {scheduleViewType === 'classwise' ? (
                    <div className="classwise-tab">
                      {/* Class Selector */}
                      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Filter by Class:</label>
                        <select
                          value={selectedClassForView}
                          onChange={(e) => setSelectedClassForView(e.target.value)}
                          style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            background: 'white'
                          }}
                        >
                          <option value="all">All Classes</option>
                          {Object.keys(getSchedulesByClass()).map(className => (
                            <option key={className} value={className}>{className}</option>
                          ))}
                        </select>
                      </div>

                      <div className="schedules-by-class">
                        {(() => {
                          const classSchedules = getSchedulesByClass();
                          const filteredClasses = selectedClassForView === 'all'
                            ? Object.entries(classSchedules)
                            : Object.entries(classSchedules).filter(([className]) => className === selectedClassForView);

                          return filteredClasses.length === 0 ? (
                            <div style={{
                              textAlign: 'center',
                              padding: '2rem',
                              color: '#6b7280',
                              fontStyle: 'italic',
                              background: '#f8fafc',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb'
                            }}>
                              {selectedClassForView === 'all'
                                ? `No classes scheduled for ${selectedDay}`
                                : `No schedules found for ${selectedClassForView} on ${selectedDay}`
                              }
                            </div>
                          ) : (
                            filteredClasses.map(([className, classSchedules]) => (
                              <div key={className} className="class-schedule-group" style={{ marginBottom: '1.5rem' }}>
                                <h5 style={{
                                  background: '#1e3a8a',
                                  color: 'white',
                                  padding: '0.75rem 1rem',
                                  borderRadius: '8px 8px 0 0',
                                  margin: '0',
                                  fontSize: '1rem',
                                  fontWeight: '600'
                                }}>
                                  {className} - {selectedDay} ({classSchedules.length} classes)
                                </h5>
                                <div className="schedule-grid" style={{ marginTop: '0', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '1rem' }}>
                                  {classSchedules.map(schedule => (
                                    <div key={schedule.id} className="schedule-card">
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
                                          className="btn-edit btn-icon"
                                          title="Edit Schedule"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          onClick={() => handleDeleteSchedule(schedule.id)}
                                          className="btn-delete btn-icon"
                                          title="Delete Schedule"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="teacherwise-tab">
                      {/* Teacher Selector */}
                      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Filter by Teacher:</label>
                        <select
                          value={selectedTeacherForView}
                          onChange={(e) => setSelectedTeacherForView(e.target.value)}
                          style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            background: 'white'
                          }}
                        >
                          <option value="all">All Teachers</option>
                          {Object.keys(getSchedulesByTeacher()).map(teacherName => (
                            <option key={teacherName} value={teacherName}>{teacherName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="schedules-by-teacher">
                        {(() => {
                          const teacherSchedules = getSchedulesByTeacher();
                          const filteredTeachers = selectedTeacherForView === 'all'
                            ? Object.entries(teacherSchedules)
                            : Object.entries(teacherSchedules).filter(([teacherName]) => teacherName === selectedTeacherForView);

                          return filteredTeachers.length === 0 ? (
                            <div style={{
                              textAlign: 'center',
                              padding: '2rem',
                              color: '#6b7280',
                              fontStyle: 'italic',
                              background: '#f8fafc',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb'
                            }}>
                              {selectedTeacherForView === 'all'
                                ? `No teachers scheduled for ${selectedDay}`
                                : `No schedules found for ${selectedTeacherForView} on ${selectedDay}`
                              }
                            </div>
                          ) : (
                            filteredTeachers.map(([teacherName, teacherSchedules]) => (
                              <div key={teacherName} className="teacher-schedule-group" style={{ marginBottom: '1.5rem' }}>
                                <h5 style={{
                                  background: '#10b981',
                                  color: 'white',
                                  padding: '0.75rem 1rem',
                                  borderRadius: '8px 8px 0 0',
                                  margin: '0',
                                  fontSize: '1rem',
                                  fontWeight: '600'
                                }}>
                                  👨‍🏫 {teacherName} - {selectedDay} ({teacherSchedules.length} classes)
                                </h5>
                                <div className="schedule-grid" style={{ marginTop: '0', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '1rem' }}>
                                  {teacherSchedules.map(schedule => (
                                    <div key={schedule.id} className="schedule-card">
                                      <div className="schedule-header">
                                        <span className="schedule-grade">{schedule.grade}</span>
                                        <span className="schedule-section">Section {schedule.section}</span>
                                      </div>
                                      <div className="schedule-content">
                                        <h5>{schedule.subject}</h5>
                                        <p className="schedule-time">🕒 {schedule.startTime} - {schedule.endTime}</p>
                                        <p className="schedule-room">🏫 {schedule.room}</p>
                                        <span className="schedule-day">{schedule.day}</span>
                                      </div>
                                      <div className="schedule-actions-small">
                                        <button
                                          onClick={() => handleEditSchedule(schedule)}
                                          className="btn-edit btn-icon"
                                          title="Edit Schedule"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          onClick={() => handleDeleteSchedule(schedule.id)}
                                          className="btn-delete btn-icon"
                                          title="Delete Schedule"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
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
              availableGrades={availableGrades}
              availableSubjects={availableSubjects}
              approvedTeachers={approvedTeachers}
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
                          <span className="user-grade">{user.grade}</span>
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
    ),

    profile: (
      <div className="profile-section">
        <ProfileForm />
      </div>
    ),

    notifications: (
      <div className="notifications-section">
        <NotificationManager />
      </div>
    ),

    gallery: (
      <div className="gallery-section">
        <GalleryManager />
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
        <button
          className={`nav-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('notifications');
            setShowAllUsers(false);
            setShowEventForm(false);
          }}
        >
          📢 Notifications
        </button>
        <button
          className={`nav-tab ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('gallery');
            setShowAllUsers(false);
            setShowEventForm(false);
          }}
        >
          🖼️ Gallery
        </button>
        <button
          className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('profile');
            setShowAllUsers(false);
            setShowEventForm(false);
          }}
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