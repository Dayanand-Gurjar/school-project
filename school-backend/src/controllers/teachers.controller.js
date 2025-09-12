import { supabase } from '../services/supabase.service.js';

// Get all teachers (admin only)
export const getAllTeachers = async (req, res) => {
  try {
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Get teachers error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch teachers'
      });
    }

    res.json({
      success: true,
      data: teachers
    });

  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};