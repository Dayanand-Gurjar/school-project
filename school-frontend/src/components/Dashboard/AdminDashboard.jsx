import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api, fetchEvents } from '../../services/api';
import EventForm from '../Events/EventForm';
import './Dashboard.css';

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
        <h3>Class Schedule Management</h3>
        <p>Manage class schedules and periods for all grades</p>
        <button className="btn-primary">Create New Schedule</button>
        {/* This will be expanded with schedule management components */}
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