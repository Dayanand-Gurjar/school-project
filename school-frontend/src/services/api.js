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
