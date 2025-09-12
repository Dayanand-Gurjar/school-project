import jwt from 'jsonwebtoken';
import { supabase } from '../services/supabase.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'school-management-secret-key';

// Middleware to authenticate JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, status')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token - user not found'
      });
    }

    if (user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        error: 'Account not approved'
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      status: user.status
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Middleware to require admin role
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization failed'
    });
  }
};

// Middleware to require teacher or admin role
export const requireTeacherOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!['admin', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Teacher or admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Teacher/Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization failed'
    });
  }
};

// Middleware to check if user owns the resource or is admin
export const requireOwnershipOrAdmin = (userIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const resourceUserId = req.params[userIdField] || req.body[userIdField];
      
      // Admin can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      // User can only access their own resources
      if (req.user.id.toString() !== resourceUserId.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied - you can only access your own resources'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authorization failed'
      });
    }
  };
};