import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import './GalleryManager.css';

export default function GalleryManager() {
  const {
    getGalleryCategories,
    getGalleryImages,
    getInfrastructureStats,
    getGalleryStats,
    updateCache,
    invalidateCache
  } = useData();
  
  const [activeTab, setActiveTab] = useState('images');
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [infrastructureStats, setInfrastructureStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'category', 'image', 'stat'
  const [editingItem, setEditingItem] = useState(null);
  const [galleryStats, setGalleryStats] = useState(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    icon: '',
    description: '',
    display_order: 0,
    is_active: true
  });

  const [imageForm, setImageForm] = useState({
    title: '',
    description: '',
    alt_text: '',
    category_id: '',
    display_order: 0,
    is_active: true,
    image: null
  });

  const [statForm, setStatForm] = useState({
    label: '',
    value: '',
    icon: '',
    description: '',
    display_order: 0,
    is_active: true
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:4000/api';

  // Fetch data functions using cache
  const fetchCategories = useCallback(async () => {
    try {
      const data = await getGalleryCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [getGalleryCategories]);

  const fetchImages = useCallback(async () => {
    try {
      const data = await getGalleryImages();
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  }, [getGalleryImages]);

  const fetchInfrastructureStats = useCallback(async () => {
    try {
      const data = await getInfrastructureStats();
      setInfrastructureStats(data);
    } catch (error) {
      console.error('Error fetching infrastructure stats:', error);
    }
  }, [getInfrastructureStats]);

  const fetchGalleryStats = useCallback(async () => {
    try {
      const data = await getGalleryStats();
      setGalleryStats(data);
    } catch (error) {
      console.error('Error fetching gallery stats:', error);
    }
  }, [getGalleryStats]);

  useEffect(() => {
    fetchCategories();
    fetchImages();
    fetchInfrastructureStats();
    fetchGalleryStats();
  }, [fetchCategories, fetchImages, fetchInfrastructureStats, fetchGalleryStats]);

  // Modal handlers
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    
    if (type === 'category') {
      setCategoryForm(item ? { ...item } : {
        name: '',
        slug: '',
        icon: '',
        description: '',
        display_order: categories.length,
        is_active: true
      });
    } else if (type === 'image') {
      setImageForm(item ? { 
        ...item,
        image: null 
      } : {
        title: '',
        description: '',
        alt_text: '',
        category_id: '',
        display_order: images.length,
        is_active: true,
        image: null
      });
    } else if (type === 'stat') {
      setStatForm(item ? { ...item } : {
        label: '',
        value: '',
        icon: '',
        description: '',
        display_order: infrastructureStats.length,
        is_active: true
      });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
  };

  // CRUD operations
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingItem 
        ? `${API_BASE}/gallery/admin/categories/${editingItem.id}`
        : `${API_BASE}/gallery/admin/categories`;
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm)
      });
      
      const data = await response.json();
      if (data.success) {
        // Invalidate cache to force refresh
        invalidateCache(['galleryCategories']);
        fetchCategories();
        closeModal();
      } else {
        alert(data.message || 'Error saving category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      Object.keys(imageForm).forEach(key => {
        if (key === 'image' && imageForm[key]) {
          formData.append('image', imageForm[key]);
        } else if (key !== 'image') {
          formData.append(key, imageForm[key]);
        }
      });
      
      const url = editingItem 
        ? `${API_BASE}/gallery/admin/images/${editingItem.id}`
        : `${API_BASE}/gallery/admin/images`;
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        fetchImages();
        closeModal();
      } else {
        alert(data.message || 'Error saving image');
      }
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Error saving image');
    } finally {
      setLoading(false);
    }
  };

  const handleStatSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingItem 
        ? `${API_BASE}/gallery/admin/infrastructure-stats/${editingItem.id}`
        : `${API_BASE}/gallery/admin/infrastructure-stats`;
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(statForm)
      });
      
      const data = await response.json();
      if (data.success) {
        fetchInfrastructureStats();
        closeModal();
      } else {
        alert(data.message || 'Error saving infrastructure stat');
      }
    } catch (error) {
      console.error('Error saving infrastructure stat:', error);
      alert('Error saving infrastructure stat');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const token = localStorage.getItem('token');
      let url = '';
      
      if (type === 'category') {
        url = `${API_BASE}/gallery/admin/categories/${id}`;
      } else if (type === 'image') {
        url = `${API_BASE}/gallery/admin/images/${id}`;
      } else if (type === 'stat') {
        url = `${API_BASE}/gallery/admin/infrastructure-stats/${id}`;
      }
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        if (type === 'category') fetchCategories();
        else if (type === 'image') fetchImages();
        else if (type === 'stat') fetchInfrastructureStats();
        
        fetchGalleryStats(); // Refresh stats
      } else {
        alert(data.message || 'Error deleting item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <div className="gallery-manager">
      <div className="gallery-manager__header">
        <h2>Gallery Management</h2>
        
        {/* Statistics Cards */}
        <div className="gallery-stats-cards">
          <div className="stat-card">
            <div className="stat-card__icon">🖼️</div>
            <div className="stat-card__content">
              <div className="stat-card__number">{images.length}</div>
              <div className="stat-card__label">Images</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon">💾</div>
            <div className="stat-card__content">
              <div className="stat-card__number">{galleryStats?.storage?.formatted || 'Loading...'}</div>
              <div className="stat-card__label">Storage Used</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="gallery-manager__tabs">
        <button 
          className={`tab ${activeTab === 'images' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          Images ({images.length})
        </button>
        <button 
          className={`tab ${activeTab === 'categories' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories ({categories.length})
        </button>
        <button 
          className={`tab ${activeTab === 'stats' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Infrastructure Stats ({infrastructureStats.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="gallery-manager__content">
        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="tab-content">
            <div className="tab-header">
              <h3>Gallery Images</h3>
              <button 
                className="btn btn-primary"
                onClick={() => openModal('image')}
              >
                Add New Image
              </button>
            </div>
            
            <div className="images-grid">
              {images.map(image => (
                <div key={image.id} className={`image-card ${!image.is_active ? 'image-card--inactive' : ''}`}>
                  <div className="image-card__image">
                    <img 
                      src={`${API_BASE.replace('/api', '')}${image.image_url}`} 
                      alt={image.alt_text}
                      onError={(e) => {
                        e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23f0f0f0"/><text x="100" y="75" font-family="Arial" font-size="12" fill="%23666" text-anchor="middle">Image Error</text></svg>`;
                      }}
                    />
                    <div className="image-card__overlay">
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => openModal('image', image)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete('image', image.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="image-card__content">
                    <h4 className="image-card__title">{image.title}</h4>
                    <p className="image-card__category">{image.category_name || 'No Category'}</p>
                    <div className="image-card__meta">
                      <span className={`status ${image.is_active ? 'status--active' : 'status--inactive'}`}>
                        {image.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="order">Order: {image.display_order}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="tab-content">
            <div className="tab-header">
              <h3>Gallery Categories</h3>
              <button 
                className="btn btn-primary"
                onClick={() => openModal('category')}
              >
                Add New Category
              </button>
            </div>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Images</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category.id} className={!category.is_active ? 'row--inactive' : ''}>
                      <td className="category-icon">{category.icon}</td>
                      <td>{category.name}</td>
                      <td><code>{category.slug}</code></td>
                      <td>{category.image_count}</td>
                      <td>{category.display_order}</td>
                      <td>
                        <span className={`status ${category.is_active ? 'status--active' : 'status--inactive'}`}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="actions">
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => openModal('category', category)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete('category', category.id)}
                          title="Delete"
                          disabled={category.image_count > 0}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Infrastructure Stats Tab */}
        {activeTab === 'stats' && (
          <div className="tab-content">
            <div className="tab-header">
              <h3>Infrastructure Statistics</h3>
              <button 
                className="btn btn-primary"
                onClick={() => openModal('stat')}
              >
                Add New Stat
              </button>
            </div>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Label</th>
                    <th>Value</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {infrastructureStats.map(stat => (
                    <tr key={stat.id} className={!stat.is_active ? 'row--inactive' : ''}>
                      <td className="stat-icon">{stat.icon}</td>
                      <td>{stat.label}</td>
                      <td><strong>{stat.value}</strong></td>
                      <td>{stat.display_order}</td>
                      <td>
                        <span className={`status ${stat.is_active ? 'status--active' : 'status--inactive'}`}>
                          {stat.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="actions">
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => openModal('stat', stat)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete('stat', stat.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3>
                {modalType === 'category' && (editingItem ? 'Edit Category' : 'Add Category')}
                {modalType === 'image' && (editingItem ? 'Edit Image' : 'Add Image')}
                {modalType === 'stat' && (editingItem ? 'Edit Infrastructure Stat' : 'Add Infrastructure Stat')}
              </h3>
              <button className="modal__close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal__content">
              {/* Category Form */}
              {modalType === 'category' && (
                <form onSubmit={handleCategorySubmit}>
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setCategoryForm(prev => ({
                          ...prev,
                          name,
                          slug: prev.slug || generateSlug(name)
                        }));
                      }}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Slug *</label>
                    <input
                      type="text"
                      value={categoryForm.slug}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Icon (Emoji)</label>
                    <input
                      type="text"
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="🏫"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Display Order</label>
                      <input
                        type="number"
                        value={categoryForm.display_order}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                        min="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={categoryForm.is_active}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, is_active: e.target.checked }))}
                        />
                        Active
                      </label>
                    </div>
                  </div>
                  
                  <div className="modal__actions">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                    </button>
                  </div>
                </form>
              )}

              {/* Image Form */}
              {modalType === 'image' && (
                <form onSubmit={handleImageSubmit}>
                  <div className="form-group">
                    <label>Image File {!editingItem && '*'}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageForm(prev => ({ ...prev, image: e.target.files[0] }))}
                      required={!editingItem}
                    />
                    {editingItem && (
                      <small className="form-help">Leave empty to keep current image</small>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={imageForm.title}
                      onChange={(e) => setImageForm(prev => ({ 
                        ...prev, 
                        title: e.target.value,
                        alt_text: prev.alt_text || e.target.value
                      }))}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={imageForm.description}
                      onChange={(e) => setImageForm(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Alt Text</label>
                    <input
                      type="text"
                      value={imageForm.alt_text}
                      onChange={(e) => setImageForm(prev => ({ ...prev, alt_text: e.target.value }))}
                      placeholder="Descriptive text for accessibility"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={imageForm.category_id}
                        onChange={(e) => setImageForm(prev => ({ ...prev, category_id: e.target.value }))}
                      >
                        <option value="">No Category</option>
                        {categories.filter(cat => cat.is_active && cat.slug !== 'all').map(category => (
                          <option key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Display Order</label>
                      <input
                        type="number"
                        value={imageForm.display_order}
                        onChange={(e) => setImageForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={imageForm.is_active}
                        onChange={(e) => setImageForm(prev => ({ ...prev, is_active: e.target.checked }))}
                      />
                      Active
                    </label>
                  </div>
                  
                  <div className="modal__actions">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : (editingItem ? 'Update' : 'Upload')}
                    </button>
                  </div>
                </form>
              )}

              {/* Infrastructure Stat Form */}
              {modalType === 'stat' && (
                <form onSubmit={handleStatSubmit}>
                  <div className="form-group">
                    <label>Label *</label>
                    <input
                      type="text"
                      value={statForm.label}
                      onChange={(e) => setStatForm(prev => ({ ...prev, label: e.target.value }))}
                      required
                      placeholder="Total Area"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Value *</label>
                    <input
                      type="text"
                      value={statForm.value}
                      onChange={(e) => setStatForm(prev => ({ ...prev, value: e.target.value }))}
                      required
                      placeholder="15 Acres"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Icon (Emoji)</label>
                    <input
                      type="text"
                      value={statForm.icon}
                      onChange={(e) => setStatForm(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="🏗️"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={statForm.description}
                      onChange={(e) => setStatForm(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                      placeholder="Additional details about this statistic"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Display Order</label>
                      <input
                        type="number"
                        value={statForm.display_order}
                        onChange={(e) => setStatForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                        min="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={statForm.is_active}
                          onChange={(e) => setStatForm(prev => ({ ...prev, is_active: e.target.checked }))}
                        />
                        Active
                      </label>
                    </div>
                  </div>
                  
                  <div className="modal__actions">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}