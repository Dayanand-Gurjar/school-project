import { API_BASE } from "../config/constants";

export async function fetchEvents() {
  const res = await fetch(`${API_BASE}/api/events`);
  if (!res.ok) throw new Error("Failed to fetch events");
  const data = await res.json();
  return data.data;
}

export async function createEvent(event, adminSecret) {
  const formData = new FormData();
  formData.append('title', event.title);
  formData.append('description', event.description);
  formData.append('event_date', event.event_date);
  
  // Handle multiple images
  if (event.images && event.images.length > 0) {
    event.images.forEach((image) => {
      formData.append('images', image);
    });
  }
  // Backward compatibility for single image
  else if (event.image) {
    formData.append('images', event.image);
  }

  const res = await fetch(`${API_BASE}/api/events`, {
    method: "POST",
    headers: {
      "x-admin-secret": adminSecret // temporary dev auth
    },
    body: formData
  });
  const data = await res.json();
  return data;
}

export async function updateEvent(id, event, adminSecret) {
  const formData = new FormData();
  formData.append('title', event.title);
  formData.append('description', event.description);
  formData.append('event_date', event.event_date);
  
  // Handle multiple images
  if (event.images && event.images.length > 0) {
    event.images.forEach((image) => {
      formData.append('images', image);
    });
  }
  // Backward compatibility
  else if (event.image) {
    formData.append('images', event.image);
  }
  
  // Include existing image URLs if no new images
  if (event.image_urls && (!event.images || event.images.length === 0)) {
    formData.append('image_urls', JSON.stringify(event.image_urls));
  }
  if (event.image_url && (!event.images || event.images.length === 0)) {
    formData.append('image_url', event.image_url);
  }

  const res = await fetch(`${API_BASE}/api/events/${id}`, {
    method: "PUT",
    headers: {
      "x-admin-secret": adminSecret // temporary dev auth
    },
    body: formData
  });
  const data = await res.json();
  return data;
}

// Export api object for compatibility with existing imports
export const api = {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  // Real authentication functions connecting to backend
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  },
  register: async (userData) => {
    try {
      const headers = {};
      let body;
      
      // Check if userData is FormData (for file uploads) or regular object
      if (userData instanceof FormData) {
        // Don't set Content-Type for FormData - browser will set it automatically with boundary
        body = userData;
      } else {
        // Regular JSON data
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(userData);
      }

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers,
        body
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  },
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.success ? data.user : null;
    } catch (error) {
      return null;
    }
  },
  getStudents: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.success ? data.data.filter(user => user.role === 'student') : [];
    } catch (error) {
      return [];
    }
  },
  getTeachers: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.success ? data.data.filter(user => user.role === 'teacher') : [];
    } catch (error) {
      return [];
    }
  },
  getPendingUsers: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.success ? data.data.filter(user => user.status === 'pending') : [];
    } catch (error) {
      return [];
    }
  },
  approveUser: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/auth/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },
  rejectUser: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/auth/users/${userId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },
  getAllUsers: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      return [];
    }
  },
  updateUser: async (userId, userData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },
  deleteUser: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },
  // Add endpoints for fetching from students and teachers tables
  getStudentsData: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      return [];
    }
  },
  getTeachersData: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/teachers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      return [];
    }
  },
  
  // Teacher-specific endpoints
  getTeacherSchedule: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/teacher/schedule`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching teacher schedule:', error);
      return [];
    }
  },
  
  getTeacherLeaveRequests: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/teacher/leave-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching teacher leave requests:', error);
      return [];
    }
  },
  
  submitTeacherLeaveRequest: async (leaveData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/teacher/leave-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(leaveData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting leave request:', error);
      return { success: false, error: 'Network error' };
    }
  },
  
  getTeacherStudents: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/teacher/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching teacher students:', error);
      return [];
    }
  },

  // Admin Schedule Management endpoints
  createSchedule: async (scheduleData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scheduleData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      return { success: false, error: 'Network error' };
    }
  },

  getSchedules: async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.grade) queryParams.append('grade', filters.grade);
      if (filters.day) queryParams.append('day', filters.day);
      if (filters.teacher) queryParams.append('teacher', filters.teacher);
      
      const url = `${API_BASE}/api/admin/schedules${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return [];
    }
  },

  updateSchedule: async (scheduleId, scheduleData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/schedules/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scheduleData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      return { success: false, error: 'Network error' };
    }
  },

  deleteSchedule: async (scheduleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      return { success: false, error: 'Network error' };
    }
  },

  getScheduleStats: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/schedules/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.success ? data.data : {
        totalSchedules: 0,
        totalGrades: 0,
        totalSubjects: 0,
        totalTeachersAssigned: 0
      };
    } catch (error) {
      console.error('Error fetching schedule stats:', error);
      return {
        totalSchedules: 0,
        totalGrades: 0,
        totalSubjects: 0,
        totalTeachersAssigned: 0
      };
    }
  }
};

export async function deleteEvent(id, adminSecret) {
  const res = await fetch(`${API_BASE}/api/events/${id}`, {
    method: "DELETE",
    headers: {
      "x-admin-secret": adminSecret // temporary dev auth
    }
  });
  const data = await res.json();
  return data;
}
