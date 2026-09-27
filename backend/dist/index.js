"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const instrumentRoutes_1 = __importDefault(require("./routes/instrumentRoutes"));
const applicationRoutes_1 = __importDefault(require("./routes/applicationRoutes"));
const verificationRoutes_1 = __importDefault(require("./routes/verificationRoutes"));
const certificateRoutes_1 = __importDefault(require("./routes/certificateRoutes"));
const publicRoutes_1 = __importDefault(require("./routes/publicRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const auditLogRoutes_1 = __importDefault(require("./routes/auditLogRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security & HTTP headers
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false, // allow loading uploads from client
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
// Morgan request logging
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
// Body parsing
app.use(express_1.default.json({ limit: '15mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '15mb' }));
// Ensure upload directory exists and serve statically
const uploadDir = path_1.default.resolve(process.env.UPLOAD_DIR || './uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express_1.default.static(uploadDir));
// Rate limiting for API protection
const limiter = (0, express_rate_limit_1.default)({
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
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/instruments', instrumentRoutes_1.default);
app.use('/api/applications', applicationRoutes_1.default);
app.use('/api/verifications', verificationRoutes_1.default);
app.use('/api/certificates', certificateRoutes_1.default);
app.use('/api/public', publicRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/audit-logs', auditLogRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
app.use('/api/uploads', uploadRoutes_1.default);
// Serve frontend static build if available
const frontendDist = path_1.default.resolve(__dirname, '../../frontend/dist');
const altFrontendDist = path_1.default.resolve(__dirname, '../frontend/dist');
const finalFrontendDist = fs_1.default.existsSync(frontendDist) ? frontendDist : (fs_1.default.existsSync(altFrontendDist) ? altFrontendDist : null);
if (finalFrontendDist) {
    app.use(express_1.default.static(finalFrontendDist));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
            return next();
        }
        res.sendFile(path_1.default.join(finalFrontendDist, 'index.html'));
    });
}
// Error handling middleware
app.use(errorHandler_1.errorHandler);
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`🏛️  e-Metrology API Server running on port ${PORT}`);
        console.log(`🔗  Health Check: http://localhost:${PORT}/api/health`);
        console.log(`📂  Static Uploads: ${uploadDir}`);
        console.log(`=======================================================`);
    });
}
exports.default = app;
