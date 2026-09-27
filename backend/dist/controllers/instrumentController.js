"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listInstruments = listInstruments;
exports.createInstrument = createInstrument;
exports.getInstrument = getInstrument;
exports.listInstrumentTypes = listInstrumentTypes;
exports.createInstrumentType = createInstrumentType;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auditService_1 = require("../services/auditService");
const notificationService_1 = require("../services/notificationService");
const instrumentSchema = zod_1.z.object({
    type: zod_1.z.string().min(1, 'Instrument type is required'),
    category: zod_1.z.string().default('WEIGHING'),
    manufacturer: zod_1.z.string().min(1, 'Manufacturer name is required'),
    model: zod_1.z.string().min(1, 'Model is required'),
    serialNumber: zod_1.z.string().min(1, 'Serial number is required'),
    capacity: zod_1.z.string().min(1, 'Capacity is required'),
    accuracyClass: zod_1.z.string().min(1, 'Accuracy class is required'),
    unitOfMeasurement: zod_1.z.string().min(1, 'Unit of measurement is required'),
    dateOfManufacture: zod_1.z.string().optional(),
    installationDate: zod_1.z.string().optional(),
    location: zod_1.z.string().min(1, 'Location is required'),
    district: zod_1.z.string().min(1, 'District is required'),
    state: zod_1.z.string().min(1, 'State is required'),
    previousVerificationNumber: zod_1.z.string().optional(),
    previousVerificationDate: zod_1.z.string().optional(),
    previousValidityDate: zod_1.z.string().optional(),
    photographUrl: zod_1.z.string().optional(),
    supportingDocsUrl: zod_1.z.string().optional(),
});
async function listInstruments(req, res) {
    try {
        const { category, type, district, status, search, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 20;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        // Role scoping: Business users see their own instruments; Admins & Officers can view all
        if (req.user.role === 'BUSINESS_USER') {
            where.ownerId = req.user.userId;
        }
        if (category)
            where.category = category;
        if (type)
            where.type = type;
        if (district)
            where.district = district;
        if (status)
            where.status = status;
        if (search) {
            where.OR = [
                { instrumentId: { contains: search } },
                { serialNumber: { contains: search } },
                { manufacturer: { contains: search } },
                { model: { contains: search } },
                { location: { contains: search } },
            ];
        }
        const [instruments, total] = await Promise.all([
            prisma_1.prisma.instrument.findMany({
                where,
                include: {
                    owner: {
                        select: {
                            id: true,
                            fullName: true,
                            organizationName: true,
                            email: true,
                            phone: true,
                        },
                    },
                    certificates: {
                        take: 1,
                        orderBy: { validUntil: 'desc' },
                        select: {
                            id: true,
                            certificateNumber: true,
                            status: true,
                            validUntil: true,
                        },
                    },
                    applications: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                        select: {
                            id: true,
                            applicationId: true,
                            status: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma_1.prisma.instrument.count({ where }),
        ]);
        res.json({
            success: true,
            instruments,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve instruments.' });
    }
}
async function createInstrument(req, res) {
    try {
        const parseResult = instrumentSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                message: parseResult.error.errors[0].message,
                errors: parseResult.error.errors,
            });
            return;
        }
        const data = parseResult.data;
        // Check duplicate serial number
        const existing = await prisma_1.prisma.instrument.findUnique({
            where: { serialNumber: data.serialNumber },
        });
        if (existing) {
            res.status(409).json({
                success: false,
                message: `An instrument with serial number '${data.serialNumber}' is already registered in the system.`,
            });
            return;
        }
        // Generate unique instrument ID: LM-INST-YYYY-XXXXXX
        const count = await prisma_1.prisma.instrument.count();
        const year = new Date().getFullYear();
        const seq = String(count + 101).padStart(6, '0');
        const instrumentId = `LM-INST-${year}-${seq}`;
        const instrument = await prisma_1.prisma.instrument.create({
            data: {
                instrumentId,
                type: data.type,
                category: data.category,
                manufacturer: data.manufacturer,
                model: data.model,
                serialNumber: data.serialNumber,
                capacity: data.capacity,
                accuracyClass: data.accuracyClass,
                unitOfMeasurement: data.unitOfMeasurement,
                dateOfManufacture: data.dateOfManufacture ? new Date(data.dateOfManufacture) : null,
                installationDate: data.installationDate ? new Date(data.installationDate) : null,
                location: data.location,
                district: data.district,
                state: data.state,
                previousVerificationNumber: data.previousVerificationNumber || null,
                previousVerificationDate: data.previousVerificationDate ? new Date(data.previousVerificationDate) : null,
                previousValidityDate: data.previousValidityDate ? new Date(data.previousValidityDate) : null,
                photographUrl: data.photographUrl || null,
                supportingDocsUrl: data.supportingDocsUrl || null,
                status: 'ACTIVE',
                ownerId: req.user.userId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        organizationName: true,
                    },
                },
            },
        });
        await (0, auditService_1.logAuditEvent)({
            userId: req.user.userId,
            userName: req.user.fullName,
            userRole: req.user.role,
            action: 'INSTRUMENT_CREATED',
            entityType: 'INSTRUMENT',
            entityId: instrument.instrumentId,
            newStatus: 'ACTIVE',
            details: {
                type: instrument.type,
                serial: instrument.serialNumber,
                capacity: instrument.capacity,
            },
            req,
        });
        await (0, notificationService_1.createNotification)({
            userId: req.user.userId,
            title: 'Instrument Registered',
            message: `Your instrument ${instrument.type} (${instrument.instrumentId}) has been successfully registered. You can now submit a verification application.`,
            type: 'SYSTEM',
            link: `/instruments/${instrument.id}`,
        });
        res.status(201).json({
            success: true,
            message: 'Instrument successfully registered.',
            instrument,
        });
    }
    catch (error) {
        console.error('Create instrument error:', error);
        res.status(500).json({ success: false, message: 'Failed to register instrument.' });
    }
}
async function getInstrument(req, res) {
    try {
        const { id } = req.params;
        const instrument = await prisma_1.prisma.instrument.findFirst({
            where: {
                OR: [{ id }, { instrumentId: id }],
            },
            include: {
                owner: {
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
                applications: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        assignedOfficer: { select: { fullName: true, email: true } },
                        certificate: { select: { certificateNumber: true, status: true, validUntil: true } },
                    },
                },
                certificates: {
                    orderBy: { validUntil: 'desc' },
                    include: {
                        issuedBy: { select: { fullName: true, organizationName: true } },
                    },
                },
            },
        });
        if (!instrument) {
            res.status(404).json({ success: false, message: 'Instrument not found.' });
            return;
        }
        // Role scoping
        if (req.user.role === 'BUSINESS_USER' && instrument.ownerId !== req.user.userId) {
            res.status(403).json({ success: false, message: 'Access denied.' });
            return;
        }
        res.json({ success: true, instrument });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch instrument.' });
    }
}
async function listInstrumentTypes(req, res) {
    try {
        const types = await prisma_1.prisma.instrumentType.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
        res.json({ success: true, types });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch instrument types.' });
    }
}
async function createInstrumentType(req, res) {
    try {
        const { name, category, standardValidityDays, description } = req.body;
        if (!name || !category) {
            res.status(400).json({ success: false, message: 'Name and Category are required.' });
            return;
        }
        const created = await prisma_1.prisma.instrumentType.create({
            data: {
                name,
                category,
                standardValidityDays: parseInt(standardValidityDays, 10) || 365,
                description: description || null,
                isActive: true,
            },
        });
        await (0, auditService_1.logAuditEvent)({
            userId: req.user.userId,
            userName: req.user.fullName,
            userRole: req.user.role,
            action: 'INSTRUMENT_TYPE_CREATED',
            entityType: 'INSTRUMENT_TYPE',
            entityId: created.id,
            details: { name, category },
            req,
        });
        res.status(201).json({ success: true, message: 'Instrument type created.', instrumentType: created });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to create instrument type.' });
    }
}
