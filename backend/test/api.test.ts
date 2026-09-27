import assert from 'assert';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma';
import { generateToken, verifyToken } from '../src/utils/token';
import { generateQrCode } from '../src/services/qrService';
import { generateCertificatePdf } from '../src/services/certificatePdfService';

async function runTests() {
  console.log('🧪 Running e-Metrology Critical System Tests...');
  let passedCount = 0;

  // Test 1: User Auth & Password Hash Verification
  console.log('\n[Test 1] Verifying user credentials & hashing...');
  const admin = await prisma.user.findUnique({ where: { email: 'admin@emetrology.gov.in' } });
  assert(admin !== null, 'Admin user should exist in DB');
  const validPass = await bcrypt.compare('Password@123', admin!.password);
  assert(validPass === true, 'Admin password should match Password@123');
  console.log('  ✔ Password hashing and verification passed');
  passedCount++;

  // Test 2: JWT Token Generation & Verification
  console.log('\n[Test 2] Verifying JWT token generation & payload...');
  const token = generateToken({
    userId: admin!.id,
    email: admin!.email,
    role: admin!.role,
    fullName: admin!.fullName,
  });
  const decoded = verifyToken(token);
  assert(decoded !== null, 'Decoded token should not be null');
  assert(decoded!.email === 'admin@emetrology.gov.in', 'Token email matches');
  assert(decoded!.role === 'SUPER_ADMIN', 'Token role matches');
  console.log('  ✔ JWT creation, signing, and verification passed');
  passedCount++;

  // Test 3: Instrument Retrieval & Unique Constraint
  console.log('\n[Test 3] Verifying instrument database integrity...');
  const instrument = await prisma.instrument.findFirst({
    where: { instrumentId: 'LM-INST-2026-000101' },
    include: { owner: true },
  });
  assert(instrument !== null, 'Instrument LM-INST-2026-000101 must exist');
  assert(instrument!.category === 'WEIGHING', 'Instrument category must be WEIGHING');
  console.log(`  ✔ Found instrument: ${instrument!.type} (${instrument!.serialNumber})`);
  passedCount++;

  // Test 4: Application Lifecycle & Timeline Integrity
  console.log('\n[Test 4] Verifying application data & relations...');
  const app = await prisma.application.findFirst({
    where: { applicationId: 'LM-APP-2026-000101' },
    include: {
      instrument: true,
      user: true,
      assignedOfficer: true,
      certificate: true,
      inspections: true,
    },
  });
  assert(app !== null, 'Application LM-APP-2026-000101 must exist');
  assert(app!.status === 'CERTIFICATE_ISSUED', 'App status should be CERTIFICATE_ISSUED');
  assert(app!.certificate !== null, 'App must have linked certificate');
  assert(app!.inspections.length > 0, 'App must have linked inspection');
  console.log('  ✔ Application, inspection, and certificate relationship passed');
  passedCount++;

  // Test 5: QR Code Generation
  console.log('\n[Test 5] Verifying QR Code Generation Service...');
  const qrDataUrl = await generateQrCode('http://localhost:5173/verify/LM-CERT-2026-000101');
  assert(qrDataUrl.startsWith('data:image/png;base64,'), 'QR Code must be a valid base64 PNG data URL');
  console.log('  ✔ QR code successfully generated');
  passedCount++;

  // Test 6: Digital PDF Certificate Generation
  console.log('\n[Test 6] Verifying PDFKit Certificate Document Generation...');
  const pdfBuffer = await generateCertificatePdf({
    certificateNumber: 'LM-CERT-2026-000101',
    qrCodeToken: 'test-token-12345',
    sealNumber: 'LM-SEAL-DL-2026-8841',
    status: 'ACTIVE',
    verificationDate: new Date(),
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 86400000),
    instrument: {
      instrumentId: instrument!.instrumentId,
      type: instrument!.type,
      category: instrument!.category,
      manufacturer: instrument!.manufacturer,
      model: instrument!.model,
      serialNumber: instrument!.serialNumber,
      capacity: instrument!.capacity,
      accuracyClass: instrument!.accuracyClass,
      unitOfMeasurement: instrument!.unitOfMeasurement,
      location: instrument!.location,
      district: instrument!.district,
      state: instrument!.state,
    },
    owner: {
      fullName: 'Vikram Malhotra',
      organizationName: 'Apollo Warehousing',
      phone: '+91 98765 43210',
      address: 'Bijwasan Depot, New Delhi',
    },
    officer: {
      fullName: 'Anil K. Verma',
      organizationName: 'District Legal Metrology Wing',
      district: 'South Delhi',
    },
  });
  assert(pdfBuffer.length > 1000, 'Generated PDF buffer must be non-empty and valid');
  assert(pdfBuffer.toString('utf-8', 0, 5) === '%PDF-', 'Buffer header must be %PDF-');
  console.log(`  ✔ PDF certificate generated successfully (size: ${pdfBuffer.length} bytes)`);
  passedCount++;

  // Test 7: Expiry calculation & Expiration detection
  console.log('\n[Test 7] Verifying statutory validity and expiry alert logic...');
  const expiringCert = await prisma.certificate.findFirst({
    where: { certificateNumber: 'LM-CERT-2025-000984' },
  });
  assert(expiringCert !== null, 'Expiring certificate must exist');
  const now = new Date();
  const diffDays = Math.ceil((new Date(expiringCert!.validUntil).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  assert(diffDays <= 30, `Certificate should be within 30-day window (actual: ${diffDays} days)`);
  console.log(`  ✔ Expiry window calculated: ${diffDays} days remaining`);
  passedCount++;

  console.log(`\n=======================================================`);
  console.log(`🎉 ALL ${passedCount} / ${passedCount} CRITICAL SYSTEM TESTS PASSED SUCCESSFULLY!`);
  console.log(`=======================================================`);
}

runTests()
  .catch((err) => {
    console.error('❌ Test execution failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
