"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getProfile = getProfile;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const token_1 = require("../utils/token");
const auditService_1 = require("../services/auditService");
const notificationService_1 = require("../services/notificationService");
const registerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    phone: zod_1.z.string().min(10, 'Phone number must be at least 10 digits'),
    organizationName: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    district: zod_1.z.string().optional(),
    role: zod_1.z.enum(['BUSINESS_USER', 'LMO', 'GATC']).default('BUSINESS_USER'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
async function register(req, res) {
    try {
        const parseResult = registerSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                message: parseResult.error.errors[0].message,
                errors: parseResult.error.errors,
            });
            return;
        }
        const { fullName, email, password, phone, organizationName, address, state, district, role } = parseResult.data;
        // Check if user already exists
        const existing = await prisma_1.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (existing) {
            res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Officers or GATC might need approval; Business users get approved or pending depending on policy
        const user = await prisma_1.prisma.user.create({
            data: {
                fullName,
                email: email.toLowerCase(),
                password: passwordHash,
                phone,
                organizationName,
                address,
                state,
                district,
                role,
                status: 'APPROVED', // Ready for immediate login in prototype
            },
        });
        const token = (0, token_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
        });
        await (0, auditService_1.logAuditEvent)({
            userId: user.id,
            userName: user.fullName,
            userRole: user.role,
            action: 'USER_REGISTERED',
            entityType: 'USER',
            entityId: user.id,
            newStatus: user.status,
            req,
        });
        await (0, notificationService_1.createNotification)({
            userId: user.id,
            title: 'Welcome to e-Metrology',
            message: `Welcome ${user.fullName}! Your account has been registered successfully. You can now register instruments and apply for verification.`,
            type: 'SYSTEM',
        });
        await (0, notificationService_1.notifyAdmins)('New User Registered', `${user.fullName} (${user.role}) has registered an account from ${user.district || 'Unspecified'}, ${user.state || ''}.`, '/admin/users');
        res.status(201).json({
            success: true,
            message: 'Registration successful.',
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                organizationName: user.organizationName,
                district: user.district,
                state: user.state,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Registration failed due to a server error.' });
    }
}
async function login(req, res) {
    try {
        const parseResult = loginSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                message: parseResult.error.errors[0].message,
            });
            return;
        }
        const { email, password } = parseResult.data;
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
            return;
        }
        if (user.status === 'SUSPENDED') {
            res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact the administrator.' });
            return;
        }
        const passwordMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
            return;
        }
        const token = (0, token_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
        });
        await (0, auditService_1.logAuditEvent)({
            userId: user.id,
            userName: user.fullName,
            userRole: user.role,
            action: 'USER_LOGIN',
            entityType: 'USER',
            entityId: user.id,
            req,
        });
        res.json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                organizationName: user.organizationName,
                phone: user.phone,
                district: user.district,
                state: user.state,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed due to a server error.' });
    }
}
async function getProfile(req, res) {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                status: true,
                organizationName: true,
                phone: true,
                address: true,
                district: true,
                state: true,
                createdAt: true,
            },
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        res.json({ success: true, user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve user profile.' });
    }
}
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: 'Email address is required.' });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user) {
            // Return safe message without exposing whether user exists
            res.json({ success: true, message: 'If an account exists with this email, password reset instructions have been dispatched.' });
            return;
        }
        // In local dev/prototype, we return a mock reset token / link
        const resetToken = Buffer.from(`${user.id}_${Date.now()}`).toString('base64');
        res.json({
            success: true,
            message: 'Password reset link sent to your registered email.',
            resetToken, // Provided for easy demo test
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Forgot password request failed.' });
    }
}
async function resetPassword(req, res) {
    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || !newPassword || newPassword.length < 6) {
            res.status(400).json({ success: false, message: 'Valid token and new password (min 6 chars) are required.' });
            return;
        }
        let userId;
        try {
            const decoded = Buffer.from(resetToken, 'base64').toString('utf-8');
            userId = decoded.split('_')[0];
        }
        catch {
            res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { password: passwordHash },
        });
        await (0, auditService_1.logAuditEvent)({
            userId: user.id,
            userName: user.fullName,
            userRole: user.role,
            action: 'PASSWORD_RESET',
            entityType: 'USER',
            entityId: user.id,
            req,
        });
        res.json({ success: true, message: 'Password has been reset successfully. You can now login with your new password.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to reset password.' });
    }
}
