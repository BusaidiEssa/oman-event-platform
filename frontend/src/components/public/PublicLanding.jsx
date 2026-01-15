import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const PublicLanding = ({ event, onSelectGroup }) => {
  const { toggleLanguage, language, isRTL } = useLanguage();

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-end mb-2">
          <Button variant="ghost" size="sm" onClick={toggleLanguage}>
            <Globe className="w-4 h-4 me-2" />
            {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>
        <CardTitle className={`text-3xl mb-4 ${isRTL ? 'font-arabic' : ''}`}>
          {event.title}
        </CardTitle>
        <div className="flex justify-center gap-6 text-sm text-gray-600">
          <span className="flex items-center">
            <Calendar className="w-4 h-4 me-2" />
            {new Date(event.date).toLocaleDateString()}
          </span>
          {event.location && (
            <span className="flex items-center">
              <MapPin className="w-4 h-4 me-2" />
              {event.location}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <RoleSelection groups={event.groups} onSelect={onSelectGroup} />
      </CardContent>
    </Card>
  );
};
export default PublicLanding;
