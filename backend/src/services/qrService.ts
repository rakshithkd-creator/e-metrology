import QRCode from 'qrcode';

export async function generateQrCode(verifyUrl: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 250,
      color: {
        dark: '#0d3b66',
        light: '#ffffff',
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error('QR Code generation failed');
  }
}
