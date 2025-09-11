import express from 'express';
import multer from 'multer';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/events.controller.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Routes
router.get('/', getEvents);
router.post('/', upload.array('images', 5), createEvent); // Support up to 5 images
router.put('/:id', upload.array('images', 5), updateEvent); // Support up to 5 images
router.delete('/:id', deleteEvent); // protect later with auth middleware

export default router;
