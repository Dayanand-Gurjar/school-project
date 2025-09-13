import express from 'express';
import {
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
} from '../controllers/gallery.controller.js';

import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)

// Get all categories (public)
router.get('/categories', getCategories);

// Get all images (public)
router.get('/images', getImages);

// Get image by ID (public)
router.get('/images/:id', getImageById);

// Get infrastructure stats (public)
router.get('/infrastructure-stats', getInfrastructureStats);

// Admin routes (authentication required)

// Category management routes
router.get('/admin/categories', authenticateToken, requireAdmin, getCategories);
router.get('/admin/categories/:id', authenticateToken, requireAdmin, getCategoryById);
router.post('/admin/categories', authenticateToken, requireAdmin, createCategory);
router.put('/admin/categories/:id', authenticateToken, requireAdmin, updateCategory);
router.delete('/admin/categories/:id', authenticateToken, requireAdmin, deleteCategory);

// Image management routes
router.get('/admin/images', authenticateToken, requireAdmin, getImages);
router.get('/admin/images/:id', authenticateToken, requireAdmin, getImageById);
router.post('/admin/images', authenticateToken, requireAdmin, upload.single('image'), createImage);
router.put('/admin/images/:id', authenticateToken, requireAdmin, upload.single('image'), updateImage);
router.delete('/admin/images/:id', authenticateToken, requireAdmin, deleteImage);

// Infrastructure stats management routes
router.get('/admin/infrastructure-stats', authenticateToken, requireAdmin, getInfrastructureStats);
router.post('/admin/infrastructure-stats', authenticateToken, requireAdmin, createInfrastructureStat);
router.put('/admin/infrastructure-stats/:id', authenticateToken, requireAdmin, updateInfrastructureStat);
router.delete('/admin/infrastructure-stats/:id', authenticateToken, requireAdmin, deleteInfrastructureStat);

// Bulk operations routes (admin only)

// Bulk update display order for categories
router.patch('/admin/categories/bulk-order', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { categories } = req.body; // Array of {id, display_order}
    
    if (!Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: 'Categories array is required'
      });
    }
    
    const { supabase } = await import('../services/supabase.service.js');
    
    // Use batch update for categories
    for (const category of categories) {
      await supabase
        .from('gallery_categories')
        .update({
          display_order: category.display_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', category.id);
    }
    
    res.status(200).json({
      success: true,
      message: 'Category order updated successfully'
    });
  } catch (error) {
    console.error('Bulk update categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category order'
    });
  }
});

// Bulk update display order for images
router.patch('/admin/images/bulk-order', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { images } = req.body; // Array of {id, display_order}
    
    if (!Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: 'Images array is required'
      });
    }
    
    const { supabase } = await import('../services/supabase.service.js');
    
    // Use batch update for images
    for (const image of images) {
      await supabase
        .from('gallery_images')
        .update({
          display_order: image.display_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', image.id);
    }
    
    res.status(200).json({
      success: true,
      message: 'Image order updated successfully'
    });
  } catch (error) {
    console.error('Bulk update images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update image order'
    });
  }
});

// Bulk update display order for infrastructure stats
router.patch('/admin/infrastructure-stats/bulk-order', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { stats } = req.body; // Array of {id, display_order}
    
    if (!Array.isArray(stats)) {
      return res.status(400).json({
        success: false,
        message: 'Stats array is required'
      });
    }
    
    const { supabase } = await import('../services/supabase.service.js');
    
    // Use batch update for infrastructure stats
    for (const stat of stats) {
      await supabase
        .from('infrastructure_stats')
        .update({
          display_order: stat.display_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', stat.id);
    }
    
    res.status(200).json({
      success: true,
      message: 'Infrastructure stats order updated successfully'
    });
  } catch (error) {
    console.error('Bulk update infrastructure stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update infrastructure stats order'
    });
  }
});

// Bulk toggle active status
router.patch('/admin/images/bulk-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { imageIds, is_active } = req.body;
    
    if (!Array.isArray(imageIds) || typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Image IDs array and is_active boolean are required'
      });
    }
    
    const { supabase } = await import('../services/supabase.service.js');
    
    const { data, error } = await supabase
      .from('gallery_images')
      .update({
        is_active: is_active,
        updated_at: new Date().toISOString()
      })
      .in('id', imageIds);
    
    if (error) {
      throw error;
    }
    
    res.status(200).json({
      success: true,
      message: `${imageIds.length} images updated successfully`
    });
  } catch (error) {
    console.error('Bulk status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update image status'
    });
  }
});

// Get gallery statistics for admin dashboard
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { supabase } = await import('../services/supabase.service.js');
    
    // Get category stats
    const { data: activeCats } = await supabase
      .from('gallery_categories')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    const { data: inactiveCats } = await supabase
      .from('gallery_categories')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', false);
    
    // Get image stats
    const { data: activeImages } = await supabase
      .from('gallery_images')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    const { data: inactiveImages } = await supabase
      .from('gallery_images')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', false);
    
    // Get infrastructure stats
    const { data: activeStats } = await supabase
      .from('infrastructure_stats')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    // Get total storage
    const { data: storageData } = await supabase
      .from('gallery_images')
      .select('file_size');
    
    const totalStorage = storageData?.reduce((sum, img) => sum + (img.file_size || 0), 0) || 0;
    
    const stats = {
      active_categories: activeCats?.length || 0,
      inactive_categories: inactiveCats?.length || 0,
      active_images: activeImages?.length || 0,
      inactive_images: inactiveImages?.length || 0,
      active_stats: activeStats?.length || 0,
      total_storage_used: totalStorage
    };
    
    // Convert storage size to human readable format
    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    res.status(200).json({
      success: true,
      data: {
        categories: {
          active: parseInt(stats.active_categories),
          inactive: parseInt(stats.inactive_categories),
          total: parseInt(stats.active_categories) + parseInt(stats.inactive_categories)
        },
        images: {
          active: parseInt(stats.active_images),
          inactive: parseInt(stats.inactive_images),
          total: parseInt(stats.active_images) + parseInt(stats.inactive_images)
        },
        infrastructureStats: {
          active: parseInt(stats.active_stats),
          total: parseInt(stats.active_stats)
        },
        storage: {
          used: parseInt(stats.total_storage_used),
          formatted: formatBytes(parseInt(stats.total_storage_used))
        }
      }
    });
  } catch (error) {
    console.error('Get gallery stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery statistics'
    });
  }
});

export default router;