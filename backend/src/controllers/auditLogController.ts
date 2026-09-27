import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export async function listAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { action, entityType, search, page = '1', limit = '30' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 30;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (action) where.action = action as string;
    if (entityType) where.entityType = entityType as string;
    if (search) {
      where.OR = [
        { userName: { contains: search as string } },
        { action: { contains: search as string } },
        { entityId: { contains: search as string } },
        { details: { contains: search as string } },
        { ipAddress: { contains: search as string } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.auditLog.count({ where }),
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
  }
}
