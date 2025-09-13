import React, { useState } from "react";
import "./GalleryPage.css";

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const galleryCategories = [
    { id: "all", name: "All Photos", icon: "🏫" },
    { id: "classrooms", name: "Classrooms", icon: "📚" },
    { id: "labs", name: "Laboratories", icon: "🔬" },
    { id: "sports", name: "Sports Facilities", icon: "⚽" },
    { id: "library", name: "Library", icon: "📖" },
    { id: "campus", name: "Campus", icon: "🌳" },
    { id: "events", name: "School Events", icon: "🎉" }
  ];

  const galleryImages = [
    // Classrooms
    {
      id: 1,
      category: "classrooms",
      title: "Modern Smart Classroom",
      description: "Interactive whiteboards and digital learning tools",
      image: "/api/placeholder/400/300",
      alt: "Smart classroom with interactive whiteboard"
    },
    {
      id: 2,
      category: "classrooms",
      title: "Primary Section Classroom",
      description: "Colorful and engaging learning environment for young minds",
      image: "/api/placeholder/400/300",
      alt: "Primary classroom with colorful decorations"
    },
    {
      id: 3,
      category: "classrooms",
      title: "High School Classroom",
      description: "Well-equipped classrooms for senior students",
      image: "/api/placeholder/400/300",
      alt: "High school classroom setup"
    },

    // Laboratories
    {
      id: 4,
      category: "labs",
      title: "Science Laboratory",
      description: "State-of-the-art equipment for physics, chemistry, and biology",
      image: "/api/placeholder/400/300",
      alt: "Science laboratory with modern equipment"
    },
    {
      id: 5,
      category: "labs",
      title: "Computer Lab",
      description: "Latest computers with high-speed internet connectivity",
      image: "/api/placeholder/400/300",
      alt: "Computer laboratory with modern PCs"
    },
    {
      id: 6,
      category: "labs",
      title: "Language Lab",
      description: "Audio-visual setup for enhanced language learning",
      image: "/api/placeholder/400/300",
      alt: "Language laboratory with audio equipment"
    },

    // Sports Facilities
    {
      id: 7,
      category: "sports",
      title: "Basketball Court",
      description: "Full-size indoor basketball court with professional flooring",
      image: "/api/placeholder/400/300",
      alt: "Indoor basketball court"
    },
    {
      id: 8,
      category: "sports",
      title: "Swimming Pool",
      description: "Olympic-size swimming pool with modern filtration system",
      image: "/api/placeholder/400/300",
      alt: "School swimming pool"
    },
    {
      id: 9,
      category: "sports",
      title: "Football Ground",
      description: "Well-maintained football field with natural grass",
      image: "/api/placeholder/400/300",
      alt: "Football ground with goal posts"
    },

    // Library
    {
      id: 10,
      category: "library",
      title: "Main Library Hall",
      description: "Spacious reading area with over 10,000 books",
      image: "/api/placeholder/400/300",
      alt: "Library main hall with reading tables"
    },
    {
      id: 11,
      category: "library",
      title: "Digital Library Section",
      description: "E-books and online research facilities",
      image: "/api/placeholder/400/300",
      alt: "Digital library with computers"
    },

    // Campus
    {
      id: 12,
      category: "campus",
      title: "School Main Building",
      description: "Historic main building housing administrative offices",
      image: "/api/placeholder/400/300",
      alt: "School main building exterior"
    },
    {
      id: 13,
      category: "campus",
      title: "Garden Area",
      description: "Beautiful landscaped gardens for outdoor learning",
      image: "/api/placeholder/400/300",
      alt: "School garden with plants and seating"
    },
    {
      id: 14,
      category: "campus",
      title: "Cafeteria",
      description: "Hygienic dining facility serving nutritious meals",
      image: "/api/placeholder/400/300",
      alt: "School cafeteria interior"
    },

    // Events
    {
      id: 15,
      category: "events",
      title: "Annual Day Celebration",
      description: "Students performing cultural programs",
      image: "/api/placeholder/400/300",
      alt: "Students performing on stage"
    },
    {
      id: 16,
      category: "events",
      title: "Science Fair",
      description: "Students showcasing their innovative projects",
      image: "/api/placeholder/400/300",
      alt: "Science fair with student projects"
    },
    {
      id: 17,
      category: "events",
      title: "Sports Day",
      description: "Athletic competitions and team spirit",
      image: "/api/placeholder/400/300",
      alt: "Students participating in sports day"
    }
  ];

  const filteredImages = activeCategory === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  const infrastructureStats = [
    { label: "Total Area", value: "15 Acres", icon: "🏗️" },
    { label: "Classrooms", value: "45+", icon: "🏫" },
    { label: "Laboratories", value: "12", icon: "🔬" },
    { label: "Sports Facilities", value: "8", icon: "⚽" },
    { label: "Library Books", value: "10,000+", icon: "📚" },
    { label: "Computer Systems", value: "200+", icon: "💻" }
  ];

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
      <section className="gallery-stats">
        <div className="container">
          <h2 className="gallery-stats__title">Our Infrastructure at a Glance</h2>
          <div className="gallery-stats__grid">
            {infrastructureStats.map((stat, index) => (
              <div key={index} className="gallery-stats__card">
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
          <div className="gallery-filters">
            {galleryCategories.map((category) => (
              <button
                key={category.id}
                className={`gallery-filter ${activeCategory === category.id ? 'gallery-filter--active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="gallery-filter__icon">{category.icon}</span>
                <span className="gallery-filter__text">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Image Grid */}
          <div className="gallery-grid">
            {filteredImages.map((image) => (
              <div key={image.id} className="gallery-item">
                <div className="gallery-item__image-container">
                  <img
                    src={image.image}
                    alt={image.alt}
                    className="gallery-item__image"
                    onError={(e) => {
                      const category = image.category.charAt(0).toUpperCase() + image.category.slice(1);
                      e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><defs><linearGradient id="grad-${image.id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%236366f1;stop-opacity:1" /><stop offset="100%" style="stop-color:%238b5cf6;stop-opacity:1" /></linearGradient></defs><rect width="400" height="300" fill="url(%23grad-${image.id})"/><text x="200" y="140" font-family="Arial,sans-serif" font-size="16" fill="white" text-anchor="middle">${category}</text><text x="200" y="170" font-family="Arial,sans-serif" font-size="24" fill="white" text-anchor="middle">${image.title}</text></svg>`;
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
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}