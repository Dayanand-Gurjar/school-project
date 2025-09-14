import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase.service.js';

// Configure multer for memory storage (since we're uploading to Supabase)
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload middleware for profile pictures
export const uploadProfilePicture = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
}).single('profilePicture');

// Create multer upload middleware for gallery images
export const uploadGalleryImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for gallery
  }
}).single('image');

// Upload profile picture to Supabase Storage
export const uploadProfilePictureToSupabase = async (file) => {
  try {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    const fileName = `profile_${uniqueId}${extension}`;
    
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    return { success: true, data: { path: data.path, url: publicUrl } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Upload gallery image to Supabase Storage
export const uploadGalleryImageToSupabase = async (file) => {
  try {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    const fileName = `gallery_${uniqueId}${extension}`;
    
    const { data, error } = await supabase.storage
      .from('gallery-images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(fileName);

    return { success: true, data: { path: data.path, url: publicUrl } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Helper function to get profile picture URL (now returns Supabase URL directly)
export const getProfilePictureUrl = (url) => {
  return url; // Supabase URLs are already complete
};

// Helper function to delete profile picture from Supabase
export const deleteProfilePicture = async (filePath) => {
  try {
    if (!filePath) return { success: true };
    
    const { error } = await supabase.storage
      .from('profile-pictures')
      .remove([filePath]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to delete gallery image from Supabase
export const deleteGalleryImage = async (filePath) => {
  try {
    if (!filePath) return { success: true };
    
    const { error } = await supabase.storage
      .from('gallery-images')
      .remove([filePath]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return { success: false, error: error.message };
  }
};

// Middleware to handle upload errors
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: 'File upload error: ' + error.message
    });
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      error: 'Only image files (PNG, JPG, JPEG, GIF) are allowed.'
    });
  }
  
  next(error);
};