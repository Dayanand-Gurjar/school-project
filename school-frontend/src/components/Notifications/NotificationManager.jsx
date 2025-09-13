import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config/constants';
import './NotificationManager.css';

export default function NotificationManager() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    end_date: '',
    is_active: true
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      } else {
        console.error('Failed to fetch notifications:', data.error);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingNotification 
        ? `${API_BASE}/api/notifications/${editingNotification.id}`
        : `${API_BASE}/api/notifications`;
      
      const method = editingNotification ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        await fetchNotifications();
        resetForm();
        alert(`Notification ${editingNotification ? 'updated' : 'created'} successfully!`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving notification:', error);
      alert('Failed to save notification');
    }
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      end_date: new Date(notification.end_date).toISOString().slice(0, 16),
      is_active: notification.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        await fetchNotifications();
        alert('Notification deleted successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Failed to delete notification');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      end_date: '',
      is_active: true
    });
    setEditingNotification(null);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="notification-manager">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-manager">
      <div className="notification-header">
        <h2>📢 Manage Notifications</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Notification'}
        </button>
      </div>

      {showForm && (
        <div className="notification-form-container">
          <form onSubmit={handleSubmit} className="notification-form">
            <h3>{editingNotification ? 'Edit Notification' : 'Create New Notification'}</h3>
            
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter notification title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows="4"
                placeholder="Enter notification message"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="end_date">End Date *</label>
                <input
                  type="datetime-local"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                <span>Active</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingNotification ? 'Update' : 'Create'} Notification
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <p>No notifications found. Create your first notification!</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className={`notification-card ${notification.type}`}>
              <div className="notification-content">
                <div className="notification-meta">
                  <span className={`type-badge ${notification.type}`}>
                    {notification.type.toUpperCase()}
                  </span>
                  <span className={`status-badge ${notification.is_active ? 'active' : 'inactive'}`}>
                    {notification.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                
                <div className="notification-dates">
                  <small>
                    <strong>Created:</strong> {formatDate(notification.created_at)} | 
                    <strong> Expires:</strong> {formatDate(notification.end_date)}
                  </small>
                  {notification.users && (
                    <small>
                      <strong> By:</strong> {notification.users.first_name} {notification.users.last_name}
                    </small>
                  )}
                </div>
              </div>

              <div className="notification-actions">
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => handleEdit(notification)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(notification.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}