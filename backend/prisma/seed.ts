import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting e-Metrology database seeding...');

  // Clear existing data in reverse order of relations
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.verificationMeasurement.deleteMany();
  await prisma.inspectionChecklistItem.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.verificationInspection.deleteMany();
  await prisma.application.deleteMany();
  await prisma.instrument.deleteMany();
  await prisma.checklistConfig.deleteMany();
  await prisma.instrumentType.deleteMany();
  await prisma.user.deleteMany();

  // 1. Checklist Configuration
  const checklistConfigs = [
    { itemKey: 'IDENTIFICATION_VERIFIED', title: 'Instrument Identification & Model Approval Verified', description: 'Check conformity with approved prototype and model approval certificate', isMandatory: true, sortOrder: 1 },
    { itemKey: 'SERIAL_VERIFIED', title: 'Serial Number & Manufacturer Plate Checked', description: 'Serial number clearly engraved and legible on body plate', isMandatory: true, sortOrder: 2 },
    { itemKey: 'PHYSICAL_CONDITION', title: 'Physical & Structural Condition Satisfactory', description: 'Level indicator intact, no signs of mechanical tampering or severe corrosion', isMandatory: true, sortOrder: 3 },
    { itemKey: 'DISPLAY_READOUT', title: 'Digital Readout / Indication Clear & Operational', description: 'Zero tracking, tare functionality, and non-flickering display digits', isMandatory: true, sortOrder: 4 },
    { itemKey: 'ACCURACY_TEST', title: 'Accuracy & Maximum Permissible Error (MPE) Test', description: 'Verification with certified reference standard weights/measures', isMandatory: true, sortOrder: 5 },
    { itemKey: 'SEALING_CONDITION', title: 'Tamper Evident Sealing Facility Available & Sealed', description: 'Lead/wire or holographic security seal applied properly', isMandatory: true, sortOrder: 6 },
    { itemKey: 'REPEATABILITY_TEST', title: 'Repeatability & Eccentricity Test Conducted', description: 'Corner load test / multi-point repeatable readings verified', isMandatory: true, sortOrder: 7 },
    { itemKey: 'DOCUMENTS_VERIFIED', title: 'Supporting Calibration & Registration Documents Checked', description: 'Previous certificate, calibration invoice and user logbook verified', isMandatory: false, sortOrder: 8 },
  ];

  for (const item of checklistConfigs) {
    await prisma.checklistConfig.create({ data: item });
  }

  // 2. Instrument Types
  const instrumentTypes = [
    { name: 'Electronic Weighing Scale', category: 'WEIGHING', standardValidityDays: 365, description: 'Commercial digital scales used for trade and retail transactions' },
    { name: 'Platform Weighing Machine', category: 'WEIGHING', standardValidityDays: 365, description: 'Medium to heavy capacity platform scale for logistics and manufacturing' },
    { name: 'Weighbridge (Heavy Duty)', category: 'WEIGHING', standardValidityDays: 365, description: 'Vehicular weighbridge for gross and tare vehicle weight measurement' },
    { name: 'Retail Counter Scale', category: 'WEIGHING', standardValidityDays: 365, description: 'Compact precision bench scales for grocery and supermarket billing' },
    { name: 'Spring Balance', category: 'WEIGHING', standardValidityDays: 365, description: 'Mechanical spring tension measurement devices' },
    { name: 'Fuel Dispensing Meter', category: 'FLOW', standardValidityDays: 365, description: 'Petrol/Diesel automated delivery nozzle and flow measurement meter' },
    { name: 'Measuring Cylinder & Volumetric', category: 'VOLUME', standardValidityDays: 730, description: 'Standard conical/cylindrical volumetric measures for liquids' },
    { name: 'Length Measuring Instrument', category: 'LENGTH', standardValidityDays: 730, description: 'Steel measuring tapes, fabric measures, and rigid measuring bars' },
    { name: 'Automatic Gravimetric Filling Scale', category: 'WEIGHING', standardValidityDays: 365, description: 'Automated packing and bag-filling verification system' },
  ];

  for (const it of instrumentTypes) {
    await prisma.instrumentType.create({ data: it });
  }

  // 3. Demo Users
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@emetrology.gov.in',
      password: passwordHash,
      fullName: 'Shri Rajesh Kumar Sharma',
      organizationName: 'Department of Legal Metrology, HQ',
      phone: '+91 98110 01100',
      address: 'Vikas Bhawan, Ministry of Consumer Affairs, New Delhi',
      state: 'Delhi',
      district: 'Central Delhi',
      role: 'SUPER_ADMIN',
      status: 'APPROVED',
    },
  });

  const lmo1 = await prisma.user.create({
    data: {
      email: 'lmo.verma@emetrology.gov.in',
      password: passwordHash,
      fullName: 'Anil K. Verma',
      organizationName: 'District Legal Metrology Office, South Zone',
      phone: '+91 98220 02200',
      address: 'District Collectorate Office Complex, Saket',
      state: 'Delhi',
      district: 'South Delhi',
      role: 'LMO',
      status: 'APPROVED',
    },
  });

  const lmo2 = await prisma.user.create({
    data: {
      email: 'lmo.patel@emetrology.gov.in',
      password: passwordHash,
      fullName: 'Dr. Sunita Patel',
      organizationName: 'District Metrology Inspection Wing',
      phone: '+91 98330 03300',
      address: 'Old Secretariat Road, Ahmedabad',
      state: 'Gujarat',
      district: 'Ahmedabad',
      role: 'LMO',
      status: 'APPROVED',
    },
  });

  const gatc = await prisma.user.create({
    data: {
      email: 'gatc.delhi@emetrology.gov.in',
      password: passwordHash,
      fullName: 'National Calibration & Test House (GATC)',
      organizationName: 'Govt Approved Test Centre Delhi (Accredited NABL-LM-042)',
      phone: '+91 98440 04400',
      address: 'Okhla Industrial Area Phase-III, New Delhi',
      state: 'Delhi',
      district: 'South Delhi',
      role: 'GATC',
      status: 'APPROVED',
    },
  });

  const businessUser = await prisma.user.create({
    data: {
      email: 'user@apollologistics.com',
      password: passwordHash,
      fullName: 'Vikram Malhotra',
      organizationName: 'Apollo Warehousing & Logistics Pvt. Ltd.',
      phone: '+91 98765 43210',
      address: 'Plot 45, Transport Nagar, Bijwasan, New Delhi',
      state: 'Delhi',
      district: 'South Delhi',
      role: 'BUSINESS_USER',
      status: 'APPROVED',
    },
  });

  const businessUser2 = await prisma.user.create({
    data: {
      email: 'contact@bharatpetro.com',
      password: passwordHash,
      fullName: 'Pooja Reddy',
      organizationName: 'Bharat Petroleum Retail Franchise #1042',
      phone: '+91 98111 22334',
      address: 'Hosur Main Road, Electronics City, Bengaluru',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      role: 'BUSINESS_USER',
      status: 'APPROVED',
    },
  });

  // 4. Instruments
  const now = new Date();
  const pastYear = new Date();
  pastYear.setFullYear(now.getFullYear() - 1);

  const inst1 = await prisma.instrument.create({
    data: {
      instrumentId: 'LM-INST-2026-000101',
      type: 'Platform Weighing Machine',
      category: 'WEIGHING',
      manufacturer: 'Mettler Toledo India Pvt Ltd',
      model: 'MT-PFA579-1500KG',
      serialNumber: 'MT-2024-984210',
      capacity: '1500 kg',
      accuracyClass: 'Class III',
      unitOfMeasurement: 'kg',
      dateOfManufacture: new Date('2023-11-15'),
      installationDate: new Date('2024-01-10'),
      location: 'Bay 4, Logistics Warehouse, Bijwasan',
      district: 'South Delhi',
      state: 'Delhi',
      status: 'VERIFIED',
      ownerId: businessUser.id,
    },
  });

  const inst2 = await prisma.instrument.create({
    data: {
      instrumentId: 'LM-INST-2026-000102',
      type: 'Weighbridge (Heavy Duty)',
      category: 'WEIGHING',
      manufacturer: 'Avery India Ltd',
      model: 'AV-WB-60TON-PITLESS',
      serialNumber: 'AV-WB-2023-7721',
      capacity: '60,000 kg',
      accuracyClass: 'Class III',
      unitOfMeasurement: 'kg',
      dateOfManufacture: new Date('2023-08-20'),
      installationDate: new Date('2023-10-01'),
      location: 'Main Gate Inbound Truck Scale, Bijwasan Depot',
      district: 'South Delhi',
      state: 'Delhi',
      status: 'PENDING_VERIFICATION',
      ownerId: businessUser.id,
    },
  });

  const inst3 = await prisma.instrument.create({
    data: {
      instrumentId: 'LM-INST-2026-000103',
      type: 'Retail Counter Scale',
      category: 'WEIGHING',
      manufacturer: 'Essae-Teraoka Pvt Ltd',
      model: 'DS-215N POS Ready',
      serialNumber: 'ES-2024-001984',
      capacity: '30 kg',
      accuracyClass: 'Class II',
      unitOfMeasurement: 'kg',
      dateOfManufacture: new Date('2024-02-14'),
      installationDate: new Date('2024-03-01'),
      location: 'Counter No. 1, Express Billing Hub',
      district: 'South Delhi',
      state: 'Delhi',
      status: 'ACTIVE',
      ownerId: businessUser.id,
    },
  });

  const inst4 = await prisma.instrument.create({
    data: {
      instrumentId: 'LM-INST-2026-000104',
      type: 'Fuel Dispensing Meter',
      category: 'FLOW',
      manufacturer: 'Gilbarco Veeder-Root',
      model: 'Horizon MPD 2x2 Nozzle Dispenser',
      serialNumber: 'GVR-2023-DUAL-0442',
      capacity: '50 L/min',
      accuracyClass: 'Class 0.5',
      unitOfMeasurement: 'L',
      dateOfManufacture: new Date('2023-05-12'),
      installationDate: new Date('2023-06-20'),
      location: 'Island 2, High Speed Diesel Bay',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      status: 'ACTIVE',
      ownerId: businessUser2.id,
    },
  });

  const inst5 = await prisma.instrument.create({
    data: {
      instrumentId: 'LM-INST-2026-000105',
      type: 'Electronic Weighing Scale',
      category: 'WEIGHING',
      manufacturer: 'Shimadzu Corp',
      model: 'ATX224 Semi-Micro Analytical',
      serialNumber: 'SHZ-2022-88102',
      capacity: '220 g',
      accuracyClass: 'Class I',
      unitOfMeasurement: 'g',
      dateOfManufacture: new Date('2022-09-01'),
      installationDate: new Date('2022-10-15'),
      location: 'Quality Control Assay Lab, Apollo HQ',
      district: 'South Delhi',
      state: 'Delhi',
      status: 'EXPIRED',
      ownerId: businessUser.id,
    },
  });

  // 5. Applications & Lifecycles
  // App 1: Certified & Verified (Active Certificate)
  const app1SubmittedAt = new Date();
  app1SubmittedAt.setDate(now.getDate() - 60);

  const app1 = await prisma.application.create({
    data: {
      applicationId: 'LM-APP-2026-000101',
      type: 'NEW_VERIFICATION',
      status: 'CERTIFICATE_ISSUED',
      remarks: 'Annual statutory verification for warehouse trade platform scale',
      verificationType: 'ON_SITE',
      scheduledDate: new Date(now.getTime() - 55 * 86400000),
      scheduledTime: '10:30 AM',
      scheduledLocation: 'Bay 4, Logistics Warehouse, Bijwasan, South Delhi',
      submittedAt: app1SubmittedAt,
      reviewedAt: new Date(now.getTime() - 58 * 86400000),
      assignedAt: new Date(now.getTime() - 57 * 86400000),
      scheduledAt: new Date(now.getTime() - 56 * 86400000),
      completedAt: new Date(now.getTime() - 55 * 86400000),
      instrumentId: inst1.id,
      userId: businessUser.id,
      assignedOfficerId: lmo1.id,
    },
  });

  // Inspection for App 1
  const insp1 = await prisma.verificationInspection.create({
    data: {
      inspectionId: 'LM-INSP-2026-000101',
      verificationDate: new Date(now.getTime() - 55 * 86400000),
      verificationType: 'ON_SITE',
      location: 'Bay 4, Logistics Warehouse, Bijwasan, South Delhi',
      gpsLatitude: 28.5284,
      gpsLongitude: 77.0621,
      observations: 'Instrument tested up to full 1500kg capacity utilizing calibrated M1 standard test weights. Zero return and corner load linearity confirmed within permissible limits.',
      remarks: 'All parameters conform to Standards of Weights and Measures (General) Rules. Verification stamped and verified.',
      result: 'PASS',
      photographs: JSON.stringify(['/uploads/sample-scale-front.jpg', '/uploads/sample-stamp-seal.jpg']),
      evidenceDocuments: JSON.stringify(['/uploads/test-weight-calibration-cert.pdf']),
      applicationId: app1.id,
      instrumentId: inst1.id,
      officerId: lmo1.id,
    },
  });

  // Measurements for Insp 1
  const measurements1 = [
    { testName: 'Zero Load Return Test', standardValue: 0.0, observedValue: 0.0, error: 0.0, permissibleError: 0.2, unit: 'kg', result: 'PASS' },
    { testName: 'Quarter Capacity Test (375 kg)', standardValue: 375.0, observedValue: 375.0, error: 0.0, permissibleError: 0.5, unit: 'kg', result: 'PASS' },
    { testName: 'Half Capacity Test (750 kg)', standardValue: 750.0, observedValue: 750.2, error: 0.2, permissibleError: 0.5, unit: 'kg', result: 'PASS' },
    { testName: 'Maximum Capacity Test (1500 kg)', standardValue: 1500.0, observedValue: 1499.8, error: -0.2, permissibleError: 1.0, unit: 'kg', result: 'PASS' },
    { testName: 'Eccentricity (Corner Load) Test', standardValue: 500.0, observedValue: 500.1, error: 0.1, permissibleError: 0.5, unit: 'kg', result: 'PASS' },
  ];
  for (const m of measurements1) {
    await prisma.verificationMeasurement.create({
      data: { ...m, inspectionId: insp1.id },
    });
  }

  // Checklist for Insp 1
  const checklistResults1 = [
    { itemKey: 'IDENTIFICATION_VERIFIED', title: 'Instrument Identification Verified', result: 'PASS', remarks: 'Model certificate approval No. IND/09/2023/452 checked' },
    { itemKey: 'SERIAL_VERIFIED', title: 'Serial Number Verified', result: 'PASS', remarks: 'Serial matches registration database' },
    { itemKey: 'PHYSICAL_CONDITION', title: 'Physical Condition Satisfactory', result: 'PASS', remarks: 'Level bubble centered, base foundation firm' },
    { itemKey: 'DISPLAY_READOUT', title: 'Display Readout Clear', result: 'PASS', remarks: 'LED segments sharp with tare zero' },
    { itemKey: 'ACCURACY_TEST', title: 'Accuracy Test', result: 'PASS', remarks: 'Within MPE as per Class III' },
    { itemKey: 'SEALING_CONDITION', title: 'Sealing Condition', result: 'PASS', remarks: 'Embossed lead seal LM-DELHI-24-0091 applied' },
    { itemKey: 'REPEATABILITY_TEST', title: 'Repeatability Test', result: 'PASS', remarks: 'Standard deviation under 0.1kg' },
    { itemKey: 'DOCUMENTS_VERIFIED', title: 'Supporting Documents Verified', result: 'PASS', remarks: 'Original invoice and registration copy filed' },
  ];
  for (const c of checklistResults1) {
    await prisma.inspectionChecklistItem.create({
      data: { ...c, inspectionId: insp1.id },
    });
  }

  // Certificate 1 (Valid Active Certificate)
  const cert1ValidFrom = new Date(now.getTime() - 55 * 86400000);
  const cert1ValidUntil = new Date(cert1ValidFrom.getTime() + 365 * 86400000);
  await prisma.certificate.create({
    data: {
      certificateNumber: 'LM-CERT-2026-000101',
      qrCodeToken: 'tok-verified-cert-2026-000101-mtpfa',
      verificationDate: cert1ValidFrom,
      validFrom: cert1ValidFrom,
      validUntil: cert1ValidUntil,
      status: 'ACTIVE',
      sealNumber: 'LM-SEAL-DL-2026-8841',
      pdfUrl: '/api/certificates/LM-CERT-2026-000101/pdf',
      applicationId: app1.id,
      instrumentId: inst1.id,
      inspectionId: insp1.id,
      issuedToUserId: businessUser.id,
      issuedByOfficerId: lmo1.id,
    },
  });

  // App 2: Scheduled for Field Inspection (Ready for LMO to perform Live Field Verification!)
  const app2ScheduledDate = new Date();
  app2ScheduledDate.setDate(now.getDate() + 1); // Tomorrow

  const app2 = await prisma.application.create({
    data: {
      applicationId: 'LM-APP-2026-000102',
      type: 'RE_VERIFICATION',
      status: 'SCHEDULED',
      remarks: 'Annual re-verification for heavy 60 Ton pitless weighbridge',
      verificationType: 'ON_SITE',
      scheduledDate: app2ScheduledDate,
      scheduledTime: '11:00 AM',
      scheduledLocation: 'Main Gate Inbound Truck Scale, Bijwasan Depot, South Delhi',
      submittedAt: new Date(now.getTime() - 4 * 86400000),
      reviewedAt: new Date(now.getTime() - 3 * 86400000),
      assignedAt: new Date(now.getTime() - 2 * 86400000),
      scheduledAt: new Date(now.getTime() - 1 * 86400000),
      instrumentId: inst2.id,
      userId: businessUser.id,
      assignedOfficerId: lmo1.id,
    },
  });

  // App 3: Newly Submitted (Ready for Admin Review & Officer Assignment!)
  const app3 = await prisma.application.create({
    data: {
      applicationId: 'LM-APP-2026-000103',
      type: 'NEW_VERIFICATION',
      status: 'SUBMITTED',
      remarks: 'Application for retail POS counter scale initial stamping and certification',
      verificationType: 'ON_SITE',
      submittedAt: new Date(now.getTime() - 12 * 3600000), // 12 hours ago
      instrumentId: inst3.id,
      userId: businessUser.id,
    },
  });

  // App 4: Expiring Soon Certificate (18 days left!)
  const app4VerifiedDate = new Date(now.getTime() - 347 * 86400000); // 347 days ago
  const app4ValidUntil = new Date(app4VerifiedDate.getTime() + 365 * 86400000); // ~18 days from now
  const app4 = await prisma.application.create({
    data: {
      applicationId: 'LM-APP-2026-000104',
      type: 'NEW_VERIFICATION',
      status: 'CERTIFICATE_ISSUED',
      remarks: 'Retail fuel dispensing nozzle automated meter calibration',
      verificationType: 'ON_SITE',
      submittedAt: new Date(app4VerifiedDate.getTime() - 5 * 86400000),
      completedAt: app4VerifiedDate,
      instrumentId: inst4.id,
      userId: businessUser2.id,
      assignedOfficerId: lmo2.id,
    },
  });

  await prisma.certificate.create({
    data: {
      certificateNumber: 'LM-CERT-2025-000984',
      qrCodeToken: 'tok-verified-cert-2025-000984-gvr',
      verificationDate: app4VerifiedDate,
      validFrom: app4VerifiedDate,
      validUntil: app4ValidUntil,
      status: 'EXPIRING_SOON',
      sealNumber: 'LM-SEAL-KA-2025-4412',
      pdfUrl: '/api/certificates/LM-CERT-2025-000984/pdf',
      applicationId: app4.id,
      instrumentId: inst4.id,
      issuedToUserId: businessUser2.id,
      issuedByOfficerId: lmo2.id,
    },
  });

  // App 5: Expired Certificate
  const app5VerifiedDate = new Date(now.getTime() - 400 * 86400000);
  const app5ValidUntil = new Date(app5VerifiedDate.getTime() + 365 * 86400000); // expired ~35 days ago
  const app5 = await prisma.application.create({
    data: {
      applicationId: 'LM-APP-2025-000720',
      type: 'NEW_VERIFICATION',
      status: 'EXPIRED',
      remarks: 'Precision lab analytical balance verification',
      verificationType: 'LABORATORY',
      submittedAt: new Date(app5VerifiedDate.getTime() - 7 * 86400000),
      completedAt: app5VerifiedDate,
      instrumentId: inst5.id,
      userId: businessUser.id,
      assignedGatcId: gatc.id,
      assignedOfficerId: lmo1.id,
    },
  });

  await prisma.certificate.create({
    data: {
      certificateNumber: 'LM-CERT-2025-000720',
      qrCodeToken: 'tok-verified-cert-2025-000720-shz',
      verificationDate: app5VerifiedDate,
      validFrom: app5VerifiedDate,
      validUntil: app5ValidUntil,
      status: 'EXPIRED',
      sealNumber: 'LM-SEAL-DL-2025-1089',
      pdfUrl: '/api/certificates/LM-CERT-2025-000720/pdf',
      applicationId: app5.id,
      instrumentId: inst5.id,
      issuedToUserId: businessUser.id,
      issuedByOfficerId: lmo1.id,
    },
  });

  // 6. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: businessUser.id,
        title: 'Inspection Scheduled',
        message: 'Your application LM-APP-2026-000102 for Weighbridge (Heavy Duty) has been scheduled for tomorrow at 11:00 AM by Officer Anil K. Verma.',
        type: 'VERIFICATION',
        link: '/applications/LM-APP-2026-000102',
        isRead: false,
      },
      {
        userId: businessUser.id,
        title: 'Certificate Issued',
        message: 'Digital Legal Metrology Certificate LM-CERT-2026-000101 has been issued for Platform Weighing Machine. Download PDF now.',
        type: 'CERTIFICATE',
        link: '/certificates/LM-CERT-2026-000101',
        isRead: true,
      },
      {
        userId: businessUser2.id,
        title: 'Certificate Expiring Soon (30-day notice)',
        message: 'Certificate LM-CERT-2025-000984 for Fuel Dispensing Meter is due to expire in 18 days. Please submit a re-verification application.',
        type: 'EXPIRY',
        link: '/certificates/LM-CERT-2025-000984',
        isRead: false,
      },
      {
        userId: lmo1.id,
        title: 'New Field Verification Assigned',
        message: 'Super Admin assigned you application LM-APP-2026-000102 for Weighbridge inspection at Bijwasan Depot.',
        type: 'APPLICATION',
        link: '/field-verification/LM-APP-2026-000102',
        isRead: false,
      },
      {
        userId: admin.id,
        title: 'New Verification Application Received',
        message: 'Apollo Warehousing submitted application LM-APP-2026-000103 for Retail Counter Scale. Pending officer assignment.',
        type: 'APPLICATION',
        link: '/applications/LM-APP-2026-000103',
        isRead: false,
      },
    ],
  });

  // 7. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        userName: admin.fullName,
        userRole: admin.role,
        action: 'USER_LOGIN',
        entityType: 'USER',
        entityId: admin.id,
        details: JSON.stringify({ ip: '127.0.0.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }),
        ipAddress: '127.0.0.1',
      },
      {
        userId: businessUser.id,
        userName: businessUser.fullName,
        userRole: businessUser.role,
        action: 'INSTRUMENT_CREATED',
        entityType: 'INSTRUMENT',
        entityId: inst1.instrumentId,
        newStatus: 'ACTIVE',
        details: JSON.stringify({ model: inst1.model, serial: inst1.serialNumber }),
        ipAddress: '192.168.1.105',
      },
      {
        userId: businessUser.id,
        userName: businessUser.fullName,
        userRole: businessUser.role,
        action: 'APPLICATION_SUBMITTED',
        entityType: 'APPLICATION',
        entityId: app1.applicationId,
        newStatus: 'SUBMITTED',
        details: JSON.stringify({ type: 'NEW_VERIFICATION', instrumentId: inst1.instrumentId }),
        ipAddress: '192.168.1.105',
      },
      {
        userId: admin.id,
        userName: admin.fullName,
        userRole: admin.role,
        action: 'OFFICER_ASSIGNED',
        entityType: 'APPLICATION',
        entityId: app1.applicationId,
        previousStatus: 'APPROVED',
        newStatus: 'ASSIGNED',
        details: JSON.stringify({ assignedOfficer: lmo1.fullName }),
        ipAddress: '127.0.0.1',
      },
      {
        userId: lmo1.id,
        userName: lmo1.fullName,
        userRole: lmo1.role,
        action: 'VERIFICATION_COMPLETED',
        entityType: 'INSPECTION',
        entityId: insp1.inspectionId,
        newStatus: 'PASS',
        details: JSON.stringify({ result: 'PASS', testsPassed: 5 }),
        ipAddress: '192.168.1.42',
      },
      {
        userId: lmo1.id,
        userName: lmo1.fullName,
        userRole: lmo1.role,
        action: 'CERTIFICATE_GENERATED',
        entityType: 'CERTIFICATE',
        entityId: 'LM-CERT-2026-000101',
        newStatus: 'ACTIVE',
        details: JSON.stringify({ certificateNumber: 'LM-CERT-2026-000101', validUntil: cert1ValidUntil }),
        ipAddress: '192.168.1.42',
      },
      {
        userId: businessUser.id,
        userName: businessUser.fullName,
        userRole: businessUser.role,
        action: 'APPLICATION_SUBMITTED',
        entityType: 'APPLICATION',
        entityId: app3.applicationId,
        newStatus: 'SUBMITTED',
        details: JSON.stringify({ type: 'NEW_VERIFICATION', instrumentId: inst3.instrumentId }),
        ipAddress: '192.168.1.105',
      },
    ],
  });

  console.log('✅ e-Metrology database seeding complete!');
  console.log(`
Demo Accounts Available:
---------------------------------------------------------------------------------
1. Super Admin:      admin@emetrology.gov.in       | Password@123
2. LMO (Officer):     lmo.verma@emetrology.gov.in   | Password@123
3. LMO (Gujarat):     lmo.patel@emetrology.gov.in   | Password@123
4. GATC Lab:          gatc.delhi@emetrology.gov.in  | Password@123
5. Business User 1:   user@apollologistics.com      | Password@123
6. Business User 2:   contact@bharatpetro.com       | Password@123
---------------------------------------------------------------------------------
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error in seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
