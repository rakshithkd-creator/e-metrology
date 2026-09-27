import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import instrumentRoutes from './routes/instrumentRoutes';
import applicationRoutes from './routes/applicationRoutes';
import verificationRoutes from './routes/verificationRoutes';
import certificateRoutes from './routes/certificateRoutes';
import publicRoutes from './routes/publicRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import notificationRoutes from './routes/notificationRoutes';
import auditLogRoutes from './routes/auditLogRoutes';
import reportRoutes from './routes/reportRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

// Security & HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false, // allow loading uploads from client
}));

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
}));

// Morgan request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Ensure upload directory exists and serve statically
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Rate limiting for API protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // max 500 requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'e-Metrology API',
    version: '1.0.0',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/instruments', instrumentRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/uploads', uploadRoutes);

// Serve frontend static build if available
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
const altFrontendDist = path.resolve(__dirname, '../frontend/dist');
const finalFrontendDist = fs.existsSync(frontendDist) ? frontendDist : (fs.existsSync(altFrontendDist) ? altFrontendDist : null);

if (finalFrontendDist) {
  app.use(express.static(finalFrontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(finalFrontendDist, 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🏛️  e-Metrology API Server running on port ${PORT}`);
    console.log(`🔗  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📂  Static Uploads: ${uploadDir}`);
    console.log(`=======================================================`);
  });
}

export default app;
