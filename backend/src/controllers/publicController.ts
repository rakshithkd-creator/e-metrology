import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function publicVerifyCertificate(req: Request, res: Response): Promise<void> {
  try {
    const { certIdentifier } = req.params;

    if (!certIdentifier) {
      res.status(400).json({ success: false, message: 'Certificate number or QR token is required.' });
      return;
    }

    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateNumber: certIdentifier.trim() },
          { qrCodeToken: certIdentifier.trim() },
        ],
      },
      include: {
        instrument: {
          select: {
            instrumentId: true,
            type: true,
            category: true,
            manufacturer: true,
            model: true,
            serialNumber: true,
            capacity: true,
            accuracyClass: true,
            unitOfMeasurement: true,
            district: true,
            state: true,
          },
        },
        issuedBy: {
          select: {
            fullName: true,
            organizationName: true,
            district: true,
            state: true,
          },
        },
        issuedTo: {
          select: {
            organizationName: true,
            fullName: true,
            district: true,
            state: true,
          },
        },
      },
    });

    if (!cert) {
      res.status(404).json({
        success: false,
        found: false,
        message: 'No Legal Metrology certificate found matching this identification number.',
      });
      return;
    }

    const now = new Date();
    const validUntilDate = new Date(cert.validUntil);
    const isExpired = validUntilDate < now;

    let computedStatus = cert.status;
    if (cert.status !== 'REVOKED') {
      computedStatus = isExpired ? 'EXPIRED' : 'VALID';
    }

    // Mask serial number for privacy
    const rawSerial = cert.instrument.serialNumber;
    let maskedSerial = rawSerial;
    if (rawSerial.length > 5) {
      maskedSerial = `${rawSerial.substring(0, 2)}***${rawSerial.substring(rawSerial.length - 3)}`;
    }

    // Calculate days remaining
    const diffTime = validUntilDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    res.json({
      success: true,
      found: true,
      certificate: {
        certificateNumber: cert.certificateNumber,
        status: computedStatus,
        isAuthentic: true,
        verificationDate: cert.verificationDate,
        validFrom: cert.validFrom,
        validUntil: cert.validUntil,
        daysRemaining: computedStatus === 'VALID' ? daysRemaining : 0,
        sealNumber: cert.sealNumber,
        revocationReason: cert.revocationReason,
        revokedAt: cert.revokedAt,
        instrument: {
          instrumentId: cert.instrument.instrumentId,
          type: cert.instrument.type,
          category: cert.instrument.category,
          manufacturer: cert.instrument.manufacturer,
          model: cert.instrument.model,
          maskedSerialNumber: maskedSerial,
          capacity: cert.instrument.capacity,
          accuracyClass: cert.instrument.accuracyClass,
          unitOfMeasurement: cert.instrument.unitOfMeasurement,
          district: cert.instrument.district,
          state: cert.instrument.state,
        },
        holder: {
          organization: cert.issuedTo.organizationName || cert.issuedTo.fullName,
          district: cert.issuedTo.district,
          state: cert.issuedTo.state,
        },
        issuingAuthority: {
          officerName: cert.issuedBy.fullName,
          department: cert.issuedBy.organizationName || 'Legal Metrology Department',
          jurisdiction: `${cert.issuedBy.district || 'HQ'}, ${cert.issuedBy.state || 'India'}`,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Public certificate verification failed.' });
  }
}

export async function publicTrackApplication(req: Request, res: Response): Promise<void> {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      res.status(400).json({ success: false, message: 'Application ID is required.' });
      return;
    }

    const application = await prisma.application.findFirst({
      where: {
        OR: [{ applicationId: applicationId.trim() }, { id: applicationId.trim() }],
      },
      include: {
        instrument: {
          select: {
            instrumentId: true,
            type: true,
            manufacturer: true,
            model: true,
            district: true,
          },
        },
        assignedOfficer: {
          select: {
            fullName: true,
          },
        },
        certificate: {
          select: {
            certificateNumber: true,
            status: true,
            validUntil: true,
          },
        },
      },
    });

    if (!application) {
      res.status(404).json({ success: false, message: 'No application found with this Application ID.' });
      return;
    }

    const milestones = [
      {
        name: 'Application Submitted',
        status: 'COMPLETED',
        date: application.submittedAt,
        details: 'Online verification dossier submitted successfully.',
      },
      {
        name: 'Department Review',
        status: application.status === 'REJECTED'
          ? 'FAILED'
          : (application.reviewedAt || ['APPROVED', 'ASSIGNED', 'SCHEDULED', 'INSPECTION_IN_PROGRESS', 'VERIFIED', 'CERTIFICATE_ISSUED'].includes(application.status))
            ? 'COMPLETED'
            : 'IN_PROGRESS',
        date: application.reviewedAt,
        details: application.rejectionReason ? `Application rejected: ${application.rejectionReason}` : 'Eligibility and documents verified.',
      },
      {
        name: 'Officer Assignment',
        status: application.assignedOfficerId ? 'COMPLETED' : 'PENDING',
        date: application.assignedAt,
        details: application.assignedOfficer ? `Assigned to ${application.assignedOfficer.fullName}` : 'Awaiting officer allocation.',
      },
      {
        name: 'Field Inspection',
        status: ['INSPECTION_IN_PROGRESS', 'VERIFIED', 'CERTIFICATE_ISSUED'].includes(application.status)
          ? 'COMPLETED'
          : application.scheduledDate
            ? 'SCHEDULED'
            : 'PENDING',
        date: application.scheduledDate,
        details: application.scheduledDate
          ? `Scheduled on ${new Date(application.scheduledDate).toLocaleDateString('en-GB')} at ${application.scheduledTime || 'TBD'}`
          : 'Pending schedule confirmation.',
      },
      {
        name: 'Statutory Certification',
        status: application.certificate ? 'COMPLETED' : 'PENDING',
        date: application.certificate ? application.completedAt : null,
        details: application.certificate
          ? `Digital Certificate ${application.certificate.certificateNumber} Issued.`
          : 'Final certification pending verification passing.',
      },
    ];

    res.json({
      success: true,
      applicationId: application.applicationId,
      currentStatus: application.status,
      type: application.type,
      instrumentType: application.instrument.type,
      district: application.instrument.district,
      submittedAt: application.submittedAt,
      certificateNumber: application.certificate?.certificateNumber || null,
      milestones,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Public tracking failed.' });
  }
}
