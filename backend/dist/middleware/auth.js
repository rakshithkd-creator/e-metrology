"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const token_1 = require("../utils/token");
const prisma_1 = require("../lib/prisma");
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, token_1.verifyToken)(token);
        if (!decoded) {
            res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
            return;
        }
        // Verify user exists and status is APPROVED
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true, fullName: true, status: true },
        });
        if (!user) {
            res.status(401).json({ success: false, message: 'User account not found.' });
            return;
        }
        if (user.status === 'SUSPENDED') {
            res.status(403).json({ success: false, message: 'Account has been suspended by an administrator.' });
            return;
        }
        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            status: user.status,
        };
        next();
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal authentication error.' });
    }
}
