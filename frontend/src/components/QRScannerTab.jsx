import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle, XCircle } from 'lucide-react';

const QRScannerTab = ({ onCheckIn, isLoading, checkInResult }) => {
  const { isRTL } = useLanguage();
  const [lastScanned, setLastScanned] = useState('');

  const handleQRScan = (result) => {
    if (!result) return;

    try {
      const scannedText = result[0]?.rawValue || result.getText?.() || result;
      
      // Prevent duplicate scans
      if (scannedText === lastScanned) return;
      setLastScanned(scannedText);
      
      console.log('Scanned QR:', scannedText);

      // Try to parse as JSON first (new format)
      try {
        const qrData = JSON.parse(scannedText);
        // Extract the registrationId which is used as the qrCode in the database
        const registrationId = qrData.registrationId || qrData.qrCode;
        if (registrationId) {
          onCheckIn(registrationId);
        } else {
          console.error('No registrationId found in QR data');
        }
      } catch (parseError) {
        // If not JSON, treat as plain text (old format or manual entry)
        onCheckIn(scannedText);
      }

      // Clear after 2 seconds to allow re-scanning
      setTimeout(() => setLastScanned(''), 2000);
    } catch (err) {
      console.error('QR Scan error:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isRTL ? 'ماسح QR' : 'QR Scanner'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
          <Scanner
            onScan={handleQRScan}
            onError={(error) => console.debug('QR Error:', error)}
            constraints={{
              facingMode: 'environment',
              aspectRatio: 1
            }}
            styles={{
              container: { width: '100%', height: '400px' }
            }}
          />
        </div>

        {checkInResult && (
          <Card
            className={`border-2 ${
              checkInResult.success
                ? 'border-green-500 bg-green-50'
                : 'border-orange-500 bg-orange-50'
            }`}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                {checkInResult.success ? (
                  <>
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <h3 className="font-bold text-green-700 mb-1">
                      {isRTL ? 'تم التسجيل بنجاح!' : 'Check-in Successful!'}
                    </h3>
                    <p className="text-sm text-gray-700">
                      {checkInResult.data?.registration?.groupName}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {checkInResult.data?.registration?.formData?.['Full Name'] || 
                       checkInResult.data?.registration?.email}
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-12 h-12 mx-auto mb-2 text-orange-500" />
                    <h3 className="font-bold text-orange-700">
                      {checkInResult.message}
                    </h3>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default QRScannerTab;