import { supabase, uploadEventImage, deleteEventImage, uploadMultipleEventImages, deleteMultipleEventImages } from '../services/supabase.service.js';
import { v4 as uuidv4 } from 'uuid';

export async function getEvents(req, res) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false });
  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.json({ success: true, data });
}

export async function createEvent(req, res) {
  try {
    const { title, description, event_date } = req.body;
    let image_urls = [];
    let image_url = null; // Keep for backward compatibility

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
      const uploadResult = await uploadMultipleEventImages(req.files);
      
      if (!uploadResult.success) {
        return res.status(500).json({ success: false, error: 'Failed to upload images' });
      }
      
      image_urls = uploadResult.data.map(img => img.url);
      image_url = image_urls[0]; // Set first image as primary for backward compatibility
    }
    // Handle single image upload (for backward compatibility)
    else if (req.file) {
      const fileName = `${uuidv4()}-${req.file.originalname}`;
      const uploadResult = await uploadEventImage(req.file.buffer, fileName);
      
      if (!uploadResult.success) {
        return res.status(500).json({ success: false, error: 'Failed to upload image' });
      }
      
      image_url = uploadResult.data.url;
      image_urls = [image_url];
    }

    // Insert event into database
    const { data, error } = await supabase
      .from('events')
      .insert([{
        title,
        description,
        event_date,
        image_url, // Primary image for backward compatibility
        image_urls: image_urls.length > 0 ? image_urls : null // Array of all images
      }])
      .select();

    if (error) {
      // If database insert fails but images were uploaded, clean up
      if (image_urls.length > 0) {
        const filePaths = image_urls.map(url => `events/${url.split('/').pop()}`);
        await deleteMultipleEventImages(filePaths);
      }
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const { title, description, event_date } = req.body;
    let image_url = req.body.image_url; // Keep existing primary image
    let image_urls = req.body.image_urls ? JSON.parse(req.body.image_urls) : [];

    // Get current event to manage existing images
    const { data: currentEvent } = await supabase
      .from('events')
      .select('image_url, image_urls')
      .eq('id', id)
      .single();

    // Handle new multiple image uploads
    if (req.files && req.files.length > 0) {
      const uploadResult = await uploadMultipleEventImages(req.files);
      
      if (!uploadResult.success) {
        return res.status(500).json({ success: false, error: 'Failed to upload images' });
      }
      
      const newImageUrls = uploadResult.data.map(img => img.url);
      image_urls = [...image_urls, ...newImageUrls];
      image_url = image_urls[0]; // Set first image as primary

      // Delete old images if they exist
      if (currentEvent?.image_urls && Array.isArray(currentEvent.image_urls)) {
        const oldFilePaths = currentEvent.image_urls.map(url => `events/${url.split('/').pop()}`);
        await deleteMultipleEventImages(oldFilePaths);
      } else if (currentEvent?.image_url) {
        const oldFileName = currentEvent.image_url.split('/').pop();
        await deleteEventImage(`events/${oldFileName}`);
      }
    }
    // Handle single new image upload (for backward compatibility)
    else if (req.file) {
      const fileName = `${uuidv4()}-${req.file.originalname}`;
      const uploadResult = await uploadEventImage(req.file.buffer, fileName);
      
      if (!uploadResult.success) {
        return res.status(500).json({ success: false, error: 'Failed to upload image' });
      }
      
      image_url = uploadResult.data.url;
      image_urls = [image_url];

      // Delete old images
      if (currentEvent?.image_urls && Array.isArray(currentEvent.image_urls)) {
        const oldFilePaths = currentEvent.image_urls.map(url => `events/${url.split('/').pop()}`);
        await deleteMultipleEventImages(oldFilePaths);
      } else if (currentEvent?.image_url) {
        const oldFileName = currentEvent.image_url.split('/').pop();
        await deleteEventImage(`events/${oldFileName}`);
      }
    }

    // Update event in database
    const { data, error } = await supabase
      .from('events')
      .update({
        title,
        description,
        event_date,
        image_url,
        image_urls: image_urls.length > 0 ? image_urls : null
      })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteEvent(req, res) {
  try {
    const { id } = req.params;

    // Get event to delete associated images
    const { data: event } = await supabase
      .from('events')
      .select('image_url, image_urls')
      .eq('id', id)
      .single();

    // Delete event from database
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    // Delete associated images
    if (event?.image_urls && Array.isArray(event.image_urls)) {
      const filePaths = event.image_urls.map(url => `events/${url.split('/').pop()}`);
      await deleteMultipleEventImages(filePaths);
    } else if (event?.image_url) {
      const fileName = event.image_url.split('/').pop();
      await deleteEventImage(`events/${fileName}`);
    }

    return res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
