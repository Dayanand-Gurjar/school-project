import express from 'express';
import { 
  createSchedule, 
  getSchedules, 
  updateSchedule, 
  deleteSchedule, 
  getScheduleStats 
} from '../controllers/admin.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Middleware to require admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin role required.'
    });
  }
  next();
};

// Schedule management routes
router.post('/schedules', authenticateToken, requireAdmin, createSchedule);
router.get('/schedules', authenticateToken, requireAdmin, getSchedules);
router.get('/schedules/stats', authenticateToken, requireAdmin, getScheduleStats);
router.put('/schedules/:id', authenticateToken, requireAdmin, updateSchedule);
router.delete('/schedules/:id', authenticateToken, requireAdmin, deleteSchedule);

export default router;