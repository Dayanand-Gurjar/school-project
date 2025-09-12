import express from 'express';
import { getAllTeachers } from '../controllers/teachers.controller.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin only routes
router.get('/', authenticateToken, requireAdmin, getAllTeachers);

export default router;