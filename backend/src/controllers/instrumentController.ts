import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAuditEvent } from '../services/auditService';
import { createNotification } from '../services/notificationService';

const instrumentSchema = z.object({
  type: z.string().min(1, 'Instrument type is required'),
  category: z.string().default('WEIGHING'),
  manufacturer: z.string().min(1, 'Manufacturer name is required'),
  model: z.string().min(1, 'Model is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  capacity: z.string().min(1, 'Capacity is required'),
  accuracyClass: z.string().min(1, 'Accuracy class is required'),
  unitOfMeasurement: z.string().min(1, 'Unit of measurement is required'),
  dateOfManufacture: z.string().optional(),
  installationDate: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  previousVerificationNumber: z.string().optional(),
  previousVerificationDate: z.string().optional(),
  previousValidityDate: z.string().optional(),
  photographUrl: z.string().optional(),
  supportingDocsUrl: z.string().optional(),
});

export async function listInstruments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { category, type, district, status, search, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Role scoping: Business users see their own instruments; Admins & Officers can view all
    if (req.user!.role === 'BUSINESS_USER') {
      where.ownerId = req.user!.userId;
    }

    if (category) where.category = category as string;
    if (type) where.type = type as string;
    if (district) where.district = district as string;
    if (status) where.status = status as string;
    if (search) {
      where.OR = [
        { instrumentId: { contains: search as string } },
        { serialNumber: { contains: search as string } },
        { manufacturer: { contains: search as string } },
        { model: { contains: search as string } },
        { location: { contains: search as string } },
      ];
    }

    const [instruments, total] = await Promise.all([
      prisma.instrument.findMany({
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
      prisma.instrument.count({ where }),
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve instruments.' });
  }
}

export async function createInstrument(req: AuthenticatedRequest, res: Response): Promise<void> {
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
    const existing = await prisma.instrument.findUnique({
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
    const count = await prisma.instrument.count();
    const year = new Date().getFullYear();
    const seq = String(count + 101).padStart(6, '0');
    const instrumentId = `LM-INST-${year}-${seq}`;

    const instrument = await prisma.instrument.create({
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
        ownerId: req.user!.userId,
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

    await logAuditEvent({
      userId: req.user!.userId,
      userName: req.user!.fullName,
      userRole: req.user!.role,
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

    await createNotification({
      userId: req.user!.userId,
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
  } catch (error: any) {
    console.error('Create instrument error:', error);
    res.status(500).json({ success: false, message: 'Failed to register instrument.' });
  }
}

export async function getInstrument(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const instrument = await prisma.instrument.findFirst({
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
    if (req.user!.role === 'BUSINESS_USER' && instrument.ownerId !== req.user!.userId) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    res.json({ success: true, instrument });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch instrument.' });
  }
}

export async function listInstrumentTypes(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const types = await prisma.instrumentType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, types });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch instrument types.' });
  }
}

export async function createInstrumentType(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, category, standardValidityDays, description } = req.body;
    if (!name || !category) {
      res.status(400).json({ success: false, message: 'Name and Category are required.' });
      return;
    }

    const created = await prisma.instrumentType.create({
      data: {
        name,
        category,
        standardValidityDays: parseInt(standardValidityDays, 10) || 365,
        description: description || null,
        isActive: true,
      },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: 'INSTRUMENT_TYPE_CREATED',
      entityType: 'INSTRUMENT_TYPE',
      entityId: created.id,
      details: { name, category },
      req,
    });

    res.status(201).json({ success: true, message: 'Instrument type created.', instrumentType: created });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create instrument type.' });
  }
}
