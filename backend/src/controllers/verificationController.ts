import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAuditEvent } from '../services/auditService';
import { createNotification } from '../services/notificationService';
import { generateQrCode } from '../services/qrService';
import { generateCertificatePdf } from '../services/certificatePdfService';

const checklistItemSchema = z.object({
  itemKey: z.string(),
  title: z.string(),
  result: z.enum(['PASS', 'FAIL', 'NOT_APPLICABLE']),
  remarks: z.string().optional(),
});

const measurementSchema = z.object({
  testName: z.string(),
  standardValue: z.number(),
  observedValue: z.number(),
  error: z.number(),
  permissibleError: z.number(),
  unit: z.string(),
  result: z.enum(['PASS', 'FAIL']),
});

const submitVerificationSchema = z.object({
  applicationId: z.string(),
  verificationDate: z.string().optional(),
  verificationType: z.enum(['ON_SITE', 'GATC_LAB']).default('ON_SITE'),
  location: z.string().min(1, 'Inspection location is required'),
  gpsLatitude: z.number().optional().nullable(),
  gpsLongitude: z.number().optional().nullable(),
  observations: z.string().min(5, 'Inspection observations are required'),
  remarks: z.string().optional(),
  result: z.enum(['PASS', 'FAIL']),
  failureReason: z.string().optional(),
  photographs: z.array(z.string()).default([]),
  evidenceDocuments: z.array(z.string()).default([]),
  checklistItems: z.array(checklistItemSchema).min(1, 'At least one checklist item is required'),
  measurements: z.array(measurementSchema).default([]),
});

export async function getChecklistConfigs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const items = await prisma.checklistConfig.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve checklist configurations.' });
  }
}

export async function updateChecklistConfigs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json({ success: false, message: 'Checklist items array is required.' });
      return;
    }

    for (const item of items) {
      if (item.id) {
        await prisma.checklistConfig.update({
          where: { id: item.id },
          data: {
            title: item.title,
            description: item.description,
            isMandatory: item.isMandatory,
            sortOrder: item.sortOrder,
            isActive: item.isActive,
          },
        });
      } else {
        await prisma.checklistConfig.create({
          data: {
            itemKey: item.itemKey || `CUSTOM_${Date.now()}`,
            title: item.title,
            description: item.description,
            isMandatory: item.isMandatory ?? true,
            sortOrder: item.sortOrder ?? 99,
            isActive: true,
          },
        });
      }
    }

    res.json({ success: true, message: 'Checklist configurations updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update checklist configurations.' });
  }
}

