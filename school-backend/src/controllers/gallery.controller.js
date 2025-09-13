import { supabase } from '../services/supabase.service.js';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/gallery');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `gallery-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// GALLERY CATEGORIES CONTROLLERS

// Get all categories
const getCategories = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    
    let query = supabase
      .from('gallery_categories')
      .select('*')
      .order('display_order')
      .order('created_at');
    
    if (includeInactive !== 'true') {
      query = query.eq('is_active', true);
    }
    
    const { data: categories, error } = await query;
    
    if (error) {
      console.error('Get categories error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch categories'
      });
    }
    
    // Format data to match expected structure
    const formattedCategories = categories.map(cat => ({
      ...cat,
      first_name: cat.users?.first_name,
      last_name: cat.users?.last_name,
      image_count: 0 // Will be populated separately if needed
    }));
    
    res.status(200).json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: category, error } = await supabase
      .from('gallery_categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Format data to match expected structure
    const formattedCategory = {
      ...category,
      first_name: category.users?.first_name,
      last_name: category.users?.last_name
    };
    
    res.status(200).json({
      success: true,
      data: formattedCategory
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category'
    });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    const { name, slug, icon, description, display_order } = req.body;
    const userId = req.user.id;
    
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required'
      });
    }
    
    const categoryData = {
      name,
      slug,
      icon,
      description,
      display_order: display_order || 0,
      created_by: userId,
      created_at: new Date().toISOString()
    };
    
    const { data: newCategory, error } = await supabase
      .from('gallery_categories')
      .insert([categoryData])
      .select()
      .single();
    
    if (error) {
      console.error('Create category error:', error);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({
          success: false,
          message: 'Category slug already exists'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to create category'
        });
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, icon, description, display_order, is_active } = req.body;
    
    const updateData = {
      name,
      slug,
      icon,
      description,
      display_order,
      is_active,
      updated_at: new Date().toISOString()
    };
    
    const { data: updatedCategory, error } = await supabase
      .from('gallery_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Update category error:', error);
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Category slug already exists'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to update category'
        });
      }
    }
    
    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has images
    const { data: existingImages, error: checkError } = await supabase
      .from('gallery_images')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);
    
    if (checkError) {
      console.error('Error checking images:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Failed to check category images'
      });
    }
    
    if (existingImages && existingImages.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing images. Please move or delete images first.'
      });
    }
    
    const { data: deletedCategory, error } = await supabase
      .from('gallery_categories')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Delete category error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete category'
      });
    }
    
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

// GALLERY IMAGES CONTROLLERS

// Get all images
const getImages = async (req, res) => {
  try {
    const { category, includeInactive, page = 1, limit = 20 } = req.query;
    
    let query = supabase
      .from('gallery_images')
      .select('*')
      .order('display_order')
      .order('created_at', { ascending: false });
    
    if (includeInactive !== 'true') {
      query = query.eq('is_active', true);
    }
    
    if (category && category !== 'all') {
      // For filtering by category, we need to join and filter
      query = query.not('category_id', 'is', null);
    }
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + parseInt(limit) - 1);
    
    const { data: images, error, count } = await query;
    
    if (error) {
      console.error('Get images error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch images'
      });
    }
    
    // Format data to match expected structure
    const formattedImages = images.map(img => ({
      ...img,
      category_name: null,
      category_slug: null,
      first_name: null,
      last_name: null
    }));
    
    res.status(200).json({
      success: true,
      data: formattedImages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || formattedImages.length,
        pages: Math.ceil((count || formattedImages.length) / limit)
      }
    });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images'
    });
  }
};

// Get image by ID
const getImageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: image, error } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    // Format data to match expected structure
    const formattedImage = {
      ...image,
      category_name: null,
      category_slug: null,
      first_name: null,
      last_name: null
    };
    
    res.status(200).json({
      success: true,
      data: formattedImage
    });
  } catch (error) {
    console.error('Get image by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch image'
    });
  }
};

// Upload and create new image
const createImage = async (req, res) => {
  try {
    const { title, description, alt_text, category_id, display_order } = req.body;
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }
    
    const image_url = `/uploads/gallery/${req.file.filename}`;
    
    const imageData = {
      title,
      description,
      image_url,
      alt_text: alt_text || title,
      category_id: category_id || null,
      display_order: display_order || 0,
      file_size: req.file.size,
      file_type: req.file.mimetype,
      created_by: userId,
      created_at: new Date().toISOString(),
      uploaded_at: new Date().toISOString()
    };
    
    const { data: newImage, error } = await supabase
      .from('gallery_images')
      .insert([imageData])
      .select()
      .single();
    
    if (error) {
      console.error('Create image error:', error);
      
      // Delete uploaded file if database insert fails
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Failed to delete uploaded file:', unlinkError);
        }
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: newImage
    });
  } catch (error) {
    console.error('Create image error:', error);
    
    // Delete uploaded file if database insert fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
};

