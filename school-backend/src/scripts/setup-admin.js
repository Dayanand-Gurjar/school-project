import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { supabase } from '../services/supabase.service.js';

async function setupAdminUser() {
  try {
    console.log('Setting up admin user...');

    // Check if admin user already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@school.com')
      .single();

    if (existingAdmin) {
      console.log('Admin user already exists!');
      return;
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Create admin user
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: 'admin@school.com',
        password: hashedPassword,
        first_name: 'School',
        last_name: 'Administrator',
        role: 'admin',
        status: 'approved',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating admin user:', error);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@school.com');
    console.log('Password: admin123');
    console.log('User ID:', data.id);

  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupAdminUser();