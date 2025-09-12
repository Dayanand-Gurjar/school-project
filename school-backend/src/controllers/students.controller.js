import { supabase } from '../services/supabase.service.js';

// Get all students (admin only)
export const getAllStudents = async (req, res) => {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('class', { ascending: true });

    if (error) {
      console.error('Get students error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch students'
      });
    }

    res.json({
      success: true,
      data: students
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};