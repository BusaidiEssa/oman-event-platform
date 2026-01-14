import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  try {
    const qrString = JSON.stringify(data);
    const qrCodeDataURL = await QRCode.toDataURL(qrString);
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
};