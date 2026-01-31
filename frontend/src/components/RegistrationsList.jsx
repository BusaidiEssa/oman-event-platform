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
  const [scanMode, setScanMode] = useState('scanner'); // 'scanner' 
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
  const performCheckIn = async (qrCodeData) => {
    setCheckInLoading(true);
    setCheckInResult(null);

    try {
      console.log('Raw QR Code Data received:', qrCodeData);

      // Send the raw qrCodeData to the backend
      // The backend will handle parsing it
      const response = await api.post("/registrations/checkin", {
        qrCode: qrCodeData, // Send the entire scanned text
      });

      setCheckInResult({
        success: true,
        data: response.data,
      });

      // Update local registrations
      setRegistrations(
        registrations.map((r) =>
          r._id === response.data.registration._id ? response.data.registration : r
        )
      );

      // Auto-clear result after 3 seconds
      setTimeout(() => {
        setCheckInResult(null);
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Check-in failed";

      setCheckInResult({
        success: false,
        message: errorMessage,
      });

      // Auto-clear result after 3 seconds
      setTimeout(() => {
        setCheckInResult(null);
      }, 3000);
    } finally {
      setCheckInLoading(false);
    }
  };

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
