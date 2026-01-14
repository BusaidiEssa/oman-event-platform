import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import EventCard from './EventCard';
import api from '../../api/axios';

const Dashboard = ({ onLogout }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={dir} className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${isRTL ? 'font-arabic' : ''}`}>
            {t.dashboard}
          </h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={toggleLanguage}>
              <Globe className="w-4 h-4 me-2" />
              {language === 'en' ? 'AR' : 'EN'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              {t.logout}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 mb-6">
          <Button onClick={() => navigate('/create-event')} className="w-full">
            <Plus className="w-4 h-4 me-2" />
            {t.createEvent}
          </Button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              {t.noEvents}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;