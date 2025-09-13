import express from 'express';
import {
  register,
  login,
  verifyToken,
  getAllUsers,
  approveUser,
  rejectUser,
  updateProfile
} from '../controllers/auth.controller.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';
import { uploadProfilePicture, handleUploadError } from '../services/upload.service.js';

const router = express.Router();

// Public routes
router.post('/register', uploadProfilePicture, handleUploadError, register);
router.post('/login', login);

// Protected routes
router.get('/verify', authenticateToken, verifyToken);
router.put('/profile', authenticateToken, uploadProfilePicture, handleUploadError, updateProfile);

// Admin only routes
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.put('/users/:userId/approve', authenticateToken, requireAdmin, approveUser);
router.put('/users/:userId/reject', authenticateToken, requireAdmin, rejectUser);

export default router;