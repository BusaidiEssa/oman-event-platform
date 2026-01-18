import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Search } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import QRScannerTab from './QRScannerTab';
import RegistrationsListTab from './RegistrationsListTab';
import api from '../api/axios';

const RegistrationsList = ({ eventId, event }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scanMode, setScanMode] = useState('scanner'); // 'scanner' or 'list'
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInResult, setCheckInResult] = useState(null);

  const t = useTranslation();
  const { isRTL } = useLanguage();

  useEffect(() => {
    fetchRegistrations();
  }, [eventId]);

  const fetchRegistrations = async () => {
    try {
      const response = await api.get(`/registrations/${eventId}`);
      setRegistrations(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const performCheckIn = async (code) => {
    if (!code || !code.trim()) return;

    setCheckInLoading(true);
    setCheckInResult(null);
    setError('');

    try {
      const response = await api.post('/registrations/checkin', {
        qrCode: code.trim()
      });

      setCheckInResult({
        success: true,
        data: response.data
      });

      // Update local registrations
      setRegistrations(registrations.map(r =>
        r._id === response.data.registration._id
          ? response.data.registration
          : r
      ));

      // Auto-clear result
      setTimeout(() => {
        setCheckInResult(null);
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Check-in failed';

      if (err.response?.status === 400 && errorMessage.includes('Already checked in')) {
        setCheckInResult({
          success: false,
          message: isRTL ? 'تم تسجيل الدخول مسبقاً' : 'Already checked in',
          data: err.response.data
        });
      } else if (err.response?.status === 404) {
        setCheckInResult({
          success: false,
          message: isRTL ? 'رمز QR غير صالح' : 'Invalid QR code'
        });
      } else {
        setError(errorMessage);
      }

      setTimeout(() => {
        setCheckInResult(null);
      }, 3000);
    } finally {
      setCheckInLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          {t.loading}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <Button
          variant={scanMode === 'scanner' ? 'default' : 'ghost'}
          onClick={() => setScanMode('scanner')}
          className="rounded-b-none"
        >
          <Camera className="w-4 h-4 me-2" />
          {isRTL ? 'ماسح QR' : 'QR Scanner'}
        </Button>
        <Button
          variant={scanMode === 'list' ? 'default' : 'ghost'}
          onClick={() => setScanMode('list')}
          className="rounded-b-none"
        >
          <Search className="w-4 h-4 me-2" />
          {isRTL ? 'قائمة التسجيلات' : 'Registrations'} ({registrations.length})
        </Button>
      </div>

      {/* QR Scanner Tab */}
      {scanMode === 'scanner' && (
        <QRScannerTab
          onCheckIn={performCheckIn}
          isLoading={checkInLoading}
          checkInResult={checkInResult}
        />
      )}

      {/* Registrations List Tab */}
      {scanMode === 'list' && (
        <RegistrationsListTab
          registrations={registrations}
          setRegistrations={setRegistrations}
          eventId={eventId}
        />
      )}
    </div>
  );
};

export default RegistrationsList;