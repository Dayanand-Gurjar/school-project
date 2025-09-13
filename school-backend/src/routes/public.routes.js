import express from 'express';
import { getPublicTeachers } from '../controllers/public.controller.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/teachers', getPublicTeachers);

export default router;