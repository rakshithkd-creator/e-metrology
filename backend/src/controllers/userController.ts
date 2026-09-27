import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAuditEvent } from '../services/auditService';

export async function listUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { role, status, search, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (role) where.role = role as string;
    if (status) where.status = status as string;
    if (search) {
      where.OR = [
        { fullName: { contains: search as string } },
        { email: { contains: search as string } },
        { organizationName: { contains: search as string } },
        { district: { contains: search as string } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
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
      prisma.user.count({ where }),
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list users.' });
  }
}

export async function updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'PENDING', 'SUSPENDED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid user status.' });
      return;
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, fullName: true, email: true, status: true, role: true },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: 'USER_STATUS_UPDATED',
      entityType: 'USER',
      entityId: targetUser.id,
      previousStatus: targetUser.status,
      newStatus: status,
      details: { updatedUserEmail: targetUser.email },
      req,
    });

    res.json({ success: true, message: `User status changed to ${status}`, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
}

export async function getOfficers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const officers = await prisma.user.findMany({
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch officers list.' });
  }
}
