import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '../context/LanguageContext';
import { LogOut, CalendarPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Homepage = ({ onLogout }) => {
  const { isRTL, dir } = useLanguage();
  const navigate = useNavigate();

  return (
    <div
      dir={dir}
      className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6"
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className={isRTL ? 'font-arabic' : ''}>
              Home Page (Test)
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-gray-700">
              ✅ You are logged in successfully.
            </p>

            <div className="flex gap-3">
              <Button onClick={() => navigate('/create-event')}>
                <CalendarPlus className="w-4 h-4 me-2" />
                Create Event
              </Button>

              <Button variant="destructive" onClick={onLogout}>
                <LogOut className="w-4 h-4 me-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Homepage;
