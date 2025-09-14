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
    const { email, password, firstName, lastName, role, phone, subject, grade, employeeId } = req.body;

    console.log('📝 Extracted fields:', {
      email: email || 'MISSING',
      password: password ? '[PROVIDED]' : 'MISSING',
      firstName: firstName || 'MISSING',
      lastName: lastName || 'MISSING',
      role: role || 'MISSING',
      phone: phone || 'NOT PROVIDED',
      subject: subject || 'NOT PROVIDED',
      grade: grade || 'NOT PROVIDED',
      employeeId: employeeId || 'NOT PROVIDED'
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
      .select('*')
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
      .select('*')
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
      .select('id, email, first_name, last_name, role, status, phone, created_at, last_login')
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

    // First, get the user details before approval
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (getUserError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Approve the user
    const { error: approveError } = await supabase
      .from('users')
      .update({ status: 'approved' })
      .eq('id', userId);

    if (approveError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to approve user'
      });
    }

    // If the approved user is a teacher, automatically add them to teachers table
    if (user.role === 'teacher') {
      await syncTeacherToTeachersTable(user);
    }

    // If the approved user is a student, automatically add them to students table
    if (user.role === 'student') {
      await syncStudentToStudentsTable(user);
    }

    res.json({
      success: true,
      message: 'User approved successfully'
    });

  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Helper function to sync approved teacher to teachers table
async function syncTeacherToTeachersTable(user) {
  try {
    console.log(`🔄 Syncing teacher ${user.first_name} ${user.last_name} to teachers table...`);
    
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

    // Check if teacher already exists
    const { data: existingTeacher, error: checkError } = await supabase
      .from('teachers')
      .select('*')
      .eq('name', teacherName)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // Table exists but teacher not found, try to insert with basic data first
      const { error: insertError } = await supabase
        .from('teachers')
        .insert([basicTeacherData]);

      if (insertError) {
        console.error('❌ Failed to sync teacher to teachers table:', insertError);
        return; // Exit if basic insert fails
      }

      console.log('✅ Teacher synced to teachers table with basic data');
      
      // Now try to update additional fields if they exist in the table
      await updateAdditionalTeacherFields(teacherName, user);
      
    } else if (existingTeacher) {
      console.log('ℹ️ Teacher already exists in teachers table, updating fields...');
      await updateAdditionalTeacherFields(teacherName, user);
    } else {
      console.log('✅ Teacher synced to teachers table successfully');
    }
    
  } catch (error) {
    console.error('❌ Error syncing teacher to teachers table:', error);
    // Don't throw error here, just log it - approval should still succeed
  }
}

// Helper function to update additional teacher fields if columns exist
async function updateAdditionalTeacherFields(teacherName, user) {
  try {
    // Try to update phone if column exists
    if (user.phone) {
      const { error: phoneError } = await supabase
        .from('teachers')
        .update({ phone: user.phone })
        .eq('name', teacherName);
      
      if (!phoneError) {
        console.log('✅ Updated teacher phone');
      }
    }

    // Try to update employee_id if column exists
    if (user.employee_id) {
      const { error: empError } = await supabase
        .from('teachers')
        .update({ employee_id: user.employee_id })
        .eq('name', teacherName);
      
      if (!empError) {
        console.log('✅ Updated teacher employee_id');
      }
    }

    // Try to update email if column exists
    if (user.email) {
      const { error: emailError } = await supabase
        .from('teachers')
        .update({ email: user.email })
        .eq('name', teacherName);
      
      if (!emailError) {
        console.log('✅ Updated teacher email');
      }
    }

    // Try to update profile picture fields if columns exist
    if (user.profile_picture_url) {
      const { error: profileError } = await supabase
        .from('teachers')
        .update({ profile_picture_url: user.profile_picture_url })
        .eq('name', teacherName);
      
      if (!profileError) {
        console.log('✅ Updated teacher profile picture URL');
      }
    }

    if (user.profile_picture_filename) {
      const { error: filenameError } = await supabase
        .from('teachers')
        .update({ profile_picture_filename: user.profile_picture_filename })
        .eq('name', teacherName);
      
      if (!filenameError) {
        console.log('✅ Updated teacher profile picture filename');
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating additional teacher fields:', error);
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
      .select('*')
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