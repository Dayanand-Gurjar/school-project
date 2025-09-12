import express from 'express';
import { 
  getTeacherSchedule, 
  getTeacherLeaveRequests, 
  submitLeaveRequest,
  getTeacherStudents 
} from '../controllers/teacher.controller.js';
import { authenticateToken, requireTeacherOrAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Teacher dashboard routes - teachers can access their own data
router.get('/schedule', authenticateToken, requireTeacherOrAdmin, getTeacherSchedule);
router.get('/leave-requests', authenticateToken, requireTeacherOrAdmin, getTeacherLeaveRequests);
router.post('/leave-request', authenticateToken, requireTeacherOrAdmin, submitLeaveRequest);
router.get('/students', authenticateToken, requireTeacherOrAdmin, getTeacherStudents);

export default router;