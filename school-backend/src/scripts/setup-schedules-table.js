import 'dotenv/config';
import { supabase } from '../services/supabase.service.js';

async function setupSchedulesTable() {
  try {
    console.log('Setting up schedules table...');

    // SQL to create schedules table
    const createSchedulesTableSQL = `
      -- Schedules table for class timetable management
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        grade VARCHAR(10) NOT NULL,
        section VARCHAR(10) NOT NULL DEFAULT 'A',
        subject VARCHAR(100) NOT NULL,
        teacher_name VARCHAR(200) NOT NULL,
        teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        day VARCHAR(20) NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        room VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_schedules_grade ON schedules(grade);
      CREATE INDEX IF NOT EXISTS idx_schedules_teacher_id ON schedules(teacher_id);
      CREATE INDEX IF NOT EXISTS idx_schedules_teacher_name ON schedules(teacher_name);
      CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(day);
      CREATE INDEX IF NOT EXISTS idx_schedules_grade_section ON schedules(grade, section);

      -- Update trigger for updated_at
      CREATE OR REPLACE TRIGGER update_schedules_updated_at 
        BEFORE UPDATE ON schedules 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

      -- Add constraint to ensure start_time < end_time
      ALTER TABLE schedules 
        ADD CONSTRAINT check_time_order 
        CHECK (start_time < end_time);
    `;

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: createSchedulesTableSQL 
    });

    if (error) {
      console.error('Error creating schedules table:', error);
      
      // Try alternative approach - check if table exists
      console.log('Trying alternative approach...');
      
      const { data: tableData, error: tableError } = await supabase
        .from('schedules')
        .select('*')
        .limit(1);

      if (tableError && tableError.code === 'PGRST204') {
        console.log('Schedules table does not exist. You need to create it manually in Supabase.');
        console.log('\n📋 MANUAL SETUP REQUIRED:');
        console.log('1. Go to your Supabase Dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste the following SQL:');
        console.log('\n--- SQL TO EXECUTE ---');
        console.log(createSchedulesTableSQL);
        console.log('--- END SQL ---\n');
        return;
      }
    }

    console.log('✅ Schedules table setup completed!');

  } catch (error) {
    console.error('Schedules table setup failed:', error);
  }
}

setupSchedulesTable();