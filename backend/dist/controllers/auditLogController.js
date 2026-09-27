"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAuditLogs = listAuditLogs;
const prisma_1 = require("../lib/prisma");
async function listAuditLogs(req, res) {
    try {
        const { action, entityType, search, page = '1', limit = '30' } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 30;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (action)
            where.action = action;
        if (entityType)
            where.entityType = entityType;
        if (search) {
            where.OR = [
                { userName: { contains: search } },
                { action: { contains: search } },
                { entityId: { contains: search } },
                { details: { contains: search } },
                { ipAddress: { contains: search } },
            ];
        }
        const [logs, total] = await Promise.all([
            prisma_1.prisma.auditLog.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma_1.prisma.auditLog.count({ where }),
        ]);
        res.json({
            success: true,
            logs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
    }
}
