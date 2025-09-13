import React, { createContext, useContext, useState, useCallback } from 'react';
import { api, fetchEvents } from '../services/api';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Cache states
  const [cache, setCache] = useState({
    events: { data: null, loading: false, lastFetched: null },
    allUsers: { data: null, loading: false, lastFetched: null },
    schedules: { data: null, loading: false, lastFetched: null },
    galleryStats: { data: null, loading: false, lastFetched: null },
    galleryCategories: { data: null, loading: false, lastFetched: null },
    galleryImages: { data: null, loading: false, lastFetched: null },
    infrastructureStats: { data: null, loading: false, lastFetched: null }
  });

  // Cache expiry time (5 minutes)
  const CACHE_EXPIRY = 5 * 60 * 1000;

  const isCacheValid = (lastFetched) => {
    return lastFetched && (Date.now() - lastFetched) < CACHE_EXPIRY;
  };

  // Generic fetch function with caching
  const fetchWithCache = useCallback(async (key, fetchFn) => {
    const cacheEntry = cache[key];
    
    // Return cached data if valid and not loading
    if (cacheEntry.data && isCacheValid(cacheEntry.lastFetched) && !cacheEntry.loading) {
      return cacheEntry.data;
    }

    // Prevent duplicate requests
    if (cacheEntry.loading) {
      return new Promise((resolve) => {
        const checkLoading = () => {
          const currentCache = cache[key];
          if (!currentCache.loading) {
            resolve(currentCache.data);
          } else {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      });
    }

    // Set loading state
    setCache(prev => ({
      ...prev,
      [key]: { ...prev[key], loading: true }
    }));

    try {
      const data = await fetchFn();
      setCache(prev => ({
        ...prev,
        [key]: {
          data,
          loading: false,
          lastFetched: Date.now()
        }
      }));
      return data;
    } catch (error) {
      setCache(prev => ({
        ...prev,
        [key]: { ...prev[key], loading: false }
      }));
      throw error;
    }
  }, [cache]);

  // Specific data fetchers
  const getEvents = useCallback(() => {
    return fetchWithCache('events', fetchEvents);
  }, [fetchWithCache]);

  // Optimized user data fetchers - all use the same API call
  const getAllUsers = useCallback(() => {
    return fetchWithCache('allUsers', api.getAllUsers);
  }, [fetchWithCache]);

  const getStudents = useCallback(async () => {
    const allUsers = await getAllUsers();
    return allUsers.filter(user => user.role === 'student');
  }, [getAllUsers]);

  const getTeachers = useCallback(async () => {
    const allUsers = await getAllUsers();
    return allUsers.filter(user => user.role === 'teacher');
  }, [getAllUsers]);

  const getPendingUsers = useCallback(async () => {
    const allUsers = await getAllUsers();
    return allUsers.filter(user => user.status === 'pending');
  }, [getAllUsers]);

  const getSchedules = useCallback(() => {
    return fetchWithCache('schedules', api.getSchedules);
  }, [fetchWithCache]);

  const getGalleryStats = useCallback(() => {
    return fetchWithCache('galleryStats', async () => {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:4000/api';
      const response = await fetch(`${API_BASE}/gallery/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      return data.success ? data.data : null;
    });
  }, [fetchWithCache]);

  const getGalleryCategories = useCallback(() => {
    return fetchWithCache('galleryCategories', async () => {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:4000/api';
      const response = await fetch(`${API_BASE}/gallery/admin/categories?includeInactive=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      return data.success ? data.data : [];
    });
  }, [fetchWithCache]);

  const getGalleryImages = useCallback(() => {
    return fetchWithCache('galleryImages', async () => {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:4000/api';
      const response = await fetch(`${API_BASE}/gallery/admin/images?includeInactive=true&limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      return data.success ? data.data : [];
    });
  }, [fetchWithCache]);

  const getInfrastructureStats = useCallback(() => {
    return fetchWithCache('infrastructureStats', async () => {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:4000/api';
      const response = await fetch(`${API_BASE}/gallery/admin/infrastructure-stats?includeInactive=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      return data.success ? data.data : [];
    });
  }, [fetchWithCache]);

  // Cache invalidation functions
  const invalidateCache = useCallback((keys) => {
    setCache(prev => {
      const newCache = { ...prev };
      keys.forEach(key => {
        if (newCache[key]) {
          newCache[key] = { data: null, loading: false, lastFetched: null };
        }
      });
      return newCache;
    });
  }, []);

  const clearAllCache = useCallback(() => {
    setCache({
      events: { data: null, loading: false, lastFetched: null },
      allUsers: { data: null, loading: false, lastFetched: null },
      schedules: { data: null, loading: false, lastFetched: null },
      galleryStats: { data: null, loading: false, lastFetched: null },
      galleryCategories: { data: null, loading: false, lastFetched: null },
      galleryImages: { data: null, loading: false, lastFetched: null },
      infrastructureStats: { data: null, loading: false, lastFetched: null }
    });
  }, []);

  // Update cache directly (for CRUD operations)
  const updateCache = useCallback((key, updater) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        data: typeof updater === 'function' ? updater(prev[key].data) : updater,
        lastFetched: Date.now()
      }
    }));
  }, []);

  const value = {
    // Data fetchers
    getEvents,
    getStudents,
    getTeachers,
    getPendingUsers,
    getAllUsers,
    getSchedules,
    getGalleryStats,
    getGalleryCategories,
    getGalleryImages,
    getInfrastructureStats,
    
    // Cache management
    invalidateCache,
    clearAllCache,
    updateCache,
    
    // Cache state
    cache,
    isLoading: (key) => cache[key]?.loading || false,
    hasData: (key) => !!cache[key]?.data
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};