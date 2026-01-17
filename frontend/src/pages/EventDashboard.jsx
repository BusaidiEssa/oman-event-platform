import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarPlus, Calendar, MapPin, LogOut, Globe, Trash2, Copy, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import api from '../api/axios';

const EventDashboard = ({ onLogout }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedSlug, setCopiedSlug] = useState(null);
  
  const { toggleLanguage, language, isRTL, dir } = useLanguage();
  const t = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (e, eventId) => {
    e.stopPropagation();
    
    if (!window.confirm(t.confirmDelete)) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}`);
      setEvents(events.filter(e => e._id !== eventId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleCopyLink = async (e, slug) => {
    e.stopPropagation();
    
    const registrationUrl = `${window.location.origin}/register/${slug}`;
    
    try {
      await navigator.clipboard.writeText(registrationUrl);
      setCopiedSlug(slug);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopiedSlug(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert(isRTL ? 'فشل النسخ' : 'Failed to copy');
    }
  };

  const handleCardClick = (slug) => {
    navigate(`/event/${slug}/manage`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isRTL 
      ? date.toLocaleDateString('ar-OM')
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div dir={dir} className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-lg">{t.loading}</div>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{t.dashboard}</h1>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={toggleLanguage}>
                <Globe className="w-4 h-4 me-2" />
                {language === 'en' ? 'العربية' : 'English'}
              </Button>
              <Button variant="destructive" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 me-2" />
                {t.logout}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Create Event Button */}
        <div className="mb-6">
          <Button onClick={() => navigate('/create-event')} size="lg">
            <CalendarPlus className="w-5 h-5 me-2" />
            {t.createEvent}
          </Button>
        </div>

        {/* Events Section */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">{t.yourEvents}</h2>
          
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 text-lg mb-4">{t.noEvents}</p>
              <Button onClick={() => navigate('/create-event')}>
                <CalendarPlus className="w-4 h-4 me-2" />
                {t.createEvent}
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card 
                  key={event._id} 
                  className="hover:shadow-lg transition-all hover:border-primary cursor-pointer"
                  onClick={() => handleCardClick(event.slug)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2 text-lg">{event.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(event.date)}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteEvent(e, event._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}

                      <div className="pt-3 border-t text-center">
                        <div className="text-sm font-medium text-gray-700">
                          {event.groups?.length || 0} {t.stakeholderGroups}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {t.clickToManage}
                        </p>
                      </div>

                      <Button
                        variant={copiedSlug === event.slug ? "default" : "secondary"}
                        size="sm"
                        className="w-full"
                        onClick={(e) => handleCopyLink(e, event.slug)}
                      >
                        {copiedSlug === event.slug ? (
                          <>
                            <Check className="w-4 h-4 me-2" />
                            {isRTL ? 'تم النسخ!' : 'Copied!'}
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 me-2" />
                            {isRTL ? 'نسخ رابط التسجيل' : 'Copy Registration Link'}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDashboard;