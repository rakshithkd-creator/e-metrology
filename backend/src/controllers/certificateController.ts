import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { generateCertificatePdf } from '../services/certificatePdfService';
import { logAuditEvent } from '../services/auditService';
import { createNotification } from '../services/notificationService';

export async function listCertificates(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { search, status, district, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Role scoping
    if (req.user!.role === 'BUSINESS_USER') {
      where.issuedToUserId = req.user!.userId;
    } else if (req.user!.role === 'LMO') {
      if (req.query.scope === 'issued_by_me') {
        where.issuedByOfficerId = req.user!.userId;
      }
    }

    if (status) where.status = status as string;
    if (district) where.instrument = { district: district as string };

    if (search) {
      where.OR = [
        { certificateNumber: { contains: search as string } },
        { sealNumber: { contains: search as string } },
        { instrument: { instrumentId: { contains: search as string } } },
        { instrument: { serialNumber: { contains: search as string } } },
        { instrument: { type: { contains: search as string } } },
        { issuedTo: { fullName: { contains: search as string } } },
        { issuedTo: { organizationName: { contains: search as string } } },
      ];
    }

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        include: {
          instrument: {
            select: {
              id: true,
              instrumentId: true,
              type: true,
              category: true,
              manufacturer: true,
              model: true,
              serialNumber: true,
              capacity: true,
              accuracyClass: true,
              unitOfMeasurement: true,
              location: true,
              district: true,
              state: true,
            },
          },
          issuedTo: {
            select: {
              id: true,
              fullName: true,
              organizationName: true,
              email: true,
              phone: true,
            },
          },
          issuedBy: {
            select: {
              id: true,
              fullName: true,
              organizationName: true,
              district: true,
            },
          },
        },
        orderBy: { validUntil: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.certificate.count({ where }),
    ]);

    // Check & dynamically update EXPIRING_SOON / EXPIRED status
    const now = new Date();
    for (const cert of certificates) {
      if (cert.status !== 'REVOKED') {
        const diffDays = Math.ceil((new Date(cert.validUntil).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0 && cert.status !== 'EXPIRED') {
          cert.status = 'EXPIRED';
          await prisma.certificate.update({ where: { id: cert.id }, data: { status: 'EXPIRED' } });
        } else if (diffDays > 0 && diffDays <= 30 && cert.status !== 'EXPIRING_SOON') {
          cert.status = 'EXPIRING_SOON';
          await prisma.certificate.update({ where: { id: cert.id }, data: { status: 'EXPIRING_SOON' } });
        }
      }
    }

    res.json({
      success: true,
      certificates,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve certificates.' });
  }
}

export async function getCertificate(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { certNumber } = req.params;

    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [{ certificateNumber: certNumber }, { id: certNumber }, { qrCodeToken: certNumber }],
      },
      include: {
        instrument: true,
        issuedTo: {
          select: {
            id: true,
            fullName: true,
            organizationName: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        issuedBy: {
          select: {
            id: true,
            fullName: true,
            organizationName: true,
            district: true,
            state: true,
          },
        },
        application: {
          select: {
            id: true,
            applicationId: true,
            type: true,
            submittedAt: true,
          },
        },
        inspection: {
          include: {
            checklistItems: true,
            measurements: true,
          },
        },
      },
    });

    if (!cert) {
      res.status(404).json({ success: false, message: 'Certificate not found.' });
      return;
    }

    // Role check
    if (req.user!.role === 'BUSINESS_USER' && cert.issuedToUserId !== req.user!.userId) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    res.json({ success: true, certificate: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch certificate details.' });
  }
}

export async function downloadCertificatePdf(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { certNumber } = req.params;

    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [{ certificateNumber: certNumber }, { id: certNumber }],
      },
      include: {
        instrument: true,
        issuedTo: true,
        issuedBy: true,
      },
    });

    if (!cert) {
      res.status(404).json({ success: false, message: 'Certificate not found.' });
      return;
    }

    const pdfBuffer = await generateCertificatePdf({
      certificateNumber: cert.certificateNumber,
      qrCodeToken: cert.qrCodeToken,
      sealNumber: cert.sealNumber,
      status: cert.status,
      verificationDate: cert.verificationDate,
      validFrom: cert.validFrom,
      validUntil: cert.validUntil,
      instrument: cert.instrument,
      owner: cert.issuedTo,
      officer: cert.issuedBy,
    });

    await logAuditEvent({
      userId: req.user?.userId,
      userName: req.user?.fullName || 'Anonymous / Download',
      userRole: req.user?.role || 'PUBLIC',
      action: 'CERTIFICATE_DOWNLOADED',
      entityType: 'CERTIFICATE',
      entityId: cert.certificateNumber,
      details: { certificateNumber: cert.certificateNumber },
      req,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Legal_Metrology_Certificate_${cert.certificateNumber}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Download PDF error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate PDF certificate.' });
  }
}

export async function revokeCertificate(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { certNumber } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      res.status(400).json({ success: false, message: 'A valid detailed revocation reason is required.' });
      return;
    }

    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [{ certificateNumber: certNumber }, { id: certNumber }],
      },
      include: { instrument: true },
    });

    if (!cert) {
      res.status(404).json({ success: false, message: 'Certificate not found.' });
      return;
    }

    if (cert.status === 'REVOKED') {
      res.status(400).json({ success: false, message: 'Certificate is already revoked.' });
      return;
    }

    const updated = await prisma.certificate.update({
      where: { id: cert.id },
      data: {
        status: 'REVOKED',
        revocationReason: reason,
        revokedAt: new Date(),
        revokedByUserId: req.user!.userId,
      },
    });

    // Update instrument status to active / unverified
    await prisma.instrument.update({
      where: { id: cert.instrumentId },
      data: { status: 'ACTIVE' },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: 'CERTIFICATE_REVOKED',
      entityType: 'CERTIFICATE',
      entityId: cert.certificateNumber,
      previousStatus: cert.status,
      newStatus: 'REVOKED',
      details: { reason },
      req,
    });

    await createNotification({
      userId: cert.issuedToUserId,
      title: 'Certificate Revoked',
      message: `Statutory Certificate ${cert.certificateNumber} for ${cert.instrument.type} has been REVOKED by the Competent Authority. Reason: ${reason}`,
      type: 'CERTIFICATE',
      link: `/certificates/${cert.certificateNumber}`,
    });

    res.json({
      success: true,
      message: `Certificate ${cert.certificateNumber} has been successfully revoked.`,
      certificate: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to revoke certificate.' });
  }
}
