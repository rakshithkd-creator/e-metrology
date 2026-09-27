"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQrCode = generateQrCode;
const qrcode_1 = __importDefault(require("qrcode"));
async function generateQrCode(verifyUrl) {
    try {
        const qrDataUrl = await qrcode_1.default.toDataURL(verifyUrl, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 250,
            color: {
                dark: '#0d3b66',
                light: '#ffffff',
            },
        });
        return qrDataUrl;
    }
    catch (error) {
        console.error('Failed to generate QR code:', error);
        throw new Error('QR Code generation failed');
    }
}
