import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../config/constants';
import './ProfileForm.css';

export default function ProfileForm() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    profile_picture: null
  });
  const [currentProfilePicture, setCurrentProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.firstName || '',
        last_name: user.lastName || '', 
        email: user.email || '',
        phone: user.phone || '',
        profile_picture: null
      });
      setCurrentProfilePicture(user.profile_picture_url);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        profile_picture: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('phone', formData.phone);
      
      if (formData.profile_picture) {
        formDataToSend.append('profile_picture', formData.profile_picture);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        // Update user context
        updateUser(data.user);
        setCurrentProfilePicture(data.user.profile_picture_url);
        setPreviewImage(null);
        setFormData(prev => ({
          ...prev,
          profile_picture: null
        }));
        setSuccess(true);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert(`Error updating profile: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-form-container">
      <div className="profile-header">
        <h3>Edit Profile</h3>
        <p>Update your personal information and profile picture</p>
      </div>

      {success && (
        <div className="success-message">
          ✅ Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Profile Picture Section */}
        <div className="profile-picture-section">
          <div className="current-picture">
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="profile-preview" />
            ) : currentProfilePicture ? (
              <img 
                src={`${API_BASE}${currentProfilePicture}`} 
                alt="Current profile" 
                className="profile-preview"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {!previewImage && !currentProfilePicture && (
              <div className="profile-placeholder">
                👤
              </div>
            )}
            {!previewImage && currentProfilePicture && (
              <div className="profile-placeholder" style={{ display: 'none' }}>
                👤
              </div>
            )}
          </div>
          
          <div className="picture-upload">
            <label htmlFor="profile_picture" className="upload-btn">
              📷 {currentProfilePicture ? 'Change Picture' : 'Upload Picture'}
            </label>
            <input
              type="file"
              id="profile_picture"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <p className="upload-help">Max size: 5MB. Formats: JPG, PNG, GIF</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="form-section">
          <h4>Personal Information</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
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
              readOnly
              className="readonly-field"
              title="Email cannot be changed"
            />
            <small>Email address cannot be changed</small>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {/* Role-specific Information Display */}
        <div className="form-section">
          <h4>Account Information</h4>
          <div className="info-display">
            <div className="info-item">
              <label>Role:</label>
              <span className={`role-badge ${user?.role}`}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`status-badge ${user?.status}`}>
                {user?.status?.charAt(0).toUpperCase() + user?.status?.slice(1)}
              </span>
            </div>
            {user?.role === 'student' && user?.grade && (
              <div className="info-item">
                <label>Grade:</label>
                <span className="grade-info">Grade {user.grade}</span>
              </div>
            )}
            {user?.role === 'teacher' && user?.subject && (
              <div className="info-item">
                <label>Subject:</label>
                <span className="subject-info">{user.subject}</span>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}