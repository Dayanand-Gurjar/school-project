import React, { useState, useEffect } from "react";
import { createEvent, updateEvent } from "../../services/api";
import "./EventForm.css";

export default function EventForm({ event, onEventCreated }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const adminSecret = "dev-secret"; // replace later with auth JWT
  const isEditing = !!event;

  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setDesc(event.description || "");
      setDate(event.event_date ? event.event_date.split('T')[0] : "");
      
      // Handle existing images
      if (event.image_urls && event.image_urls.length > 0) {
        setExistingImages(event.image_urls);
      } else if (event.image_url) {
        setExistingImages([event.image_url]);
      }
    }
  }, [event]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Check file sizes (10MB limit per file)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      const oversizedFiles = files.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        alert(`Some files are too large. Maximum file size is 10MB per image. Please select smaller files.`);
        return;
      }
      
      // Limit to 5 images
      const selectedFiles = files.slice(0, 5);
      setImages(selectedFiles);
      
      // Create preview URLs
      const previews = [];
      selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews[index] = reader.result;
          if (previews.length === selectedFiles.length) {
            setImagePreviews([...previews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    const newPreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
    setImagePreviews(newPreviews);
    
    // Reset file input if no images left
    if (newImages.length === 0) {
      document.getElementById('image-input').value = '';
    }
  };

  const removeAllImages = () => {
    setImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    if (document.getElementById('image-input')) {
      document.getElementById('image-input').value = '';
    }
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const eventData = {
      title,
      description: desc,
      event_date: date,
      images: images
    };

    // For edit mode, include existing images that weren't removed
    if (isEditing) {
      eventData.image_urls = existingImages;
    }

    try {
      const res = isEditing
        ? await updateEvent(event.id, eventData, adminSecret)
        : await createEvent(eventData, adminSecret);
      
      if (res.success) {
        onEventCreated(res.data[0] || res.data);
        if (!isEditing) {
          // Only reset form for new events
          setTitle("");
          setDesc("");
          setDate("");
          setImages([]);
          setImagePreviews([]);
          setExistingImages([]);
          if (document.getElementById('image-input')) {
            document.getElementById('image-input').value = '';
          }
        }
      } else {
        alert(`Failed to ${isEditing ? 'update' : 'create'} event: ` + res.error);
      }
    } catch (error) {
      console.error('Error submitting event:', error);
      alert(`Error ${isEditing ? 'updating' : 'creating'} event. Please try again.`);
    }
    
    setLoading(false);
  };

  return (
    <div className="event-form">
      <h3 className="event-form__title">{isEditing ? 'Edit Event' : 'Add New Event'}</h3>
      <form onSubmit={handleSubmit} className="event-form__form">
        <input
          className="event-form__input"
          placeholder="Event Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <textarea
          className="event-form__textarea"
          placeholder="Event Description"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          required
        />
        <input
          className="event-form__input"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
        
        <div className="event-form__image-section">
          <div className="event-form__image-header">
            <label htmlFor="image-input" className="event-form__image-label">
              Event Images (Optional - Up to 5 images, 10MB max per image)
            </label>
            {(images.length > 0 || existingImages.length > 0) && (
              <button
                type="button"
                onClick={removeAllImages}
                className="event-form__clear-all"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="event-form__existing-images">
              <h4 className="event-form__section-title">Current Images:</h4>
              <div className="event-form__image-previews">
                {existingImages.map((imageUrl, index) => (
                  <div key={`existing-${index}`} className="event-form__image-preview">
                    <img src={imageUrl} alt={`Existing ${index + 1}`} className="event-form__preview-image" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="event-form__remove-image"
                    >
                      ✕
                    </button>
                    <div className="event-form__image-number existing">E{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <input
            id="image-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="event-form__file-input"
          />
          
          {/* New Images */}
          {imagePreviews.length > 0 && (
            <div className="event-form__new-images">
              {isEditing && <h4 className="event-form__section-title">New Images to Add:</h4>}
              <div className="event-form__image-previews">
                {imagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="event-form__image-preview">
                    <img src={preview} alt={`New ${index + 1}`} className="event-form__preview-image" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="event-form__remove-image"
                    >
                      ✕
                    </button>
                    <div className="event-form__image-number new">N{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button type="submit" className="event-form__submit" disabled={loading}>
          {loading ? (isEditing ? 'Updating Event...' : 'Adding Event...') : (isEditing ? 'Update Event' : 'Add Event')}
        </button>
      </form>
    </div>
  );
}
