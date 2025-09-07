import express from 'express';
import { getEvents, createEvent } from '../controllers/events.controller.js';
const router = express.Router();
router.get('/', getEvents);
router.post('/', createEvent); // protect later with auth middleware
export default router;
