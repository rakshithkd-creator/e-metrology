import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { generateToken } from '../utils/token';
import { logAuditEvent } from '../services/auditService';
import { createNotification, notifyAdmins } from '../services/notificationService';
import { AuthenticatedRequest } from '../middleware/auth';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  organizationName: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  role: z.enum(['BUSINESS_USER', 'LMO', 'GATC']).default('BUSINESS_USER'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function register(req: Request, res: Response): Promise<void> {
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
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // Officers or GATC might need approval; Business users get approved or pending depending on policy
    const user = await prisma.user.create({
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

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: user.id,
      newStatus: user.status,
      req,
    });

    await createNotification({
      userId: user.id,
      title: 'Welcome to e-Metrology',
      message: `Welcome ${user.fullName}! Your account has been registered successfully. You can now register instruments and apply for verification.`,
      type: 'SYSTEM',
    });

    await notifyAdmins(
      'New User Registered',
      `${user.fullName} (${user.role}) has registered an account from ${user.district || 'Unspecified'}, ${user.state || ''}.`,
      '/admin/users'
    );

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
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed due to a server error.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
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
    const user = await prisma.user.findUnique({
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

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    await logAuditEvent({
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
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed due to a server error.' });
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user profile.' });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email address is required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Forgot password request failed.' });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'Valid token and new password (min 6 chars) are required.' });
      return;
    }

    let userId: string;
    try {
      const decoded = Buffer.from(resetToken, 'base64').toString('utf-8');
      userId = decoded.split('_')[0];
    } catch {
      res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: passwordHash },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'PASSWORD_RESET',
      entityType: 'USER',
      entityId: user.id,
      req,
    });

    res.json({ success: true, message: 'Password has been reset successfully. You can now login with your new password.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
}
