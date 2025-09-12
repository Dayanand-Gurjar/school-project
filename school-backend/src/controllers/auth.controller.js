import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../services/supabase.service.js';

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

  try {
    const { email, password, firstName, lastName, role, phone } = req.body;

    console.log('📝 Extracted fields:', {
      email: email || 'MISSING',
      password: password ? '[PROVIDED]' : 'MISSING',
      firstName: firstName || 'MISSING',
      lastName: lastName || 'MISSING',
      role: role || 'MISSING',
      phone: phone || 'NOT PROVIDED'
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

    // Prepare user data
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
        status: newUser.status
      }
    };

    console.log('📤 Sending success response:', response);
    res.status(201).json(response);

  } catch (error) {
    console.log('❌ REGISTRATION EXCEPTION:', error);
    console.log('Stack trace:', error.stack);
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
        phone: user.phone
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
        phone: user.phone
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

    const { error } = await supabase
      .from('users')
      .update({ status: 'approved' })
      .eq('id', userId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to approve user'
      });
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