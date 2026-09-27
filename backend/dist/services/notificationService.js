"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.notifyAdmins = notifyAdmins;
const prisma_1 = require("../lib/prisma");
async function createNotification({ userId, title, message, type = 'SYSTEM', link, }) {
    try {
        await prisma_1.prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link,
                isRead: false,
            },
        });
    }
    catch (error) {
        console.error('Failed to create notification:', error);
    }
}
async function notifyAdmins(title, message, link) {
    try {
        const admins = await prisma_1.prisma.user.findMany({
            where: { role: 'SUPER_ADMIN', status: 'APPROVED' },
            select: { id: true },
        });
        for (const admin of admins) {
            await createNotification({
                userId: admin.id,
                title,
                message,
                type: 'SYSTEM',
                link,
            });
        }
    }
    catch (error) {
        console.error('Failed to notify admins:', error);
    }
}
