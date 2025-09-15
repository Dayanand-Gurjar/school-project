import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { USER_MESSAGES } from '../../config/constants';
import './AuthPage.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student', // student or teacher
    phone: '',
    grade: '', // for students
    subject: '', // for teachers
    employeeId: '', // for teachers
    qualification: '' // for teachers
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (PNG, JPG, JPEG, GIF)');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setProfilePicture(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any existing error
      setError('');
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
    // Reset file input
    const fileInput = document.getElementById('profilePicture');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.role === 'student' && !formData.grade) {
      setError('Please select your grade');
      setLoading(false);
      return;
    }

    if (formData.role === 'teacher' && (!formData.subject || !formData.employeeId || !formData.qualification)) {
      setError('Please fill in all teacher details including qualification');
      setLoading(false);
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();
    
    // Add all form fields
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    
    // Add profile picture if selected
    if (profilePicture) {
      submitData.append('profilePicture', profilePicture);
    }

    const result = await register(submitData);
    
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const grades = [
    '1st', '2nd', '3rd', '4th',
    '5th', '6th', '7th', '8th'
  ];

  const subjects = [
    'English', 'Mathematics', 'Science', 'Social Studies', 
    'Hindi', 'Computer Science', 'Physical Education', 
    'Art & Craft', 'Music'
  ];

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-success">
              <div className="success-icon">✅</div>
              <h2>Registration Successful!</h2>
              <p>
                {USER_MESSAGES.auth.registrationSuccess}
              </p>
              <Link to="/login" className="auth-btn primary">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Join Our School</h1>
            <p>Create your account and get started</p>
          </div>

          {error && (
            <div className="auth-error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Role Selection */}
            <div className="form-group">
              <label>I am a:</label>
              <div className="role-selector">
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === 'student'}
                    onChange={handleChange}
                  />
                  <span className="role-card">
                    <div className="role-icon">🎓</div>
                    <div className="role-text">Student</div>
                  </span>
                </label>
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="teacher"
                    checked={formData.role === 'teacher'}
                    onChange={handleChange}
                  />
                  <span className="role-card">
                    <div className="role-icon">👩‍🏫</div>
                    <div className="role-text">Teacher</div>
                  </span>
                </label>
              </div>
            </div>

            {/* Personal Information */}
            {/* Profile Picture Upload */}
            <div className="form-group">
              <label htmlFor="profilePicture">Profile Picture (Optional)</label>
              <div className="photo-upload-container">
                {profilePicturePreview ? (
                  <div className="photo-preview">
                    <img src={profilePicturePreview} alt="Profile Preview" />
                    <button
                      type="button"
                      className="remove-photo-btn"
                      onClick={removeProfilePicture}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="photo-upload-placeholder">
                    <div className="upload-icon">📷</div>
                    <p>Click to upload profile picture</p>
                    <small>PNG, JPG, JPEG, GIF (Max 5MB)</small>
                  </div>
                )}
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="photo-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Enter first name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Enter last name"
                />
              </div>
            </div>

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
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
              />
            </div>

            {/* Role-specific fields */}
            {formData.role === 'student' && (
              <div className="form-group">
                <label htmlFor="grade">Grade/Class</label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your grade</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.role === 'teacher' && (
              <>
                <div className="form-group">
                  <label htmlFor="employeeId">Employee ID</label>
                  <input
                    type="text"
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                    placeholder="Enter employee ID"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Primary Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="qualification">Qualification</label>
                  <input
                    type="text"
                    id="qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    required
                    placeholder="Enter your highest qualification (e.g., B.Ed, M.A, M.Sc)"
                  />
                </div>
              </>
            )}

            {/* Password Fields */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Create password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="auth-btn primary"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}