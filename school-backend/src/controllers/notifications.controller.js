import { supabase } from '../services/supabase.service.js';

// Admin functions - Create, Read, Update, Delete notifications
const createNotification = async (req, res) => {
  try {
    const { title, message, type = 'info', end_date } = req.body;
    const created_by = req.user.id;

    if (!title || !message || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Title, message, and end date are required'
      });
    }

    // Validate end_date is in the future
    const endDate = new Date(end_date);
    if (endDate <= new Date()) {
      return res.status(400).json({
        success: false,
        error: 'End date must be in the future'
      });
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        title,
        message,
        type,
        end_date,
        created_by,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create notification'
      });
    }

    res.status(201).json({
      success: true,
      data,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('Error in createNotification:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        users:created_by (
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch notifications'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in getAllNotifications:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, type, end_date, is_active } = req.body;

    if (!title || !message || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Title, message, and end date are required'
      });
    }

    // Validate end_date if being updated
    if (end_date) {
      const endDate = new Date(end_date);
      if (endDate <= new Date()) {
        return res.status(400).json({
          success: false,
          error: 'End date must be in the future'
        });
      }
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({
        title,
        message,
        type,
        end_date,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating notification:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update notification'
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data,
      message: 'Notification updated successfully'
    });
  } catch (error) {
    console.error('Error in updateNotification:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete notification'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Public function - Get active notifications for display
const getActiveNotifications = async (req, res) => {
  try {
    const now = new Date();
    
    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, message, type, start_date, end_date')
      .eq('is_active', true)
      .lte('start_date', now.toISOString())
      .gte('end_date', now.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active notifications:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch notifications'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in getActiveNotifications:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export {
  createNotification,
  getAllNotifications,
  updateNotification,
  deleteNotification,
  getActiveNotifications
};