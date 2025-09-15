 import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../services/supabase.service.js';
import { uploadProfilePictureToSupabase, deleteProfilePicture, getProfilePictureUrl } from '../services/upload.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'school-management-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Register new user
export const register = async (req, res) => {
  console.log('🔥 REGISTRATION REQUEST RECEIVED');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('Uploaded file:', req.file ? req.file.filename : 'No file uploaded');

  try {
    const { email, password, firstName, lastName, role, phone, subject, grade, employeeId, qualification } = req.body;

    console.log('📝 Extracted fields:', {
      email: email || 'MISSING',
      password: password ? '[PROVIDED]' : 'MISSING',
      firstName: firstName || 'MISSING',
      lastName: lastName || 'MISSING',
      role: role || 'MISSING',
      phone: phone || 'NOT PROVIDED',
      subject: subject || 'NOT PROVIDED',
      grade: grade || 'NOT PROVIDED',
      employeeId: employeeId || 'NOT PROVIDED',
      qualification: qualification || 'NOT PROVIDED'
    });

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      console.log('❌ VALIDATION FAILED - Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
        details: {
          email: !email ? 'required' : 'provided',
          password: !password ? 'required' : 'provided',
          firstName: !firstName ? 'required' : 'provided',
          lastName: !lastName ? 'required' : 'provided',
          role: !role ? 'required' : 'provided'
        }
      });
    }

    console.log('✅ Field validation passed');

    // Check if user already exists
    console.log('🔍 Checking if user exists with email:', email);
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.log('❌ DATABASE ERROR during user check:', checkError);
      return res.status(500).json({
        success: false,
        error: 'Database error during user check',
        details: checkError
      });
    }

    if (existingUser) {
      console.log('❌ USER ALREADY EXISTS:', existingUser.id);
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    console.log('✅ User does not exist, proceeding with registration');

    // Hash password
    console.log('🔐 Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('✅ Password hashed successfully');

    // Prepare user data with additional fields for teachers and students
    const userData = {
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      role,
      phone: phone || null,
      status: role === 'admin' ? 'approved' : 'pending',
      created_at: new Date().toISOString()
    };

    // Add profile picture data if file was uploaded
    if (req.file) {
      console.log('📸 Uploading profile picture to Supabase...');
      const uploadResult = await uploadProfilePictureToSupabase(req.file);
      
      if (uploadResult.success) {
        userData.profile_picture_filename = uploadResult.data.path;
        userData.profile_picture_url = uploadResult.data.url;
        console.log('✅ Profile picture uploaded to Supabase:', userData.profile_picture_url);
      } else {
        console.error('❌ Failed to upload profile picture:', uploadResult.error);
        return res.status(500).json({
          success: false,
          error: 'Failed to upload profile picture: ' + uploadResult.error
        });
      }
    }

    // Add role-specific fields
    if (role === 'teacher' && subject) {
      userData.subject = subject;
    }
    if (role === 'teacher' && employeeId) {
      userData.employee_id = employeeId;
    }
    if (role === 'teacher' && qualification) {
      userData.qualification = qualification;
    }
    if (role === 'student' && grade) {
      userData.grade = grade;
    }

    console.log('📦 User data to insert:', {
      ...userData,
      password: '[HASHED]'
    });

    // Insert new user
    console.log('💾 Inserting user into database...');
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.log('❌ DATABASE INSERT ERROR:', JSON.stringify(error, null, 2));
      return res.status(500).json({
        success: false,
        error: 'Failed to create user account',
        details: error
      });
    }

    console.log('✅ USER CREATED SUCCESSFULLY:', {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status
    });

    const response = {
      success: true,
      message: role === 'admin'
        ? 'Admin account created successfully'
        : 'Registration successful. Your account is pending admin approval.',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role,
        status: newUser.status,
        profilePictureUrl: newUser.profile_picture_url
      }
    };

    console.log('📤 Sending success response:', response);
    res.status(201).json(response);

  } catch (error) {
    console.log('❌ REGISTRATION EXCEPTION:', error);
    console.log('Stack trace:', error.stack);
    
    // If there was an error and a file was uploaded, clean it up
    if (req.file) {
      deleteProfilePicture(req.file.filename);
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, email, password, first_name, last_name, role, phone, status,
        subject, employee_id, grade,
        profile_picture_url, profile_picture_filename,
        created_at, updated_at, last_login
      `)
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user is approved
    if (user.status !== 'approved') {
      const message = user.status === 'pending' 
        ? 'Your account is pending admin approval' 
        : 'Your account has been rejected. Please contact administration.';
      
      return res.status(403).json({
        success: false,
        error: message
      });
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        status: user.status,
        phone: user.phone,
        profilePictureUrl: user.profile_picture_url
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Verify token and get current user
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get fresh user data
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, email, first_name, last_name, role, phone, status,
        subject, employee_id, grade,
        profile_picture_url, profile_picture_filename,
        created_at, updated_at, last_login
      `)
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        status: user.status,
        phone: user.phone,
        profilePictureUrl: user.profile_picture_url
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id, email, first_name, last_name, role, status, phone, created_at, last_login,
        subject, employee_id, grade, qualification,
        profile_picture_url, profile_picture_filename
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      });
    }

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      name: `${user.first_name} ${user.last_name}`,
      role: user.role,
      status: user.status,
      phone: user.phone,
      subject: user.subject,
      grade: user.grade,
      qualification: user.qualification,
      profile_picture_url: user.profile_picture_url,
      profilePictureUrl: user.profile_picture_url, // Also provide camelCase version for compatibility
      createdAt: user.created_at,
      lastLogin: user.last_login
    }));

    res.json({
      success: true,
      data: formattedUsers
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Approve user (admin only)
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔄 Starting approval process for user ID:', userId);

    // First, get the user details before approval
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select(`
        id, email, first_name, last_name, role, phone, status,
        subject, employee_id, grade, qualification,
        profile_picture_url, profile_picture_filename,
        created_at, updated_at, last_login
      `)
      .eq('id', userId)
      .single();

    if (getUserError || !user) {
      console.error('❌ User not found for ID:', userId, 'Error:', getUserError);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      subject: user.subject || 'N/A',
      employee_id: user.employee_id || 'N/A',
      qualification: user.qualification || 'COLUMN MISSING IN USERS TABLE'
    });

    // Approve the user
    console.log('🔄 Updating user status to approved...');
    const { error: approveError } = await supabase
      .from('users')
      .update({ status: 'approved' })
      .eq('id', userId);

    if (approveError) {
      console.error('❌ Failed to approve user in database:', approveError);
      return res.status(500).json({
        success: false,
        error: 'Failed to approve user in database',
        details: approveError
      });
    }

    console.log('✅ User status updated to approved');

    // If the approved user is a teacher, automatically add them to teachers table
    if (user.role === 'teacher') {
      console.log('🔄 User is a teacher, syncing to teachers table...');
      try {
        await syncTeacherToTeachersTable(user);
        console.log('✅ Teacher sync completed successfully');
      } catch (syncError) {
        console.error('❌ Teacher sync failed:', syncError);
        // Don't fail the entire approval if sync fails
        console.log('⚠️ Continuing with approval despite sync failure');
      }
    }

    // If the approved user is a student, automatically add them to students table
    if (user.role === 'student') {
      console.log('🔄 User is a student, syncing to students table...');
      try {
        await syncStudentToStudentsTable(user);
        console.log('✅ Student sync completed successfully');
      } catch (syncError) {
        console.error('❌ Student sync failed:', syncError);
        // Don't fail the entire approval if sync fails
        console.log('⚠️ Continuing with approval despite sync failure');
      }
    }

    console.log('🎉 User approval process completed successfully');
    res.json({
      success: true,
      message: 'User approved successfully'
    });

  } catch (error) {
    console.error('💥 Approve user critical error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

// Helper function to sync approved teacher to teachers table
async function syncTeacherToTeachersTable(user) {
  try {
    console.log(`🔄 Syncing teacher ${user.first_name} ${user.last_name} to teachers table...`);
    console.log('📋 Teacher data to sync:', {
      name: `${user.first_name} ${user.last_name}`,
      subject: user.subject || 'N/A',
      employee_id: user.employee_id || 'N/A',
      qualification: user.qualification || 'MISSING FROM USERS TABLE',
      email: user.email,
      phone: user.phone,
      profile_picture_url: user.profile_picture_url,
      profile_picture_filename: user.profile_picture_filename
    });
    
    const teacherName = `${user.first_name} ${user.last_name}`;
    
    // Start with basic required data (name and subject are most likely to exist)
    const basicTeacherData = {
      name: teacherName,
      subject: user.subject || ''
    };

    // Add profile picture data if available
    if (user.profile_picture_url) {
      basicTeacherData.profile_picture_url = user.profile_picture_url;
    }
    if (user.profile_picture_filename) {
      basicTeacherData.profile_picture_filename = user.profile_picture_filename;
    }

    console.log('📦 Basic teacher data to insert:', basicTeacherData);

    // Check if teacher already exists
    console.log('🔍 Checking if teacher already exists...');
    const { data: existingTeacher, error: checkError } = await supabase
      .from('teachers')
      .select('*')
      .eq('name', teacherName)
      .single();

    console.log('🔍 Check result - Error:', checkError, 'Existing teacher:', existingTeacher);

    if (checkError && checkError.code !== 'PGRST116') {
      console.log('❌ Error checking teacher existence:', checkError);
      throw new Error(`Failed to check teacher existence: ${checkError.message}`);
    }

    if (!existingTeacher) {
      // Teacher not found, try to insert with basic data first
      console.log('➕ Teacher not found, inserting new teacher...');
      const { data: insertData, error: insertError } = await supabase
        .from('teachers')
        .insert([basicTeacherData])
        .select();

      if (insertError) {
        console.error('❌ Failed to insert teacher to teachers table:', insertError);
        console.error('Insert error details:', JSON.stringify(insertError, null, 2));
        throw new Error(`Failed to insert teacher: ${insertError.message}`);
      }

      console.log('✅ Teacher inserted successfully:', insertData);
      
      // Now try to update additional fields if they exist in the table
      console.log('🔄 Updating additional teacher fields...');
      await updateAdditionalTeacherFields(teacherName, user);
      
    } else {
      console.log('ℹ️ Teacher already exists in teachers table, updating fields...');
      await updateAdditionalTeacherFields(teacherName, user);
    }
    
    console.log('✅ Teacher sync completed successfully');
    
  } catch (error) {
    console.error('💥 Critical error syncing teacher to teachers table:', error);
    console.error('Stack trace:', error.stack);
    throw error; // Re-throw so we can catch it in the approval function
  }
}

// Helper function to update additional teacher fields if columns exist
async function updateAdditionalTeacherFields(teacherName, user) {
  try {
    console.log('🔄 Updating additional fields for teacher:', teacherName);
    
    const fieldsToUpdate = [
      { name: 'phone', value: user.phone },
      { name: 'employee_id', value: user.employee_id },
      { name: 'email', value: user.email },
      { name: 'qualification', value: user.qualification || null },
      { name: 'profile_picture_url', value: user.profile_picture_url },
      { name: 'profile_picture_filename', value: user.profile_picture_filename }
    ];

    for (const field of fieldsToUpdate) {
      if (field.value) {
        console.log(`🔄 Updating ${field.name} with value:`, field.value);
        const updateData = {};
        updateData[field.name] = field.value;
        
        const { data: updateResult, error: updateError } = await supabase
          .from('teachers')
          .update(updateData)
          .eq('name', teacherName)
          .select();
        
        if (updateError) {
          console.error(`❌ Failed to update ${field.name}:`, updateError);
          console.error(`Update error details for ${field.name}:`, JSON.stringify(updateError, null, 2));
        } else {
          console.log(`✅ Updated teacher ${field.name} successfully`);
        }
      } else {
        console.log(`⏭️ Skipping ${field.name} - no value provided`);
      }
    }
    
  } catch (error) {
    console.error('💥 Critical error updating additional teacher fields:', error);
    console.error('Stack trace:', error.stack);
    // Don't throw - this is just for additional fields
  }
}

// Helper function to sync approved student to students table
async function syncStudentToStudentsTable(user) {
  try {
    console.log(`🔄 Syncing student ${user.first_name} ${user.last_name} to students table...`);
    
    const studentName = `${user.first_name} ${user.last_name}`;
    
    // Start with basic required data (name is guaranteed to exist)
    const basicStudentData = {
      name: studentName
    };

    // Add profile picture data if available
    if (user.profile_picture_url) {
      basicStudentData.profile_picture_url = user.profile_picture_url;
    }
    if (user.profile_picture_filename) {
      basicStudentData.profile_picture_filename = user.profile_picture_filename;
    }

    // Check if student already exists (try by name first, then email if available)
    let existingStudent = null;
    let checkError = null;
    
    // Try to find by name first
    const { data: studentByName, error: nameError } = await supabase
      .from('students')
      .select('*')
      .eq('name', studentName)
      .single();

    if (!nameError && studentByName) {
      existingStudent = studentByName;
    } else if (nameError && nameError.code !== 'PGRST116') {
      checkError = nameError;
    }

    if (checkError) {
      console.error('❌ Failed to check student existence:', checkError);
      return;
    }

    if (!existingStudent) {
      // Student not found, insert new student with basic data
      const { error: insertError } = await supabase
        .from('students')
        .insert([basicStudentData]);

      if (insertError) {
        console.error('❌ Failed to sync student to students table:', insertError);
        return; // Exit if basic insert fails
      }

      console.log('✅ Student synced to students table with basic data');
    } else {
      console.log('ℹ️ Student already exists in students table, updating fields...');
    }
    
    // Now try to update additional fields if they exist in the table
    await updateAdditionalStudentFields(studentName, user);
    
  } catch (error) {
    console.error('❌ Error syncing student to students table:', error);
    // Don't throw error here, just log it - approval should still succeed
  }
}

// Helper function to update additional student fields if columns exist
async function updateAdditionalStudentFields(studentName, user) {
  try {
    // Try to update email if column exists
    if (user.email) {
      const { error: emailError } = await supabase
        .from('students')
        .update({ email: user.email })
        .eq('name', studentName);
      
      if (!emailError) {
        console.log('✅ Updated student email');
      }
    }

    // Try to update phone if column exists
    if (user.phone) {
      const { error: phoneError } = await supabase
        .from('students')
        .update({ phone: user.phone })
        .eq('name', studentName);
      
      if (!phoneError) {
        console.log('✅ Updated student phone');
      }
    }

    // Try to update class/grade if column exists
    if (user.grade || user.class) {
      const { error: classError } = await supabase
        .from('students')
        .update({ class: user.grade || user.class })
        .eq('name', studentName);
      
      if (!classError) {
        console.log('✅ Updated student class');
      }
    }

    // Try to update profile picture fields if columns exist
    if (user.profile_picture_url) {
      const { error: profileError } = await supabase
        .from('students')
        .update({ profile_picture_url: user.profile_picture_url })
        .eq('name', studentName);
      
      if (!profileError) {
        console.log('✅ Updated student profile picture URL');
      }
    }

    if (user.profile_picture_filename) {
      const { error: filenameError } = await supabase
        .from('students')
        .update({ profile_picture_filename: user.profile_picture_filename })
        .eq('name', studentName);
      
      if (!filenameError) {
        console.log('✅ Updated student profile picture filename');
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating additional student fields:', error);
    // Don't throw - this is just for additional fields
  }
}

// Reject user (admin only)
export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const { error } = await supabase
      .from('users')
      .update({ status: 'rejected' })
      .eq('id', userId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to reject user'
      });
    }

    res.json({
      success: true,
      message: 'User rejected successfully'
    });

  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { first_name, last_name, phone } = req.body;

    console.log('📝 Profile update request for user:', userId);
    console.log('Update data:', { first_name, last_name, phone });
    console.log('File uploaded:', req.file ? req.file.filename : 'No file');

    // Get current user
    const { data: currentUser, error: getCurrentError } = await supabase
      .from('users')
      .select(`
        id, email, first_name, last_name, role, phone, status,
        subject, employee_id, grade,
        profile_picture_url, profile_picture_filename,
        created_at, updated_at, last_login
      `)
      .eq('id', userId)
      .single();

    if (getCurrentError || !currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prepare update data
    const updateData = {};
    
    if (first_name && first_name.trim()) {
      updateData.first_name = first_name.trim();
    }
    
    if (last_name && last_name.trim()) {
      updateData.last_name = last_name.trim();
    }
    
    if (phone !== undefined) {
      updateData.phone = phone || null;
    }

    // Handle profile picture update
    if (req.file) {
      // Delete old profile picture if it exists
      if (currentUser.profile_picture_filename) {
        await deleteProfilePicture(currentUser.profile_picture_filename);
      }
      
      const uploadResult = await uploadProfilePictureToSupabase(req.file);
      
      if (uploadResult.success) {
        updateData.profile_picture_filename = uploadResult.data.path;
        updateData.profile_picture_url = uploadResult.data.url;
      } else {
        console.error('Failed to upload profile picture:', uploadResult.error);
        return res.status(500).json({
          success: false,
          error: 'Failed to upload profile picture: ' + uploadResult.error
        });
      }
    }

    // Update user in database
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update user:', updateError);
      // Clean up uploaded file if database update failed
      if (req.file && updateData.profile_picture_filename) {
        deleteProfilePicture(updateData.profile_picture_filename);
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }

    // Also sync updates to related tables if applicable
    if (currentUser.role === 'teacher' && currentUser.status === 'approved') {
      await syncUpdatedTeacherData(updatedUser);
    }
    
    if (currentUser.role === 'student' && currentUser.status === 'approved') {
      await syncUpdatedStudentData(updatedUser);
    }

    console.log('✅ Profile updated successfully');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        name: `${updatedUser.first_name} ${updatedUser.last_name}`,
        role: updatedUser.role,
        status: updatedUser.status,
        phone: updatedUser.phone,
        profilePictureUrl: updatedUser.profile_picture_url
      }
    });

  } catch (error) {
    console.error('❌ Profile update error:', error);
    // Clean up uploaded file if there was an error
    if (req.file) {
      deleteProfilePicture(req.file.filename);
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Helper function to sync updated teacher data
async function syncUpdatedTeacherData(user) {
  try {
    const teacherName = `${user.first_name} ${user.last_name}`;
    
    const updateData = {
      name: teacherName
    };

    if (user.phone) updateData.phone = user.phone;
    if (user.email) updateData.email = user.email;
    if (user.qualification) updateData.qualification = user.qualification;
    if (user.profile_picture_url) updateData.profile_picture_url = user.profile_picture_url;
    if (user.profile_picture_filename) updateData.profile_picture_filename = user.profile_picture_filename;

    // Try to update by current name first
    let { data: nameResult, error } = await supabase
      .from('teachers')
      .update(updateData)
      .eq('name', teacherName)
      .select();

    if (error || !nameResult || nameResult.length === 0) {
      // Try with email if name update failed
      const { data: emailResult, error: emailError } = await supabase
        .from('teachers')
        .update(updateData)
        .eq('email', user.email)
        .select();
      
      if (!emailError && emailResult && emailResult.length > 0) {
        console.log('Teacher data synced via email');
      } else {
        // Try to insert the teacher if they don't exist
        const { data: insertResult, error: insertError } = await supabase
          .from('teachers')
          .insert([updateData])
          .select();
        
        if (insertError) {
          console.error('Error creating teacher record:', insertError);
        }
      }
    }

  } catch (error) {
    console.error('Error syncing teacher data:', error);
  }
}

// Helper function to sync updated student data
async function syncUpdatedStudentData(user) {
  try {
    const studentName = `${user.first_name} ${user.last_name}`;
    
    const updateData = {
      name: studentName
    };

    if (user.phone) updateData.phone = user.phone;
    if (user.email) updateData.email = user.email;
    if (user.profile_picture_url) updateData.profile_picture_url = user.profile_picture_url;
    if (user.profile_picture_filename) updateData.profile_picture_filename = user.profile_picture_filename;

    // Try to update by current name first
    let { error } = await supabase
      .from('students')
      .update(updateData)
      .eq('name', studentName);

    if (error) {
      // Try with email if name update failed
      const { error: emailError } = await supabase
        .from('students')
        .update(updateData)
        .eq('email', user.email);
      
      if (!emailError) {
        console.log('✅ Student data synced via email');
      }
    } else {
      console.log('✅ Student data synced via name');
    }

  } catch (error) {
    console.error('❌ Error syncing student data:', error);
  }
}

// Update user (admin only)
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    console.log('🔄 Admin updating user:', userId);
    console.log('📝 Update data:', updateData);
    console.log('📸 Uploaded file:', req.file ? req.file.filename : 'No file');

    // Get current user data
    const { data: currentUser, error: getCurrentError } = await supabase
      .from('users')
      .select(`
        id, email, first_name, last_name, role, phone, status,
        subject, employee_id, grade, qualification,
        profile_picture_url, profile_picture_filename,
        created_at, updated_at, last_login
      `)
      .eq('id', userId)
      .single();

    if (getCurrentError || !currentUser) {
      console.error('❌ User not found:', getCurrentError);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prepare update data with proper field mappings
    const userUpdateData = {};
    
    if (updateData.firstName && updateData.firstName.trim()) {
      userUpdateData.first_name = updateData.firstName.trim();
    }
    
    if (updateData.lastName && updateData.lastName.trim()) {
      userUpdateData.last_name = updateData.lastName.trim();
    }
    
    if (updateData.email && updateData.email.trim()) {
      userUpdateData.email = updateData.email.trim();
    }
    
    if (updateData.phone !== undefined) {
      userUpdateData.phone = updateData.phone || null;
    }
    
    if (updateData.status) {
      userUpdateData.status = updateData.status;
    }
    
    // Role-specific fields
    if (updateData.grade !== undefined) {
      userUpdateData.grade = updateData.grade || null;
    }
    
    if (updateData.subject !== undefined) {
      userUpdateData.subject = updateData.subject || null;
    }
    
    if (updateData.qualification !== undefined) {
      userUpdateData.qualification = updateData.qualification || null;
    }

    // Handle profile picture update
    if (req.file) {
      // Delete old profile picture if it exists
      if (currentUser.profile_picture_filename) {
        await deleteProfilePicture(currentUser.profile_picture_filename);
      }
      
      const uploadResult = await uploadProfilePictureToSupabase(req.file);
      
      if (uploadResult.success) {
        userUpdateData.profile_picture_filename = uploadResult.data.path;
        userUpdateData.profile_picture_url = uploadResult.data.url;
        console.log('✅ Profile picture uploaded successfully:', uploadResult.data.url);
      } else {
        console.error('❌ Failed to upload profile picture:', uploadResult.error);
        return res.status(500).json({
          success: false,
          error: 'Failed to upload profile picture: ' + uploadResult.error
        });
      }
    }

    console.log('📦 Prepared update data:', userUpdateData);

    // Update user in database
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(userUpdateData)
      .eq('id', userId)
      .select(`
        id, email, first_name, last_name, role, phone, status,
        subject, employee_id, grade, qualification,
        profile_picture_url, profile_picture_filename,
        created_at, updated_at, last_login
      `)
      .single();

    if (updateError) {
      console.error('❌ Failed to update user:', updateError);
      // Clean up uploaded file if database update failed
      if (req.file && userUpdateData.profile_picture_filename) {
        deleteProfilePicture(userUpdateData.profile_picture_filename);
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to update user',
        details: updateError
      });
    }

    console.log('✅ User updated successfully');

    // Also sync updates to related tables if applicable
    if (currentUser.role === 'teacher' && currentUser.status === 'approved') {
      try {
        await syncUpdatedTeacherData(updatedUser);
        console.log('✅ Teacher data synced');
      } catch (syncError) {
        console.error('❌ Failed to sync teacher data:', syncError);
      }
    }
    
    if (currentUser.role === 'student' && currentUser.status === 'approved') {
      try {
        await syncUpdatedStudentData(updatedUser);
        console.log('✅ Student data synced');
      } catch (syncError) {
        console.error('❌ Failed to sync student data:', syncError);
      }
    }

    // Return formatted user data
    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        name: `${updatedUser.first_name} ${updatedUser.last_name}`,
        role: updatedUser.role,
        status: updatedUser.status,
        phone: updatedUser.phone,
        grade: updatedUser.grade,
        subject: updatedUser.subject,
        qualification: updatedUser.qualification,
        profilePictureUrl: updatedUser.profile_picture_url,
        profile_picture_url: updatedUser.profile_picture_url, // Also provide snake_case for consistency
        createdAt: updatedUser.created_at,
        lastLogin: updatedUser.last_login
      }
    });

  } catch (error) {
    console.error('💥 Update user critical error:', error);
    console.error('Stack trace:', error.stack);
    // Clean up uploaded file if there was an error
    if (req.file) {
      deleteProfilePicture(req.file.filename);
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

// Delete User - Admin only
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🗑️ Admin ${req.user.id} attempting to delete user ${userId}`);

    // Validate userId
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    // Check if user exists and get their role
    const { data: userToDelete, error: getUserError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role')
      .eq('id', userId)
      .single();

    if (getUserError || !userToDelete) {
      console.error('❌ User not found for ID:', userId, 'Error:', getUserError);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    console.log('👤 User to delete:', {
      id: userToDelete.id,
      name: `${userToDelete.first_name} ${userToDelete.last_name}`,
      email: userToDelete.email,
      role: userToDelete.role
    });

    // Delete from related tables based on role
    try {
      if (userToDelete.role === 'student') {
        console.log('🔄 Deleting from students table...');
        const { error: studentError } = await supabase
          .from('students')
          .delete()
          .eq('name', `${userToDelete.first_name} ${userToDelete.last_name}`);
        
        if (studentError) {
          console.error('❌ Error deleting from students table:', studentError);
        } else {
          console.log('✅ Deleted from students table');
        }
      } else if (userToDelete.role === 'teacher') {
        console.log('🔄 Deleting from teachers table...');
        const { error: teacherError } = await supabase
          .from('teachers')
          .delete()
          .eq('name', `${userToDelete.first_name} ${userToDelete.last_name}`);
        
        if (teacherError) {
          console.error('❌ Error deleting from teachers table:', teacherError);
        } else {
          console.log('✅ Deleted from teachers table');
        }

        // Also delete any schedules assigned to this teacher
        console.log('🔄 Deleting teacher schedules...');
        const { error: scheduleError } = await supabase
          .from('schedules')
          .delete()
          .eq('teacher', `${userToDelete.first_name} ${userToDelete.last_name}`);
        
        if (scheduleError) {
          console.error('❌ Error deleting teacher schedules:', scheduleError);
        } else {
          console.log('✅ Deleted teacher schedules');
        }
      }

      // Delete from users table
      console.log('🔄 Deleting from users table...');
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        console.error('❌ Error deleting user:', deleteError);
        return res.status(500).json({
          success: false,
          error: 'Failed to delete user from database',
          details: deleteError
        });
      }

      console.log(`✅ User ${userToDelete.first_name} ${userToDelete.last_name} (${userToDelete.email}) deleted successfully`);

      res.json({
        success: true,
        message: `User ${userToDelete.first_name} ${userToDelete.last_name} deleted successfully`,
        data: {
          deletedUser: {
            id: userToDelete.id,
            name: `${userToDelete.first_name} ${userToDelete.last_name}`,
            email: userToDelete.email,
            role: userToDelete.role
          }
        }
      });

    } catch (relatedTableError) {
      console.error('❌ Error deleting from related tables:', relatedTableError);
      // Continue with user deletion even if related table deletion fails
      
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to delete user',
          details: deleteError
        });
      }

      res.json({
        success: true,
        message: `User ${userToDelete.first_name} ${userToDelete.last_name} deleted successfully (with warnings)`,
        data: {
          deletedUser: {
            id: userToDelete.id,
            name: `${userToDelete.first_name} ${userToDelete.last_name}`,
            email: userToDelete.email,
            role: userToDelete.role
          }
        }
      });
    }

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};