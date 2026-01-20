import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  try {
    // If data is already a string (registrationId), use it directly
    const qrString =
      typeof data === 'string' ? data : JSON.stringify(data);

    const qrCodeDataURL = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'M'
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
};
