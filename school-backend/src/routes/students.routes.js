import express from 'express';
import { getAllStudents } from '../controllers/students.controller.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin only routes
router.get('/', authenticateToken, requireAdmin, getAllStudents);

export default router;