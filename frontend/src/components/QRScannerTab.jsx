import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle, XCircle } from 'lucide-react';

const QRScannerTab = ({ onCheckIn, isLoading, checkInResult }) => {
  const { isRTL } = useLanguage();

  const handleQRScan = (result) => {
    if (!result) return;

    try {
      const decodedText = result.getText();
      onCheckIn(decodedText);
    } catch (err) {
      console.debug('QR Scan error:', err);
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
            onDecode={handleQRScan}
            onError={(error) => console.debug('QR Error:', error)}
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