export async function submitVerification(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parseResult = submitVerificationSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0].message,
        errors: parseResult.error.errors,
      });
      return;
    }

    const data = parseResult.data;

    // Load application with instrument & owner
    const application = await prisma.application.findFirst({
      where: {
        OR: [{ id: data.applicationId }, { applicationId: data.applicationId }],
      },
      include: {
        instrument: true,
        user: true,
      },
    });

    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    // Role check: Only assigned officer, GATC, or Admin can submit verification
    if (req.user!.role === 'BUSINESS_USER') {
      res.status(403).json({ success: false, message: 'Business users cannot perform verification.' });
      return;
    }

    // Generate inspection ID: LM-INSP-YYYY-XXXXXX
    const inspCount = await prisma.verificationInspection.count();
    const year = new Date().getFullYear();
    const inspSeq = String(inspCount + 101).padStart(6, '0');
    const inspectionId = `LM-INSP-${year}-${inspSeq}`;

    const verificationDate = data.verificationDate ? new Date(data.verificationDate) : new Date();

    // Create Inspection Record
    const inspection = await prisma.verificationInspection.create({
      data: {
        inspectionId,
        verificationDate,
        verificationType: data.verificationType,
        location: data.location,
        gpsLatitude: data.gpsLatitude || null,
        gpsLongitude: data.gpsLongitude || null,
        observations: data.observations,
        remarks: data.remarks || null,
        result: data.result,
        failureReason: data.result === 'FAIL' ? data.failureReason || 'Did not meet tolerance or checklist requirements' : null,
        photographs: JSON.stringify(data.photographs),
        evidenceDocuments: JSON.stringify(data.evidenceDocuments),
        applicationId: application.id,
        instrumentId: application.instrumentId,
        officerId: req.user!.userId,
      },
    });

    // Create checklist item entries
    for (const item of data.checklistItems) {
      await prisma.inspectionChecklistItem.create({
        data: {
          inspectionId: inspection.id,
          itemKey: item.itemKey,
          title: item.title,
          result: item.result,
          remarks: item.remarks || null,
        },
      });
    }

    // Create measurement records
    for (const m of data.measurements) {
      await prisma.verificationMeasurement.create({
        data: {
          inspectionId: inspection.id,
          testName: m.testName,
          standardValue: m.standardValue,
          observedValue: m.observedValue,
          error: m.error,
          permissibleError: m.permissibleError,
          unit: m.unit,
          result: m.result,
        },
      });
    }

    let certificate = null;

    if (data.result === 'PASS') {
      // 1. Generate unique Certificate Number: LM-CERT-YYYY-XXXXXX
      const certCount = await prisma.certificate.count();
      const certSeq = String(certCount + 101).padStart(6, '0');
      const certificateNumber = `LM-CERT-${year}-${certSeq}`;

      // 2. Generate secure QR Code Token & URL
      const qrCodeToken = `tok-cert-${year}-${certSeq}-${Math.random().toString(36).substring(2, 9)}`;
      const appUrl = process.env.APP_URL || 'http://localhost:5173';
      const verifyUrl = `${appUrl}/verify/${certificateNumber}`;
      const qrCodeDataUrl = await generateQrCode(verifyUrl);

      // 3. Determine validity (1 year default, or from instrument type)
      const validFrom = verificationDate;
      const validUntil = new Date(validFrom.getTime() + 365 * 24 * 60 * 60 * 1000);
      const sealRandom = Math.floor(1000 + Math.random() * 9000);
      const sealNumber = `LM-SEAL-${application.instrument.district.substring(0, 2).toUpperCase()}-${year}-${sealRandom}`;

      // 4. Save certificate in DB
      certificate = await prisma.certificate.create({
        data: {
          certificateNumber,
          qrCodeToken,
          verificationDate,
          validFrom,
          validUntil,
          status: 'ACTIVE',
          sealNumber,
          pdfUrl: `/api/certificates/${certificateNumber}/pdf`,
          qrCodeDataUrl,
          applicationId: application.id,
          instrumentId: application.instrumentId,
          inspectionId: inspection.id,
          issuedToUserId: application.userId,
          issuedByOfficerId: req.user!.userId,
        },
      });

      // 5. Update Application and Instrument status
      await prisma.application.update({
        where: { id: application.id },
        data: {
          status: 'CERTIFICATE_ISSUED',
          completedAt: new Date(),
        },
      });

      await prisma.instrument.update({
        where: { id: application.instrumentId },
        data: {
          status: 'VERIFIED',
          previousVerificationNumber: certificateNumber,
          previousVerificationDate: verificationDate,
          previousValidityDate: validUntil,
        },
      });

      // 6. Audit Log
      await logAuditEvent({
        userId: req.user!.userId,
        userName: req.user!.fullName,
        userRole: req.user!.role,
        action: 'CERTIFICATE_GENERATED',
        entityType: 'CERTIFICATE',
        entityId: certificate.certificateNumber,
        newStatus: 'ACTIVE',
        details: {
          certificateNumber: certificate.certificateNumber,
          validUntil: certificate.validUntil,
          instrumentId: application.instrument.instrumentId,
        },
        req,
      });

      // 7. Notify User
      await createNotification({
        userId: application.userId,
        title: 'Verification Passed – Certificate Issued',
        message: `Congratulations! Your instrument ${application.instrument.type} (${application.instrument.instrumentId}) has passed verification. Digital Certificate ${certificateNumber} has been issued.`,
        type: 'CERTIFICATE',
        link: `/certificates/${certificateNumber}`,
      });
    } else {
      // If FAIL
      await prisma.application.update({
        where: { id: application.id },
        data: {
          status: 'REJECTED',
          rejectionReason: data.failureReason || 'Failed physical verification tests or tolerance limits.',
          completedAt: new Date(),
        },
      });

      await prisma.instrument.update({
        where: { id: application.instrumentId },
        data: { status: 'ACTIVE' },
      });

      await logAuditEvent({
        userId: req.user!.userId,
        userName: req.user!.fullName,
        userRole: req.user!.role,
        action: 'VERIFICATION_FAILED',
        entityType: 'INSPECTION',
        entityId: inspection.inspectionId,
        newStatus: 'FAIL',
        details: { failureReason: data.failureReason },
        req,
      });

      await createNotification({
        userId: application.userId,
        title: 'Verification Failed',
        message: `Field verification for ${application.instrument.type} (${application.instrument.instrumentId}) did NOT pass. Reason: ${data.failureReason || 'Tolerance limits exceeded'}. Please perform corrective calibration and reapply.`,
        type: 'VERIFICATION',
        link: `/applications/${application.id}`,
      });
    }

    res.status(201).json({
      success: true,
      message: data.result === 'PASS'
        ? `Verification completed successfully. Certificate ${certificate?.certificateNumber} issued.`
        : 'Verification completed. Instrument marked as failed.',
      inspection,
      certificate,
    });
  } catch (error: any) {
    console.error('Submit verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to record verification result.' });
  }
}
