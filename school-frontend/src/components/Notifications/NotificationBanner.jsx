import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config/constants';
import './NotificationBanner.css';

export default function NotificationBanner() {
  const [notifications, setNotifications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    fetchActiveNotifications();
    const interval = setInterval(fetchActiveNotifications, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (notifications.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % notifications.length);
      }, 5000); // Change notification every 5 seconds
      return () => clearInterval(interval);
    }
  }, [notifications.length]);

  const fetchActiveNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/notifications/active`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setNotifications(data.data);
        setIsVisible(true);
      } else {
        setNotifications([]);
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error fetching active notifications:', error);
      setNotifications([]);
      setIsVisible(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '🎉';
      case 'warning':
        return '🔔';
      case 'error':
        return '🚨';
      case 'info':
      default:
        return '📢';
    }
  };

  const getNotificationAction = (type) => {
    switch (type) {
      case 'success':
        return 'Great news!';
      case 'warning':
        return 'Important notice';
      case 'error':
        return 'Attention required';
      case 'info':
      default:
        return 'Information';
    }
  };

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('Close button clicked'); // Debug log
    setIsVisible(false);
  };

  const handleNotificationClick = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  const currentNotification = notifications[currentIndex];

  return (
    <div className={`notification-banner ${currentNotification.type}`}>
      <div className="notification-banner-content">
        <div className="notification-banner-main-content">
          <div className="notification-banner-icon">
            {getNotificationIcon(currentNotification.type)}
          </div>
          <div className="notification-banner-text">
            <div className="notification-banner-badge">
              {getNotificationAction(currentNotification.type)}
            </div>
            <div className="notification-banner-title">
              {currentNotification.title}
            </div>
            <div className="notification-banner-message">
              {currentNotification.message}
            </div>
          </div>
        </div>
        
        <div className="notification-banner-controls">
          {notifications.length > 1 && (
            <div className="notification-banner-indicators">
              {notifications.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentIndex ? 'active' : ''}`}
                  onClick={(e) => handleNotificationClick(index, e)}
                  aria-label={`View notification ${index + 1}`}
                />
              ))}
            </div>
          )}
          <button
            type="button"
            className="notification-banner-close"
            onClick={handleClose}
            onMouseDown={handleClose}
            onTouchStart={handleClose}
            aria-label="Close notification"
            title="Dismiss notification"
          >
            ×
          </button>
        </div>
      </div>
      
      {/* Progress bar for auto-rotation */}
      {notifications.length > 1 && (
        <div className="notification-progress-bar">
          <div className="progress-fill"></div>
        </div>
      )}
    </div>
  );
}