import 'dotenv/config';
import { supabase } from '../services/supabase.service.js';

async function setupDatabase() {
  try {
    console.log('Setting up database schema...');

    // SQL to create users table
    const createUsersTableSQL = `
      -- Users table for authentication and role management
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
        phone VARCHAR(20),
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

      -- Update trigger for updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE OR REPLACE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `;

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: createUsersTableSQL 
    });

    if (error) {
      console.error('Error creating database schema:', error);
      
      // Try alternative approach - create table directly
      console.log('Trying alternative approach...');
      
      const { data: tableData, error: tableError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (tableError && tableError.code === 'PGRST204') {
        console.log('Users table does not exist. You need to create it manually in Supabase.');
        console.log('\n📋 MANUAL SETUP REQUIRED:');
        console.log('1. Go to your Supabase Dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste the following SQL:');
        console.log('\n--- SQL TO EXECUTE ---');
        console.log(createUsersTableSQL);
        console.log('--- END SQL ---\n');
        return;
      }
    }

    console.log('✅ Database schema setup completed!');

  } catch (error) {
    console.error('Database setup failed:', error);
  }
}

setupDatabase();