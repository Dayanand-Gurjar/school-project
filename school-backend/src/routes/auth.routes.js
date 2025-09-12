import express from 'express';
import { 
  register, 
  login, 
  verifyToken, 
  getAllUsers, 
  approveUser, 
  rejectUser 
} from '../controllers/auth.controller.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/verify', authenticateToken, verifyToken);

// Admin only routes
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.put('/users/:userId/approve', authenticateToken, requireAdmin, approveUser);
router.put('/users/:userId/reject', authenticateToken, requireAdmin, rejectUser);

export default router;