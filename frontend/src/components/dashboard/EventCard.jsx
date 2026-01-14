import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, QrCode } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

const EventCard = ({ event }) => {
  const { isRTL } = useLanguage();
  const t = useTranslation();
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-2 ${isRTL ? 'font-arabic' : ''}`}>
              {event.title}
            </h3>
            <div className="flex gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 me-1" />
                {new Date(event.date).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 me-1" />
                {event.groups.length} {t.addGroup}
              </span>
            </div>
            <p className="text-gray-600 text-sm">{event.location}</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/analytics/${event._id}`)}
            >
              {t.analytics}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/qr-scanner/${event._id}`)}
            >
              <QrCode className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => window.open(`/register/${event.slug}`, '_blank')}
            >
              {t.register}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;