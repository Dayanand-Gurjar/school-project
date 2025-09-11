import React, { useState } from "react";
import { createEvent } from "../../services/api";
import "./EventForm.css";

export default function EventForm({ onEventCreated }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const adminSecret = "dev-secret"; // replace later with auth JWT

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
    document.getElementById('image-input').value = '';
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

    const res = await createEvent(eventData, adminSecret);
    
    if (res.success) {
      onEventCreated(res.data[0]);
      setTitle("");
      setDesc("");
      setDate("");
      setImages([]);
      setImagePreviews([]);
      document.getElementById('image-input').value = '';
    } else {
      alert("Failed to create event: " + res.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="event-form">
      <h3 className="event-form__title">Add New Event</h3>
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
            {images.length > 0 && (
              <button
                type="button"
                onClick={removeAllImages}
                className="event-form__clear-all"
              >
                Clear All
              </button>
            )}
          </div>
          <input
            id="image-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="event-form__file-input"
          />
          
          {imagePreviews.length > 0 && (
            <div className="event-form__image-previews">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="event-form__image-preview">
                  <img src={preview} alt={`Preview ${index + 1}`} className="event-form__preview-image" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="event-form__remove-image"
                  >
                    ✕
                  </button>
                  <div className="event-form__image-number">{index + 1}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button type="submit" className="event-form__submit" disabled={loading}>
          {loading ? 'Adding Event...' : 'Add Event'}
        </button>
      </form>
    </div>
  );
}
