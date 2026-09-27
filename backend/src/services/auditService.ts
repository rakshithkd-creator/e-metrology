import { prisma } from '../lib/prisma';
import { Request } from 'express';

interface AuditLogParams {
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  entityType: string;
  entityId: string;
  previousStatus?: string;
  newStatus?: string;
  details?: Record<string, any>;
  req?: Request;
}

export async function logAuditEvent({
  userId,
  userName = 'System',
  userRole = 'SYSTEM',
  action,
  entityType,
  entityId,
  previousStatus,
  newStatus,
  details,
  req,
}: AuditLogParams): Promise<void> {
  try {
    let ipAddress = '127.0.0.1';
    if (req) {
      ipAddress =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        req.socket.remoteAddress ||
        '127.0.0.1';
    }

    await prisma.auditLog.create({
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
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
