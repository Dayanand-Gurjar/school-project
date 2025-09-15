import { supabase } from '../services/supabase.service.js';

export const getPublicTeachers = async (req, res) => {
  try {
    // Get approved teachers from teachers table with basic information for public display
    const { data: teachersFromTable, error: teachersError } = await supabase
      .from('teachers')
      .select('id, name, subject, qualification, phone, email, profile_picture_url')
      .order('name', { ascending: true });

    // Get approved teachers from users table (using correct column names)
    const { data: teachersFromUsers, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, phone, profile_picture_url, subject, qualification')
      .eq('role', 'teacher')
      .eq('status', 'approved')
      .order('first_name', { ascending: true });

    let allTeachers = [];

    // Add teachers from teachers table if it exists and has data
    if (!teachersError && teachersFromTable) {
      allTeachers = teachersFromTable.map(t => ({
        id: t.id,
        name: t.name,
        subject: t.subject || '',
        qualification: t.qualification || '',
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
          subject: u.subject || '',
          qualification: u.qualification || '',
          email: u.email,
          phone: u.phone || '',
          profile_picture: u.profile_picture_url || null
        }));
      
      allTeachers = [...allTeachers, ...usersTeachers];
    }
    
    res.json({
      success: true,
      data: allTeachers
    });
  } catch (error) {
    console.error('Error fetching public teachers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch teachers'
    });
  }
};