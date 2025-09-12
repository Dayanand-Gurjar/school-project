import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import eventsRoutes from './routes/events.routes.js';
import authRoutes from './routes/auth.routes.js';
import studentsRoutes from './routes/students.routes.js';
import teachersRoutes from './routes/teachers.routes.js';
import teacherRoutes from './routes/teacher.routes.js';

const app = express();

// Request logging middleware - FIRST
app.use((req, res, next) => {
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/teacher', teacherRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'School Management API is running',
    version: '1.0.0'
  });
});

// 404 handler (catch-all)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});


// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

export default app;
