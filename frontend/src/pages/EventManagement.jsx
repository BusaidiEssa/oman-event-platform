import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import EventFormEditor from '../components/EventFormEditor';
import StakeholderFormEditor from '../components/StakeholderFormEditor';
import RegistrationsList from '../components/RegistrationsList';

import EventAnalytics from './EventAnalytics';
import api from '../api/axios';

const EventManagement = () => {
  const { eventSlug } = useParams(); // Changed from eventId to eventSlug
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  
  const { toggleLanguage, language, dir } = useLanguage();
  const t = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
  }, [eventSlug]);

  const fetchEvent = async () => {
    try {
      // Fetch event by slug - the backend will handle slug vs ID automatically
      const response = await api.get(`/events/${eventSlug}`);
      setEvent(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleEventUpdate = (updatedEvent) => {
    setEvent(updatedEvent);
  };

  if (loading) {
    return (
      <div dir={dir} className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-lg">{t.loading}</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div dir={dir} className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Event not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Top Navigation */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                {t.back}
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
                <p className="text-sm text-gray-600">
                  {new Date(event.date).toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleLanguage}>
              <Globe className="w-4 h-4 me-2" />
              {language === 'en' ? 'العربية' : 'English'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="details">{t.eventDetails}</TabsTrigger>
            <TabsTrigger value="stakeholders">{t.stakeholderFormEditor}</TabsTrigger>
            <TabsTrigger value="registrations">{t.registrationsandcheckin}</TabsTrigger>
            <TabsTrigger value="analytics">{t.analytics}</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <EventFormEditor event={event} onUpdate={handleEventUpdate} />
          </TabsContent>

          <TabsContent value="stakeholders">
            <StakeholderFormEditor event={event} onUpdate={handleEventUpdate} />
          </TabsContent>

          <TabsContent value="registrations">
            <RegistrationsList eventId={event._id} event={event} />
          </TabsContent>

          <TabsContent value="analytics">
            <EventAnalytics eventId={event._id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EventManagement;