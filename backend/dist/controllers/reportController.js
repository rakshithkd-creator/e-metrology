"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReportCsv = exportReportCsv;
const prisma_1 = require("../lib/prisma");
async function exportReportCsv(req, res) {
    try {
        const { reportType } = req.params;
        let csvData = '';
        let fileName = `emetrology_${reportType}_report_${Date.now()}.csv`;
        if (reportType === 'applications') {
            const apps = await prisma_1.prisma.application.findMany({
                include: {
                    instrument: true,
                    user: true,
                    assignedOfficer: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            const header = 'Application ID,Type,Status,Verification Type,Instrument ID,Instrument Type,Manufacturer,Applicant,Phone,Officer,District,Submitted Date\n';
            const rows = apps.map((a) => `"${a.applicationId}","${a.type}","${a.status}","${a.verificationType}","${a.instrument.instrumentId}","${a.instrument.type}","${a.instrument.manufacturer}","${a.user.fullName}","${a.user.phone}","${a.assignedOfficer?.fullName || 'Unassigned'}","${a.instrument.district}","${new Date(a.submittedAt).toISOString().split('T')[0]}"`).join('\n');
            csvData = header + rows;
        }
        else if (reportType === 'certificates') {
            const certs = await prisma_1.prisma.certificate.findMany({
                include: {
                    instrument: true,
                    issuedTo: true,
                    issuedBy: true,
                },
                orderBy: { validUntil: 'desc' },
            });
            const header = 'Certificate Number,Status,Instrument ID,Type,Serial Number,Owner,Issuing Officer,Seal Number,Verification Date,Valid From,Valid Until\n';
            const rows = certs.map((c) => `"${c.certificateNumber}","${c.status}","${c.instrument.instrumentId}","${c.instrument.type}","${c.instrument.serialNumber}","${c.issuedTo.organizationName || c.issuedTo.fullName}","${c.issuedBy.fullName}","${c.sealNumber || ''}","${new Date(c.verificationDate).toISOString().split('T')[0]}","${new Date(c.validFrom).toISOString().split('T')[0]}","${new Date(c.validUntil).toISOString().split('T')[0]}"`).join('\n');
            csvData = header + rows;
        }
        else if (reportType === 'verifications') {
            const insps = await prisma_1.prisma.verificationInspection.findMany({
                include: {
                    instrument: true,
                    officer: true,
                    application: true,
                },
                orderBy: { verificationDate: 'desc' },
            });
            const header = 'Inspection ID,Application ID,Result,Verification Date,Officer,Instrument ID,Instrument Type,Location,Failure Reason\n';
            const rows = insps.map((i) => `"${i.inspectionId}","${i.application.applicationId}","${i.result}","${new Date(i.verificationDate).toISOString().split('T')[0]}","${i.officer.fullName}","${i.instrument.instrumentId}","${i.instrument.type}","${i.location}","${i.failureReason || 'N/A'}"`).join('\n');
            csvData = header + rows;
        }
        else if (reportType === 'expiry') {
            const now = new Date();
            const in90Days = new Date(now.getTime() + 90 * 86400000);
            const certs = await prisma_1.prisma.certificate.findMany({
                where: {
                    status: { not: 'REVOKED' },
                    validUntil: { lte: in90Days },
                },
                include: {
                    instrument: true,
                    issuedTo: true,
                },
                orderBy: { validUntil: 'asc' },
            });
            const header = 'Certificate Number,Current Status,Instrument ID,Type,Owner,Owner Phone,Valid Until,Days Remaining\n';
            const rows = certs.map((c) => {
                const daysLeft = Math.ceil((new Date(c.validUntil).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return `"${c.certificateNumber}","${c.status}","${c.instrument.instrumentId}","${c.instrument.type}","${c.issuedTo.organizationName || c.issuedTo.fullName}","${c.issuedTo.phone}","${new Date(c.validUntil).toISOString().split('T')[0]}","${daysLeft}"`;
            }).join('\n');
            csvData = header + rows;
        }
        else {
            res.status(400).json({ success: false, message: 'Invalid report type requested.' });
            return;
        }
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(csvData);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to generate CSV report.' });
    }
}
