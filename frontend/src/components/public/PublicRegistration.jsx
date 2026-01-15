import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import PublicLanding from './PublicLanding';
import RegistrationForm from './RegistrationForm';
import api from '../../api/axios';

const PublicRegistration = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { language, dir, isRTL } = useLanguage();
  const t = useTranslation();

  useEffect(() => {
    fetchEvent();
  }, [slug]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/public/${slug}`);
      setEvent(response.data);
    } catch (err) {
      setError('Event not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setError('');
    setSubmitting(true);

    try {
      await api.post('/registrations/register', {
        eventSlug: slug,
        groupName: selectedGroup.name,
        formData,
        language
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div dir={dir} className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div dir={dir} className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Mail className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className={`text-2xl font-bold mb-2 ${isRTL ? 'font-arabic' : ''}`}>{t.success}</h2>
            <p className="text-gray-600 mb-4">{t.qrSent}</p>
            <Button onClick={() => { setSuccess(false); setSelectedGroup(null); }} className="w-full">
              Register Another
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto pt-12">
        {!selectedGroup ? (
          <PublicLanding event={event} onSelectGroup={setSelectedGroup} />
        ) : (
          <RegistrationForm
            event={event}
            group={selectedGroup}
            onBack={() => setSelectedGroup(null)}
            onSubmit={handleSubmit}
            error={error}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
};

export default PublicRegistration;