"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listApplications = listApplications;
exports.createApplication = createApplication;
exports.getApplication = getApplication;
exports.assignAndSchedule = assignAndSchedule;
exports.reviewApplication = reviewApplication;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auditService_1 = require("../services/auditService");
const notificationService_1 = require("../services/notificationService");
const applicationSchema = zod_1.z.object({
    instrumentId: zod_1.z.string().min(1, 'Instrument selection is required'),
    type: zod_1.z.enum(['NEW_VERIFICATION', 'RE_VERIFICATION']).default('NEW_VERIFICATION'),
    verificationType: zod_1.z.enum(['ON_SITE', 'LABORATORY']).default('ON_SITE'),
    remarks: zod_1.z.string().optional(),
    scheduledLocation: zod_1.z.string().optional(),
});
async function listApplications(req, res) {
    try {
        const { status, type, search, officerId, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 20;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        // Scoping
        if (req.user.role === 'BUSINESS_USER') {
            where.userId = req.user.userId;
        }
        else if (req.user.role === 'LMO') {
            // LMO sees applications assigned to them, or status for field verification
            if (req.query.scope === 'assigned_only') {
                where.assignedOfficerId = req.user.userId;
            }
            else {
                where.OR = [
                    { assignedOfficerId: req.user.userId },
                    { status: { in: ['ASSIGNED', 'SCHEDULED', 'INSPECTION_IN_PROGRESS', 'VERIFIED'] } },
                ];
            }
        }
        else if (req.user.role === 'GATC') {
            where.assignedGatcId = req.user.userId;
        }
        if (status)
            where.status = status;
        if (type)
            where.type = type;
        if (officerId)
            where.assignedOfficerId = officerId;
        if (search) {
            where.OR = [
                { applicationId: { contains: search } },
                { instrument: { instrumentId: { contains: search } } },
                { instrument: { serialNumber: { contains: search } } },
                { instrument: { manufacturer: { contains: search } } },
                { user: { fullName: { contains: search } } },
                { user: { organizationName: { contains: search } } },
            ];
        }
        const [applications, total] = await Promise.all([
            prisma_1.prisma.application.findMany({
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
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            organizationName: true,
                            email: true,
                            phone: true,
                        },
                    },
                    assignedOfficer: {
                        select: {
                            id: true,
                            fullName: true,
                            organizationName: true,
                            email: true,
                            phone: true,
                        },
                    },
                    assignedGatc: {
                        select: {
                            id: true,
                            fullName: true,
                            organizationName: true,
                        },
                    },
                    certificate: {
                        select: {
                            id: true,
                            certificateNumber: true,
                            status: true,
                            validUntil: true,
                        },
                    },
                    inspections: {
                        select: {
                            id: true,
                            inspectionId: true,
                            result: true,
                            verificationDate: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma_1.prisma.application.count({ where }),
        ]);
        res.json({
            success: true,
            applications,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve applications.' });
    }
}
async function createApplication(req, res) {
    try {
        const parseResult = applicationSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                message: parseResult.error.errors[0].message,
            });
            return;
        }
        const { instrumentId, type, verificationType, remarks, scheduledLocation } = parseResult.data;
        // Verify instrument exists and belongs to user (or admin)
        const instrument = await prisma_1.prisma.instrument.findFirst({
            where: {
                OR: [{ id: instrumentId }, { instrumentId }],
            },
        });
        if (!instrument) {
            res.status(404).json({ success: false, message: 'Selected instrument not found.' });
            return;
        }
        if (req.user.role === 'BUSINESS_USER' && instrument.ownerId !== req.user.userId) {
            res.status(403).json({ success: false, message: 'You do not own this instrument.' });
            return;
        }
        // Check if there is already an active in-progress application for this instrument
        const activeApp = await prisma_1.prisma.application.findFirst({
            where: {
                instrumentId: instrument.id,
                status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'ASSIGNED', 'SCHEDULED', 'INSPECTION_IN_PROGRESS'] },
            },
        });
        if (activeApp) {
            res.status(409).json({
                success: false,
                message: `An application (${activeApp.applicationId}) is already in progress for this instrument.`,
            });
            return;
        }
        // Generate Application ID: LM-APP-YYYY-XXXXXX
        const count = await prisma_1.prisma.application.count();
        const year = new Date().getFullYear();
        const seq = String(count + 101).padStart(6, '0');
        const applicationId = `LM-APP-${year}-${seq}`;
        const application = await prisma_1.prisma.application.create({
            data: {
                applicationId,
                type,
                status: 'SUBMITTED',
                verificationType,
                remarks: remarks || null,
                scheduledLocation: scheduledLocation || instrument.location,
                submittedAt: new Date(),
                instrumentId: instrument.id,
                userId: req.user.userId,
            },
            include: {
                instrument: true,
            },
        });
        // Update instrument status to pending verification
        await prisma_1.prisma.instrument.update({
            where: { id: instrument.id },
            data: { status: 'PENDING_VERIFICATION' },
        });
        await (0, auditService_1.logAuditEvent)({
            userId: req.user.userId,
            userName: req.user.fullName,
            userRole: req.user.role,
            action: 'APPLICATION_SUBMITTED',
            entityType: 'APPLICATION',
            entityId: application.applicationId,
            newStatus: 'SUBMITTED',
            details: {
                applicationType: type,
                instrumentId: instrument.instrumentId,
            },
            req,
        });
        await (0, notificationService_1.createNotification)({
            userId: req.user.userId,
            title: 'Verification Application Submitted',
            message: `Your application ${application.applicationId} for ${instrument.type} (${instrument.instrumentId}) has been received and is under review.`,
            type: 'APPLICATION',
            link: `/applications/${application.id}`,
        });
        await (0, notificationService_1.notifyAdmins)('New Verification Application', `Application ${application.applicationId} submitted by ${req.user.fullName} for ${instrument.type}.`, `/applications/${application.id}`);
        res.status(201).json({
            success: true,
            message: 'Verification application submitted successfully.',
            application,
        });
    }
    catch (error) {
        console.error('Create application error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit application.' });
    }
}
async function getApplication(req, res) {
    try {
        const { id } = req.params;
        const application = await prisma_1.prisma.application.findFirst({
            where: {
                OR: [{ id }, { applicationId: id }],
            },
            include: {
                instrument: {
                    include: {
                        owner: {
                            select: {
                                id: true,
                                fullName: true,
                                organizationName: true,
                                email: true,
                                phone: true,
                                address: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        organizationName: true,
                        email: true,
                        phone: true,
                        address: true,
                        district: true,
                        state: true,
                    },
                },
                assignedOfficer: {
                    select: {
                        id: true,
                        fullName: true,
                        organizationName: true,
                        email: true,
                        phone: true,
                        district: true,
                    },
                },
                assignedGatc: {
                    select: {
                        id: true,
                        fullName: true,
                        organizationName: true,
                    },
                },
                inspections: {
                    include: {
                        checklistItems: true,
                        measurements: true,
                        officer: {
                            select: {
                                fullName: true,
                                organizationName: true,
                            },
                        },
                    },
                },
                certificate: true,
            },
        });
        if (!application) {
            res.status(404).json({ success: false, message: 'Application not found.' });
            return;
        }
        // Role check
        if (req.user.role === 'BUSINESS_USER' && application.userId !== req.user.userId) {
            res.status(403).json({ success: false, message: 'Access denied.' });
            return;
        }
        // Build timeline milestones
        const timeline = [
            {
                step: 1,
                title: 'Application Submitted',
                description: 'Application received and registered on digital portal',
                date: application.submittedAt,
                completed: Boolean(application.submittedAt),
                status: 'SUBMITTED',
            },
            {
                step: 2,
                title: 'Application Reviewed',
                description: application.rejectionReason
                    ? `Application rejected: ${application.rejectionReason}`
                    : 'Documents and registration eligibility verified',
                date: application.reviewedAt,
                completed: Boolean(application.reviewedAt) || ['APPROVED', 'ASSIGNED', 'SCHEDULED', 'INSPECTION_IN_PROGRESS', 'VERIFIED', 'CERTIFICATE_ISSUED'].includes(application.status),
                status: application.status === 'REJECTED' ? 'REJECTED' : 'APPROVED',
            },
            {
                step: 3,
                title: 'Officer Assigned',
                description: application.assignedOfficer
                    ? `Assigned to ${application.assignedOfficer.fullName}`
                    : 'Pending officer assignment',
                date: application.assignedAt,
                completed: Boolean(application.assignedOfficerId),
                status: 'ASSIGNED',
            },
            {
                step: 4,
                title: 'Inspection Scheduled',
                description: application.scheduledDate
                    ? `Scheduled on ${new Date(application.scheduledDate).toLocaleDateString('en-GB')} at ${application.scheduledTime || 'TBD'}`
                    : 'Inspection schedule pending',
                date: application.scheduledAt,
                completed: Boolean(application.scheduledDate),
                status: 'SCHEDULED',
            },
            {
                step: 5,
                title: 'Field Verification Completed',
                description: application.inspections.length > 0
                    ? `Inspection ${application.inspections[0].result === 'PASS' ? 'Passed' : 'Failed'}`
                    : 'Physical test and accuracy check underway',
                date: application.inspections[0]?.verificationDate || null,
                completed: application.inspections.length > 0,
                status: application.inspections[0]?.result || 'IN_PROGRESS',
            },
            {
                step: 6,
                title: 'Digital Certificate Issued',
                description: application.certificate
                    ? `Certificate ${application.certificate.certificateNumber} generated with tamper-evident QR`
                    : 'Awaiting completion of verification',
                date: application.certificate?.verificationDate || null,
                completed: Boolean(application.certificate),
                status: application.certificate ? 'CERTIFICATE_ISSUED' : 'PENDING',
            },
        ];
        res.json({
            success: true,
            application,
            timeline,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve application details.' });
    }
}
async function assignAndSchedule(req, res) {
    try {
        const { id } = req.params;
        const { officerId, gatcId, scheduledDate, scheduledTime, scheduledLocation, verificationType } = req.body;
        const application = await prisma_1.prisma.application.findUnique({
            where: { id },
            include: { instrument: true, user: true },
        });
        if (!application) {
            res.status(404).json({ success: false, message: 'Application not found.' });
            return;
        }
        if (!officerId && !gatcId) {
            res.status(400).json({ success: false, message: 'Please select a Legal Metrology Officer or GATC.' });
            return;
        }
        // Schedule conflict prevention: Check if officer already has 5 or more inspections scheduled on that same date/time
        if (officerId && scheduledDate && scheduledTime) {
            const scheduledDay = new Date(scheduledDate);
            const startOfDay = new Date(scheduledDay.setHours(0, 0, 0, 0));
            const endOfDay = new Date(scheduledDay.setHours(23, 59, 59, 999));
            const existingSameTime = await prisma_1.prisma.application.count({
                where: {
                    assignedOfficerId: officerId,
                    scheduledDate: { gte: startOfDay, lte: endOfDay },
                    scheduledTime: scheduledTime,
                    id: { not: id },
                    status: { in: ['ASSIGNED', 'SCHEDULED'] },
                },
            });
            if (existingSameTime > 0) {
                res.status(409).json({
                    success: false,
                    message: `Officer already has an inspection scheduled at ${scheduledTime} on this date. Please select a different time slot.`,
                });
                return;
            }
        }
        const previousStatus = application.status;
        const newStatus = scheduledDate ? 'SCHEDULED' : 'ASSIGNED';
        const updated = await prisma_1.prisma.application.update({
            where: { id },
            data: {
                assignedOfficerId: officerId || null,
                assignedGatcId: gatcId || null,
                scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
                scheduledTime: scheduledTime || null,
                scheduledLocation: scheduledLocation || application.instrument.location,
                verificationType: verificationType || application.verificationType,
                status: newStatus,
                reviewedAt: application.reviewedAt || new Date(),
                assignedAt: new Date(),
                scheduledAt: scheduledDate ? new Date() : null,
            },
            include: {
                assignedOfficer: true,
                assignedGatc: true,
                instrument: true,
            },
        });
        await (0, auditService_1.logAuditEvent)({
            userId: req.user.userId,
            userName: req.user.fullName,
            userRole: req.user.role,
            action: 'OFFICER_ASSIGNED',
            entityType: 'APPLICATION',
            entityId: application.applicationId,
            previousStatus,
            newStatus,
            details: {
                assignedOfficer: updated.assignedOfficer?.fullName,
                scheduledDate,
                scheduledTime,
            },
            req,
        });
        // Notify Officer
        if (officerId) {
            await (0, notificationService_1.createNotification)({
                userId: officerId,
                title: 'New Verification Inspection Assigned',
                message: `You have been assigned to verify ${application.instrument.type} (${application.instrument.instrumentId}) on ${scheduledDate || 'pending schedule'}.`,
                type: 'APPLICATION',
                link: `/field-verification/${application.id}`,
            });
        }
        // Notify Applicant
        await (0, notificationService_1.createNotification)({
            userId: application.userId,
            title: 'Verification Inspection Assigned & Scheduled',
            message: `Your application ${application.applicationId} has been scheduled for inspection on ${scheduledDate || 'soon'} at ${scheduledTime || ''}.`,
            type: 'APPLICATION',
            link: `/applications/${application.id}`,
        });
        res.json({
            success: true,
            message: `Application successfully assigned and ${newStatus.toLowerCase()}.`,
            application: updated,
        });
    }
    catch (error) {
        console.error('Assign & Schedule error:', error);
        res.status(500).json({ success: false, message: 'Failed to assign and schedule application.' });
    }
}
async function reviewApplication(req, res) {
    try {
        const { id } = req.params;
        const { action, rejectionReason } = req.body; // action: 'APPROVE' | 'REJECT'
        const application = await prisma_1.prisma.application.findUnique({
            where: { id },
            include: { instrument: true },
        });
        if (!application) {
            res.status(404).json({ success: false, message: 'Application not found.' });
            return;
        }
        const previousStatus = application.status;
        const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        const updated = await prisma_1.prisma.application.update({
            where: { id },
            data: {
                status: newStatus,
                reviewedAt: new Date(),
                rejectionReason: action === 'REJECT' ? rejectionReason : null,
            },
        });
        if (action === 'REJECT') {
            await prisma_1.prisma.instrument.update({
                where: { id: application.instrumentId },
                data: { status: 'ACTIVE' },
            });
        }
        await (0, auditService_1.logAuditEvent)({
            userId: req.user.userId,
            userName: req.user.fullName,
            userRole: req.user.role,
            action: action === 'APPROVE' ? 'APPLICATION_APPROVED' : 'APPLICATION_REJECTED',
            entityType: 'APPLICATION',
            entityId: application.applicationId,
            previousStatus,
            newStatus,
            details: { rejectionReason },
            req,
        });
        await (0, notificationService_1.createNotification)({
            userId: application.userId,
            title: `Application ${action === 'APPROVE' ? 'Approved' : 'Rejected'}`,
            message: action === 'APPROVE'
                ? `Your application ${application.applicationId} has been approved and queued for officer assignment.`
                : `Your application ${application.applicationId} was rejected. Reason: ${rejectionReason || 'Non-compliance with documentation.'}`,
            type: 'APPLICATION',
            link: `/applications/${application.id}`,
        });
        res.json({
            success: true,
            message: `Application ${action.toLowerCase()}d successfully.`,
            application: updated,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to review application.' });
    }
}
