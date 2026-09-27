"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCertificates = listCertificates;
exports.getCertificate = getCertificate;
exports.downloadCertificatePdf = downloadCertificatePdf;
exports.revokeCertificate = revokeCertificate;
const prisma_1 = require("../lib/prisma");
const certificatePdfService_1 = require("../services/certificatePdfService");
const auditService_1 = require("../services/auditService");
const notificationService_1 = require("../services/notificationService");
async function listCertificates(req, res) {
    try {
        const { search, status, district, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 20;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        // Role scoping
        if (req.user.role === 'BUSINESS_USER') {
            where.issuedToUserId = req.user.userId;
        }
        else if (req.user.role === 'LMO') {
            if (req.query.scope === 'issued_by_me') {
                where.issuedByOfficerId = req.user.userId;
            }
        }
        if (status)
            where.status = status;
        if (district)
            where.instrument = { district: district };
        if (search) {
            where.OR = [
                { certificateNumber: { contains: search } },
                { sealNumber: { contains: search } },
                { instrument: { instrumentId: { contains: search } } },
                { instrument: { serialNumber: { contains: search } } },
                { instrument: { type: { contains: search } } },
                { issuedTo: { fullName: { contains: search } } },
                { issuedTo: { organizationName: { contains: search } } },
            ];
        }
        const [certificates, total] = await Promise.all([
            prisma_1.prisma.certificate.findMany({
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
            prisma_1.prisma.certificate.count({ where }),
        ]);
        // Check & dynamically update EXPIRING_SOON / EXPIRED status
        const now = new Date();
        for (const cert of certificates) {
            if (cert.status !== 'REVOKED') {
                const diffDays = Math.ceil((new Date(cert.validUntil).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays <= 0 && cert.status !== 'EXPIRED') {
                    cert.status = 'EXPIRED';
                    await prisma_1.prisma.certificate.update({ where: { id: cert.id }, data: { status: 'EXPIRED' } });
                }
                else if (diffDays > 0 && diffDays <= 30 && cert.status !== 'EXPIRING_SOON') {
                    cert.status = 'EXPIRING_SOON';
                    await prisma_1.prisma.certificate.update({ where: { id: cert.id }, data: { status: 'EXPIRING_SOON' } });
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve certificates.' });
    }
}
async function getCertificate(req, res) {
    try {
        const { certNumber } = req.params;
        const cert = await prisma_1.prisma.certificate.findFirst({
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
        if (req.user.role === 'BUSINESS_USER' && cert.issuedToUserId !== req.user.userId) {
            res.status(403).json({ success: false, message: 'Access denied.' });
            return;
        }
        res.json({ success: true, certificate: cert });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch certificate details.' });
    }
}
async function downloadCertificatePdf(req, res) {
    try {
        const { certNumber } = req.params;
        const cert = await prisma_1.prisma.certificate.findFirst({
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
        const pdfBuffer = await (0, certificatePdfService_1.generateCertificatePdf)({
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
        await (0, auditService_1.logAuditEvent)({
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
        res.setHeader('Content-Disposition', `attachment; filename="Legal_Metrology_Certificate_${cert.certificateNumber}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Download PDF error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate PDF certificate.' });
    }
}
async function revokeCertificate(req, res) {
    try {
        const { certNumber } = req.params;
        const { reason } = req.body;
        if (!reason || reason.trim().length < 5) {
            res.status(400).json({ success: false, message: 'A valid detailed revocation reason is required.' });
            return;
        }
        const cert = await prisma_1.prisma.certificate.findFirst({
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
        const updated = await prisma_1.prisma.certificate.update({
            where: { id: cert.id },
            data: {
                status: 'REVOKED',
                revocationReason: reason,
                revokedAt: new Date(),
                revokedByUserId: req.user.userId,
            },
        });
        // Update instrument status to active / unverified
        await prisma_1.prisma.instrument.update({
            where: { id: cert.instrumentId },
            data: { status: 'ACTIVE' },
        });
        await (0, auditService_1.logAuditEvent)({
            userId: req.user.userId,
            userName: req.user.fullName,
            userRole: req.user.role,
            action: 'CERTIFICATE_REVOKED',
            entityType: 'CERTIFICATE',
            entityId: cert.certificateNumber,
            previousStatus: cert.status,
            newStatus: 'REVOKED',
            details: { reason },
            req,
        });
        await (0, notificationService_1.createNotification)({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to revoke certificate.' });
    }
}
