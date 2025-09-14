import { supabase } from '../services/supabase.service.js';

// Get all teachers (admin only)
export const getAllTeachers = async (req, res) => {
  try {
    // First try to get teachers from the teachers table
    const { data: teachersFromTable, error: teachersError } = await supabase
      .from('teachers')
      .select('*')
      .order('name', { ascending: true });

    // Also get teachers from users table where role = 'teacher'
    const { data: teachersFromUsers, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, phone, profile_picture_url, subject')
      .eq('role', 'teacher')
      .eq('status', 'approved')
      .order('first_name', { ascending: true });

    let allTeachers = [];

    // Add teachers from teachers table if it exists and has data
    if (!teachersError && teachersFromTable) {
      allTeachers = teachersFromTable.map(t => ({
        id: t.id,
        name: t.name,
        subject: t.subject,
        email: t.email || '',
        phone: t.phone || '',
        profile_picture: t.profile_picture_url || null
      }));
    }

    // Add teachers from users table, avoiding duplicates
    if (!usersError && teachersFromUsers) {
      const existingEmails = new Set(allTeachers.map(t => t.email));
      
      const usersTeachers = teachersFromUsers
        .filter(u => !existingEmails.has(u.email))
        .map(u => ({
          id: u.id,
          name: `${u.first_name} ${u.last_name}`,
          subject: u.subject || '', // Get subject from users table
          email: u.email,
          phone: u.phone || '',
          profile_picture: u.profile_picture_url || null
        }));
      
      allTeachers = [...allTeachers, ...usersTeachers];
    }

    // If both queries failed, return error
    if (teachersError && usersError) {
      console.error('Get teachers error:', { teachersError, usersError });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch teachers'
      });
    }

    res.json({
      success: true,
      data: allTeachers
    });

  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};