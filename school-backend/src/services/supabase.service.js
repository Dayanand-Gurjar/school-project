import { createClient } from '@supabase/supabase-js';
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if(!url || !key) throw new Error("Missing SUPABASE env vars");
export const supabase = createClient(url, key);

// Storage service for handling file uploads
export const uploadEventImage = async (file, fileName) => {
  try {
    const { data, error } = await supabase.storage
      .from('event-images')
      .upload(`events/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('event-images')
      .getPublicUrl(`events/${fileName}`);

    return { success: true, data: { path: data.path, url: publicUrl } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Upload multiple images
export const uploadMultipleEventImages = async (files) => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const fileName = `${Date.now()}-${index}-${file.originalname || file.name}`;
      return uploadEventImage(file.buffer || file, fileName);
    });

    const results = await Promise.all(uploadPromises);
    const failedUploads = results.filter(r => !r.success);
    
    if (failedUploads.length > 0) {
      throw new Error(`Failed to upload ${failedUploads.length} images`);
    }

    return {
      success: true,
      data: results.map(r => r.data)
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteEventImage = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from('event-images')
      .remove([filePath]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete multiple images
export const deleteMultipleEventImages = async (imagePaths) => {
  try {
    const { error } = await supabase.storage
      .from('event-images')
      .remove(imagePaths);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
