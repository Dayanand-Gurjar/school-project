import express from 'express';
import {
  createNotification,
  getAllNotifications,
  updateNotification,
  deleteNotification,
  getActiveNotifications
} from '../controllers/notifications.controller.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes - accessible without authentication
router.get('/active', getActiveNotifications);

// Admin routes - require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// CRUD operations for notifications (admin only)
router.post('/', createNotification);
router.get('/', getAllNotifications);
router.put('/:id', updateNotification);
router.delete('/:id', deleteNotification);

export default router;