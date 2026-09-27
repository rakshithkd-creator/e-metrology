"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.updateUserStatus = updateUserStatus;
exports.getOfficers = getOfficers;
const prisma_1 = require("../lib/prisma");
const auditService_1 = require("../services/auditService");
async function listUsers(req, res) {
    try {
        const { role, status, search, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 20;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (role)
            where.role = role;
        if (status)
            where.status = status;
        if (search) {
            where.OR = [
                { fullName: { contains: search } },
                { email: { contains: search } },
                { organizationName: { contains: search } },
                { district: { contains: search } },
            ];
        }
        const [users, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    role: true,
                    status: true,
                    organizationName: true,
                    district: true,
                    state: true,
                    createdAt: true,
                    _count: {
                        select: {
                            instruments: true,
                            applications: true,
                            assignedApplications: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma_1.prisma.user.count({ where }),
        ]);
        res.json({
            success: true,
            users,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to list users.' });
    }
}
async function updateUserStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['APPROVED', 'PENDING', 'SUSPENDED'].includes(status)) {
            res.status(400).json({ success: false, message: 'Invalid user status.' });
            return;
        }
        const targetUser = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (!targetUser) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        const updated = await prisma_1.prisma.user.update({
            where: { id },
            data: { status },
            select: { id: true, fullName: true, email: true, status: true, role: true },
        });
        await (0, auditService_1.logAuditEvent)({
            userId: req.user.userId,
            userName: req.user.fullName,
            userRole: req.user.role,
            action: 'USER_STATUS_UPDATED',
            entityType: 'USER',
            entityId: targetUser.id,
            previousStatus: targetUser.status,
            newStatus: status,
            details: { updatedUserEmail: targetUser.email },
            req,
        });
        res.json({ success: true, message: `User status changed to ${status}`, user: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update user status.' });
    }
}
async function getOfficers(req, res) {
    try {
        const officers = await prisma_1.prisma.user.findMany({
            where: {
                role: { in: ['LMO', 'GATC'] },
                status: 'APPROVED',
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                district: true,
                state: true,
                organizationName: true,
                _count: {
                    select: {
                        assignedApplications: {
                            where: {
                                status: { in: ['ASSIGNED', 'SCHEDULED', 'INSPECTION_IN_PROGRESS'] },
                            },
                        },
                    },
                },
            },
            orderBy: { fullName: 'asc' },
        });
        res.json({ success: true, officers });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch officers list.' });
    }
}
