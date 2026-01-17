import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarPlus, Calendar, MapPin, Users, TrendingUp, LogOut, Globe, UserCheck, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import api from '../api/axios';

const EventDashboard = ({ onLogout }) => {
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { toggleLanguage, language, isRTL, dir } = useLanguage();
  const t = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const eventsResponse = await api.get('/events');
      setEvents(eventsResponse.data);
      
      // Fetch analytics for all events
      const analyticsPromises = eventsResponse.data.map(event => 
        api.get(`/registrations/${event._id}/analytics`).catch(() => null)
      );
      const analyticsResponses = await Promise.all(analyticsPromises);
      
      const analyticsData = {};
      eventsResponse.data.forEach((event, index) => {
        if (analyticsResponses[index]) {
          analyticsData[event._id] = analyticsResponses[index].data;
        }
      });
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err.response?.data?.message || t.loading);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isRTL 
      ? date.toLocaleDateString('ar-OM')
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calculateDashboardStats = () => {
    let totalRegistrations = 0;
    let totalCheckedIn = 0;
    let totalCapacity = 0;

    Object.values(analytics).forEach(eventAnalytics => {
      if (Array.isArray(eventAnalytics)) {
        eventAnalytics.forEach(group => {
          totalRegistrations += group.registrations || 0;
          totalCheckedIn += group.checkedIn || 0;
          totalCapacity += group.capacity || 0;
        });
      }
    });

    return { totalRegistrations, totalCheckedIn, totalCapacity };
  };

  if (loading) {
    return (
      <div dir={dir} className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-lg">{t.loading}</div>
      </div>
    );
  }

  const stats = calculateDashboardStats();
  const utilizationRate = stats.totalCapacity > 0 
    ? ((stats.totalRegistrations / stats.totalCapacity) * 100).toFixed(1) 
    : 0;

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

        {/* Dashboard Statistics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs uppercase tracking-wide">
                {isRTL ? 'إجمالي الفعاليات' : 'Total Events'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{events.length}</div>
                <Calendar className="w-10 h-10 text-blue-500 opacity-75" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs uppercase tracking-wide">
                {t.totalRegistrations}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{stats.totalRegistrations}</div>
                <Users className="w-10 h-10 text-green-500 opacity-75" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {isRTL ? 'من' : 'of'} {stats.totalCapacity} {t.ofCapacity}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs uppercase tracking-wide">
                {t.checkedIn}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{stats.totalCheckedIn}</div>
                <UserCheck className="w-10 h-10 text-purple-500 opacity-75" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stats.totalRegistrations > 0 
                  ? ((stats.totalCheckedIn / stats.totalRegistrations) * 100).toFixed(1)
                  : 0}% {t.checkInRate}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs uppercase tracking-wide">
                {t.utilizationRate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{utilizationRate}%</div>
                <Activity className="w-10 h-10 text-orange-500 opacity-75" />
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <Button onClick={() => navigate('/create-event')} size="lg">
            <CalendarPlus className="w-5 h-5 me-2" />
            {t.createEvent}
          </Button>
        </div>

        {/* Events Section */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">
            {isRTL ? 'فعالياتك' : 'Your Events'}
          </h2>
          
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
              {events.map((event) => {
                const eventAnalytics = analytics[event._id] || [];
                const totalRegs = eventAnalytics.reduce((sum, g) => sum + (g.registrations || 0), 0);
                const totalChecked = eventAnalytics.reduce((sum, g) => sum + (g.checkedIn || 0), 0);

                return (
                  <Card key={event._id} className="hover:shadow-lg transition-all hover:border-primary">
                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-lg">{event.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(event.date)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        )}
                        
                        {/* Mini Stats */}
                        <div className="grid grid-cols-3 gap-2 py-3 border-y">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">{isRTL ? 'مجموعات' : 'Groups'}</div>
                            <div className="text-lg font-semibold">{event.groups?.length || 0}</div>
                          </div>
                          <div className="text-center border-x">
                            <div className="text-xs text-gray-500">{isRTL ? 'تسجيلات' : 'Regs'}</div>
                            <div className="text-lg font-semibold text-blue-600">{totalRegs}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">{isRTL ? 'حضور' : 'Checked'}</div>
                            <div className="text-lg font-semibold text-green-600">{totalChecked}</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate(`/event/${event._id}/analytics`)}
                          >
                            <TrendingUp className="w-4 h-4 me-1" />
                            {t.analytics}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteEvent(event._id)}
                          >
                            {t.delete}
                          </Button>
                        </div>

                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(`/register/${event.slug}`, '_blank')}
                        >
                          {t.viewRegistrationPage}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDashboard;