import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { USER_MESSAGES } from '../../config/constants';
import './AuthPage.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, googleAuth } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);
    
    if (result.success) {
      // Redirect based on user role
      const { role, status } = result.user;
      if (status === 'pending') {
        setError(USER_MESSAGES.auth.pendingApproval);
      } else if (status === 'approved') {
        switch (role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'teacher':
            navigate('/teacher/dashboard');
            break;
          case 'student':
            navigate('/student/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        setError(USER_MESSAGES.auth.accountRejected);
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      // This would integrate with Google OAuth
      // For now, showing the structure
      setError('Google authentication will be implemented with Google OAuth setup');
    } catch (error) {
      setError('Google authentication failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your school account</p>
          </div>

          {error && (
            <div className="auth-error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <button 
              type="submit" 
              className="auth-btn primary"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
            <p><Link to="/forgot-password">Forgot your password?</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}