// Update image
const updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, alt_text, category_id, display_order, is_active } = req.body;
    
    let oldImagePath = null;
    
    // If new image is uploaded, get old image path to delete it
    if (req.file) {
      const { data: oldImage } = await supabase
        .from('gallery_images')
        .select('image_url')
        .eq('id', id)
        .single();
      
      oldImagePath = oldImage?.image_url;
    }
    
    // Prepare update data
    const updateData = {
      title,
      description,
      alt_text,
      category_id,
      display_order,
      is_active,
      updated_at: new Date().toISOString()
    };
    
    // Add new image data if file was uploaded
    if (req.file) {
      updateData.image_url = `/uploads/gallery/${req.file.filename}`;
      updateData.file_size = req.file.size;
      updateData.file_type = req.file.mimetype;
      updateData.uploaded_at = new Date().toISOString();
    }
    
    const { data: updatedImage, error } = await supabase
      .from('gallery_images')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Update image error:', error);
      
      // Delete uploaded file if database update fails
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Failed to delete uploaded file:', unlinkError);
        }
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to update image'
      });
    }
    
    if (!updatedImage) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    // Delete old image file if new one was uploaded
    if (req.file && oldImagePath) {
      try {
        const oldFilePath = path.join(__dirname, '../../', oldImagePath);
        await fs.unlink(oldFilePath);
      } catch (unlinkError) {
        console.error('Failed to delete old image file:', unlinkError);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Image updated successfully',
      data: updatedImage
    });
  } catch (error) {
    console.error('Update image error:', error);
    
    // Delete uploaded file if database update fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update image'
    });
  }
};

// Delete image
const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get image info before deletion
    const { data: imageToDelete, error: getError } = await supabase
      .from('gallery_images')
      .select('image_url')
      .eq('id', id)
      .single();
    
    if (getError || !imageToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    const imagePath = imageToDelete.image_url;
    
    // Delete from database
    const { data: deletedImage, error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Delete image error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete image'
      });
    }
    
    // Delete image file
    if (imagePath) {
      try {
        const filePath = path.join(__dirname, '../../', imagePath);
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error('Failed to delete image file:', unlinkError);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
};

// INFRASTRUCTURE STATS CONTROLLERS

// Get all infrastructure stats
const getInfrastructureStats = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    
    let query = supabase
      .from('infrastructure_stats')
      .select('*')
      .order('display_order')
      .order('created_at');
    
    if (includeInactive !== 'true') {
      query = query.eq('is_active', true);
    }
    
    const { data: stats, error } = await query;
    
    if (error) {
      console.error('Get infrastructure stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch infrastructure stats'
      });
    }
    
    // Format data to match expected structure
    const formattedStats = stats.map(stat => ({
      ...stat,
      first_name: null,
      last_name: null
    }));
    
    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Get infrastructure stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch infrastructure stats'
    });
  }
};

// Create infrastructure stat
const createInfrastructureStat = async (req, res) => {
  try {
    const { label, value, icon, description, display_order } = req.body;
    const userId = req.user.id;
    
    if (!label || !value) {
      return res.status(400).json({
        success: false,
        message: 'Label and value are required'
      });
    }
    
    const statData = {
      label,
      value,
      icon,
      description,
      display_order: display_order || 0,
      created_by: userId,
      created_at: new Date().toISOString()
    };
    
    const { data: newStat, error } = await supabase
      .from('infrastructure_stats')
      .insert([statData])
      .select()
      .single();
    
    if (error) {
      console.error('Create infrastructure stat error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create infrastructure stat'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Infrastructure stat created successfully',
      data: newStat
    });
  } catch (error) {
    console.error('Create infrastructure stat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create infrastructure stat'
    });
  }
};

// Update infrastructure stat
const updateInfrastructureStat = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, value, icon, description, display_order, is_active } = req.body;
    
    const updateData = {
      label,
      value,
      icon,
      description,
      display_order,
      is_active,
      updated_at: new Date().toISOString()
    };
    
    const { data: updatedStat, error } = await supabase
      .from('infrastructure_stats')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Update infrastructure stat error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update infrastructure stat'
      });
    }
    
    if (!updatedStat) {
      return res.status(404).json({
        success: false,
        message: 'Infrastructure stat not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Infrastructure stat updated successfully',
      data: updatedStat
    });
  } catch (error) {
    console.error('Update infrastructure stat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update infrastructure stat'
    });
  }
};

// Delete infrastructure stat
const deleteInfrastructureStat = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: deletedStat, error } = await supabase
      .from('infrastructure_stats')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Delete infrastructure stat error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete infrastructure stat'
      });
    }
    
    if (!deletedStat) {
      return res.status(404).json({
        success: false,
        message: 'Infrastructure stat not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Infrastructure stat deleted successfully'
    });
  } catch (error) {
    console.error('Delete infrastructure stat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete infrastructure stat'
    });
  }
};

export {
  // Upload middleware
  upload,
  
  // Categories
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Images
  getImages,
  getImageById,
  createImage,
  updateImage,
  deleteImage,
  
  // Infrastructure Stats
  getInfrastructureStats,
  createInfrastructureStat,
  updateInfrastructureStat,
  deleteInfrastructureStat
};