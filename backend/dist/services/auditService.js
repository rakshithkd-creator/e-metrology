"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuditEvent = logAuditEvent;
const prisma_1 = require("../lib/prisma");
async function logAuditEvent({ userId, userName = 'System', userRole = 'SYSTEM', action, entityType, entityId, previousStatus, newStatus, details, req, }) {
    try {
        let ipAddress = '127.0.0.1';
        if (req) {
            ipAddress =
                req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                    req.socket.remoteAddress ||
                    '127.0.0.1';
        }
        await prisma_1.prisma.auditLog.create({
            data: {
                userId,
                userName,
                userRole,
                action,
                entityType,
                entityId,
                previousStatus,
                newStatus,
                details: details ? JSON.stringify(details) : null,
                ipAddress,
            },
        });
    }
    catch (error) {
        console.error('Failed to log audit event:', error);
    }
}
