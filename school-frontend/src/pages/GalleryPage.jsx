import React, { useState, useEffect } from "react";
import "./GalleryPage.css";

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [galleryCategories, setGalleryCategories] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [infrastructureStats, setInfrastructureStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:4000/api';

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories, images, and infrastructure stats in parallel
      const [categoriesRes, imagesRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/gallery/categories`),
        fetch(`${API_BASE}/gallery/images`),
        fetch(`${API_BASE}/gallery/infrastructure-stats`)
      ]);

      const [categoriesData, imagesData, statsData] = await Promise.all([
        categoriesRes.json(),
        imagesRes.json(),
        statsRes.json()
      ]);

      if (categoriesData.success) {
        // Add "All" category at the beginning
        const allCategory = { id: 'all', name: 'All Photos', icon: '🏫', slug: 'all' };
        setGalleryCategories([allCategory, ...categoriesData.data]);
      }

      if (imagesData.success) {
        setGalleryImages(imagesData.data);
      }

      if (statsData.success) {
        setInfrastructureStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching gallery data:', error);
      
      // Fallback to default data if API fails
      setGalleryCategories([
        { id: "all", name: "All Photos", icon: "🏫", slug: "all" },
        { id: "classrooms", name: "Classrooms", icon: "📚", slug: "classrooms" },
        { id: "labs", name: "Laboratories", icon: "🔬", slug: "labs" },
        { id: "sports", name: "Sports Facilities", icon: "⚽", slug: "sports" },
        { id: "library", name: "Library", icon: "📖", slug: "library" },
        { id: "campus", name: "Campus", icon: "🌳", slug: "campus" },
        { id: "events", name: "School Events", icon: "🎉", slug: "events" }
      ]);
      
      setInfrastructureStats([
        { label: "Total Area", value: "15 Acres", icon: "🏗️" },
        { label: "Classrooms", value: "45+", icon: "🏫" },
        { label: "Laboratories", value: "12", icon: "🔬" },
        { label: "Sports Facilities", value: "8", icon: "⚽" },
        { label: "Library Books", value: "10,000+", icon: "📚" },
        { label: "Computer Systems", value: "200+", icon: "💻" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = React.useMemo(() => {
    if (!Array.isArray(galleryImages)) return [];
    
    if (activeCategory === "all") {
      return galleryImages;
    }
    
    return galleryImages.filter(img => {
      if (!img.category_id) return false;
      if (!Array.isArray(galleryCategories)) return false;
      
      const category = galleryCategories.find(cat => cat.id === img.category_id);
      return category && (category.slug === activeCategory || category.id === activeCategory);
    });
  }, [galleryImages, galleryCategories, activeCategory]);

  if (loading) {
    return (
      <div className="gallery-page">
        <div className="gallery-loading">
          <div className="loading-spinner"></div>
          <p>Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-page">
      {/* Hero Section */}
      <section className="gallery-hero">
        <div className="container">
          <div className="gallery-hero__content">
            <h1 className="gallery-hero__title">School Gallery</h1>
            <p className="gallery-hero__subtitle">
              Take a visual journey through our campus and discover our world-class facilities
            </p>
          </div>
        </div>
      </section>

      {/* Infrastructure Stats */}
      {infrastructureStats.length > 0 && (
        <section className="gallery-stats">
          <div className="container">
            <h2 className="gallery-stats__title">Our Infrastructure at a Glance</h2>
            <div className="gallery-stats__grid">
              {infrastructureStats.map((stat, index) => (
                <div key={stat.id || index} className="gallery-stats__card">
                  <div className="gallery-stats__icon">{stat.icon}</div>
                  <div className="gallery-stats__content">
                    <div className="gallery-stats__value">{stat.value}</div>
                    <div className="gallery-stats__label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="container">
          <div className="gallery-header">
            <h2 className="gallery-title">Photo Gallery</h2>
            <p className="gallery-subtitle">
              Explore different areas of our campus through these photographs
            </p>
          </div>

          {/* Category Filter */}
          {galleryCategories.length > 0 && (
            <div className="gallery-filters">
              {galleryCategories.map((category) => (
                <button
                  key={category.id || category.slug}
                  className={`gallery-filter ${activeCategory === (category.slug || category.id) ? 'gallery-filter--active' : ''}`}
                  onClick={() => setActiveCategory(category.slug || category.id)}
                >
                  <span className="gallery-filter__icon">{category.icon}</span>
                  <span className="gallery-filter__text">{category.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Image Grid */}
          <div className="gallery-grid">
            {filteredImages.length === 0 ? (
              <div className="gallery-empty">
                <p>No images found for this category.</p>
              </div>
            ) : (
              filteredImages.map((image) => (
                <div key={image.id} className="gallery-item">
                  <div className="gallery-item__image-container">
                    <img
                      src={image.image_url ? `${API_BASE.replace('/api', '')}${image.image_url}` : image.image}
                      alt={image.alt_text || image.alt || image.title}
                      className="gallery-item__image"
                      onError={(e) => {
                        const categoryName = image.category_name || image.category || 'Gallery';
                        e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><defs><linearGradient id="grad-${image.id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%236366f1;stop-opacity:1" /><stop offset="100%" style="stop-color:%238b5cf6;stop-opacity:1" /></linearGradient></defs><rect width="400" height="300" fill="url(%23grad-${image.id})"/><text x="200" y="140" font-family="Arial,sans-serif" font-size="16" fill="white" text-anchor="middle">${categoryName}</text><text x="200" y="170" font-family="Arial,sans-serif" font-size="24" fill="white" text-anchor="middle">${image.title}</text></svg>`;
                      }}
                    />
                    <div className="gallery-item__overlay">
                      <div className="gallery-item__content">
                        <h3 className="gallery-item__title">{image.title}</h3>
                        <p className="gallery-item__description">{image.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}