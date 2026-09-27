import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

interface CertificatePdfData {
  certificateNumber: string;
  qrCodeToken: string;
  sealNumber?: string | null;
  status: string;
  verificationDate: Date;
  validFrom: Date;
  validUntil: Date;
  instrument: {
    instrumentId: string;
    type: string;
    category: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    capacity: string;
    accuracyClass: string;
    unitOfMeasurement: string;
    location: string;
    district: string;
    state: string;
  };
  owner: {
    fullName: string;
    organizationName?: string | null;
    phone: string;
    address?: string | null;
  };
  officer: {
    fullName: string;
    organizationName?: string | null;
    district?: string | null;
  };
}

export async function generateCertificatePdf(data: CertificatePdfData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 36,
        info: {
          Title: `Legal Metrology Certificate - ${data.certificateNumber}`,
          Author: 'Department of Legal Metrology',
          Subject: 'Statutory Verification Certificate',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      const appUrl = process.env.APP_URL || 'http://localhost:5173';
      const verifyUrl = `${appUrl}/verify/${data.certificateNumber}`;
      const qrBuffer = await QRCode.toBuffer(verifyUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 120,
        color: { dark: '#0d3b66', light: '#ffffff' },
      });

      // Decorative double border
      const width = doc.page.width;
      const height = doc.page.height;

      doc.rect(20, 20, width - 40, height - 40)
        .lineWidth(3)
        .strokeColor('#0d3b66')
        .stroke();

      doc.rect(25, 25, width - 50, height - 50)
        .lineWidth(1)
        .strokeColor('#d97706')
        .stroke();

      // Top Government Header
      doc.fillColor('#0d3b66')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('GOVERNMENT OF INDIA', { align: 'center' });

      doc.fontSize(13)
        .font('Helvetica-Bold')
        .text('DEPARTMENT OF LEGAL METROLOGY', { align: 'center' });

      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#4b5563')
        .text('(Under The Legal Metrology Act, 2009 & Legal Metrology Rules, 2011)', { align: 'center' });

      doc.moveDown(0.5);

      // Certificate Title Banner
      doc.rect(35, doc.y, width - 70, 26)
        .fillColor('#0d3b66')
        .fill();

      const bannerY = doc.y - 20;
      doc.fillColor('#ffffff')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('DIGITAL CERTIFICATE OF VERIFICATION', 35, bannerY, { align: 'center', width: width - 70 });

      doc.moveDown(1.2);

      // Certificate Number & Status Row
      const certHeaderY = doc.y;
      doc.fillColor('#1f2937').fontSize(10).font('Helvetica-Bold');
      doc.text(`Certificate No: `, 45, certHeaderY, { continued: true });
      doc.font('Helvetica').fillColor('#0d3b66').text(data.certificateNumber);

      doc.font('Helvetica-Bold').fillColor('#1f2937');
      doc.text(`Status: `, width - 200, certHeaderY, { continued: true });
      doc.font('Helvetica-Bold')
        .fillColor(data.status === 'ACTIVE' ? '#15803d' : data.status === 'EXPIRING_SOON' ? '#d97706' : '#b91c1c')
        .text(data.status);

      doc.font('Helvetica-Bold').fillColor('#1f2937');
      doc.text(`Security Seal No: `, 45, certHeaderY + 16, { continued: true });
      doc.font('Helvetica').fillColor('#4b5563').text(data.sealNumber || 'N/A');

      doc.text(`Date of Issue: `, width - 200, certHeaderY + 16, { continued: true });
      doc.font('Helvetica').fillColor('#4b5563').text(new Date(data.verificationDate).toLocaleDateString('en-GB'));

      doc.moveDown(2);

      // Preamble Text
      doc.fillColor('#374151')
        .fontSize(9)
        .font('Helvetica')
        .text(
          'This is to certify that the weighing / measuring instrument described below has been verified and stamped in accordance with the provisions of Section 24 of the Legal Metrology Act, 2009 and the rules made thereunder, having satisfied the statutory tests and maximum permissible error tolerances.',
          45,
          doc.y,
          { width: width - 90, align: 'justify' }
        );

      doc.moveDown(1);

      // Table 1: Instrument & Owner Details
      const tableStartY = doc.y;
      const leftColX = 45;
      const rightColX = width / 2 + 10;
      const colWidth = width / 2 - 55;

      // Section Box
      doc.rect(40, tableStartY, width - 80, 160)
        .lineWidth(1)
        .strokeColor('#e5e7eb')
        .fillColor('#f9fafb')
        .fillAndStroke();

      let rowY = tableStartY + 10;

      // Left Column: Instrument Specs
      doc.fillColor('#0d3b66').fontSize(10).font('Helvetica-Bold').text('INSTRUMENT SPECIFICATIONS', leftColX, rowY);
      rowY += 16;

      const leftFields = [
        ['Instrument ID', data.instrument.instrumentId],
        ['Instrument Type', data.instrument.type],
        ['Manufacturer', data.instrument.manufacturer],
        ['Model No', data.instrument.model],
        ['Serial Number', data.instrument.serialNumber],
        ['Max Capacity', data.instrument.capacity],
        ['Accuracy Class', `${data.instrument.accuracyClass} (${data.instrument.unitOfMeasurement})`],
      ];

      for (const [label, val] of leftFields) {
        doc.fillColor('#6b7280').fontSize(8.5).font('Helvetica').text(`${label}: `, leftColX, rowY, { continued: true });
        doc.fillColor('#111827').font('Helvetica-Bold').text(val);
        rowY += 14;
      }

      // Right Column: Owner & Location
      rowY = tableStartY + 10;
      doc.fillColor('#0d3b66').fontSize(10).font('Helvetica-Bold').text('USER & INSTALLATION DETAILS', rightColX, rowY);
      rowY += 16;

      const rightFields = [
        ['Registered User', data.owner.fullName],
        ['Organization', data.owner.organizationName || 'N/A'],
        ['Contact Phone', data.owner.phone],
        ['Installation Site', data.instrument.location],
        ['District / State', `${data.instrument.district}, ${data.instrument.state}`],
      ];

      for (const [label, val] of rightFields) {
        doc.fillColor('#6b7280').fontSize(8.5).font('Helvetica').text(`${label}: `, rightColX, rowY, { continued: true });
        doc.fillColor('#111827').font('Helvetica-Bold').text(val);
        rowY += 14;
      }

      // Validity Box
      const validityY = tableStartY + 175;
      doc.rect(40, validityY, width - 80, 48)
        .fillColor('#eff6ff')
        .lineWidth(1)
        .strokeColor('#bfdbfe')
        .fillAndStroke();

      doc.fillColor('#1e40af').fontSize(10).font('Helvetica-Bold');
      doc.text('STATUTORY VALIDITY PERIOD', 55, validityY + 8);

      doc.fontSize(9.5).font('Helvetica').fillColor('#1e3a8a');
      doc.text(
        `Valid From: ${new Date(data.validFrom).toLocaleDateString('en-GB')}  |  Valid Until: ${new Date(data.validUntil).toLocaleDateString('en-GB')}`,
        55,
        validityY + 26
      );

      // QR Code and Signatures Section
      const bottomY = validityY + 65;

      // QR Code placement
      doc.image(qrBuffer, 50, bottomY, { width: 100 });
      doc.fontSize(7.5).fillColor('#6b7280').font('Helvetica')
        .text('Scan to Verify Authenticity', 45, bottomY + 105, { width: 110, align: 'center' });

      // Verifying Officer Box
      const officerBoxX = 180;
      const officerBoxWidth = width - officerBoxX - 45;

      doc.rect(officerBoxX, bottomY, officerBoxWidth, 115)
        .lineWidth(1)
        .strokeColor('#e5e7eb')
        .fillColor('#ffffff')
        .fillAndStroke();

      doc.fillColor('#0d3b66').fontSize(9.5).font('Helvetica-Bold')
        .text('ISSUING AUTHORITY & DIGITAL ENDORSEMENT', officerBoxX + 12, bottomY + 10);

      doc.fontSize(8.5).font('Helvetica').fillColor('#374151');
      doc.text(`Verifying Officer: `, officerBoxX + 12, bottomY + 30, { continued: true });
      doc.font('Helvetica-Bold').text(data.officer.fullName);

      doc.font('Helvetica').text(`Jurisdiction / Office: `, officerBoxX + 12, bottomY + 44, { continued: true });
      doc.font('Helvetica-Bold').text(data.officer.organizationName || 'District Legal Metrology Wing');

      doc.fontSize(7.5).font('Helvetica').fillColor('#059669');
      doc.text('✔ DIGITALLY SIGNED & VERIFIED ON E-METROLOGY PORTAL', officerBoxX + 12, bottomY + 62);

      doc.fontSize(7).fillColor('#9ca3af').font('Helvetica')
        .text(`Verification URL: ${verifyUrl}`, officerBoxX + 12, bottomY + 78, { width: officerBoxWidth - 24 });
      doc.text('This is a computer-generated certificate. No physical signature required under IT Act 2000.', officerBoxX + 12, bottomY + 92, { width: officerBoxWidth - 24 });

      // Bottom Footer Legal Notice
      doc.rect(35, height - 52, width - 70, 20)
        .fillColor('#f3f4f6')
        .fill();

      doc.fontSize(7).font('Helvetica').fillColor('#6b7280')
        .text(
          'Notice: Tampering with this certificate or its security seal is an offense punishable under Section 44 of the Legal Metrology Act, 2009.',
          40,
          height - 47,
          { width: width - 80, align: 'center' }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
