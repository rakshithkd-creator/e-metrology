"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserNotifications = getUserNotifications;
exports.markNotificationAsRead = markNotificationAsRead;
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
const prisma_1 = require("../lib/prisma");
async function getUserNotifications(req, res) {
    try {
        const userId = req.user.userId;
        const notifications = await prisma_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        const unreadCount = await prisma_1.prisma.notification.count({
            where: { userId, isRead: false },
        });
        res.json({ success: true, notifications, unreadCount });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
    }
}
async function markNotificationAsRead(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        await prisma_1.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
        res.json({ success: true, message: 'Notification marked as read.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update notification.' });
    }
}
async function markAllNotificationsAsRead(req, res) {
    try {
        const userId = req.user.userId;
        await prisma_1.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        res.json({ success: true, message: 'All notifications marked as read.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to mark all as read.' });
    }
}
