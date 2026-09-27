import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/token';
import { prisma } from '../lib/prisma';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & { status?: string };
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
      return;
    }

    // Verify user exists and status is APPROVED
    const user = await prisma.user.findUnique({
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal authentication error.' });
  }
}
