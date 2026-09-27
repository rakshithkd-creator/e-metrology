import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access denied for role '${req.user.role}'. Required one of: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}
