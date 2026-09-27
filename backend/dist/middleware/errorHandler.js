"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, next) {
    console.error('Unhandled Server Error:', err);
    const statusCode = err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(statusCode).json({
        success: false,
        message: err.message || 'An unexpected internal server error occurred.',
        ...(isProduction ? {} : { stack: err.stack }),
    });
}
