import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { USER_MESSAGES } from '../../config/constants';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.status === 'pending') {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="pending-approval">
              <div className="pending-icon">⏳</div>
              <h2>Account Pending Approval</h2>
              <p>
                {USER_MESSAGES.auth.awaitingApproval}
              </p>
              <button onClick={() => window.location.href = '/logout'} className="auth-btn primary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.status === 'rejected') {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="rejected-account">
              <div className="rejected-icon">❌</div>
              <h2>Account Rejected</h2>
              <p>
                {USER_MESSAGES.auth.rejectedInfo}
              </p>
              <button onClick={() => window.location.href = '/logout'} className="auth-btn primary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="access-denied">
              <div className="denied-icon">🚫</div>
              <h2>Access Denied</h2>
              <p>You don't have permission to access this page.</p>
              <button onClick={() => window.history.back()} className="auth-btn primary">
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}