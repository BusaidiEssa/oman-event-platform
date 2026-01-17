import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import GroupSelection from '../components/GroupSelection';
import DynamicForm from '../components/DynamicForm';
import api from '../api/axios';

const PublicRegistration = () => {
  const { eventSlug } = useParams();
  const [event, setEvent] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  
  const { toggleLanguage, language, isRTL, dir } = useLanguage();
  const t = useTranslation();

  useEffect(() => {
    fetchEvent();
  }, [eventSlug]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/public/${eventSlug}`);
      setEvent(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Event not found');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setError('');
  };

  const handleBackToSelection = () => {
    setSelectedGroup(null);
    setError('');
  };

  const handleRegistrationSuccess = (data) => {
    setSuccess(true);
    setQrCode(data.qrCode);
  };

  if (loading) {
    return (
      <div dir={dir} className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-lg">{t.loading}</div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div dir={dir} className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="py-8">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div dir={dir} className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-700">{t.success}</CardTitle>
            <CardDescription>
              {isRTL 
                ? 'تم تسجيلك بنجاح! تحقق من بريدك الإلكتروني للحصول على رمز QR.'
                : 'You have been registered successfully! Check your email for your QR code.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {qrCode && (
              <div className="bg-white p-4 rounded-lg inline-block">
                <img src={qrCode} alt="QR Code" className="w-48 h-48 mx-auto" />
                <p className="text-sm text-gray-600 mt-2">
                  {isRTL 
                    ? 'احفظ هذا الرمز لتسجيل الدخول'
                    : 'Save this code for check-in'}
                </p>
              </div>
            )}
            <Button onClick={() => window.location.reload()} variant="outline">
               {t.registerAnother}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="sm" onClick={toggleLanguage}>
            <Globe className="w-4 h-4 me-2" />
            {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>

        {/* Event Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">{event.title}</CardTitle>
            <CardDescription className="text-base">
              {new Date(event.date).toLocaleDateString(isRTL ? 'ar-OM' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </CardDescription>
            {event.location && (
              <CardDescription className="text-base mt-1">
                📍 {event.location}
              </CardDescription>
            )}
            {event.description && (
              <p className="text-gray-700 mt-3">{event.description}</p>
            )}
          </CardHeader>
        </Card>

        {/* Main Content */}
        {!selectedGroup ? (
          <GroupSelection
            groups={event.groups}
            onSelect={handleGroupSelect}
          />
        ) : (
          <DynamicForm
            event={event}
            group={selectedGroup}
            onBack={handleBackToSelection}
            onSuccess={handleRegistrationSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default PublicRegistration;