import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Users, UserCheck, Clock, TrendingUp, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import AnalyticsChart from '../components/AnalyticsChart';
import api from '../api/axios';

const EventAnalytics = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { toggleLanguage, language, isRTL, dir } = useLanguage();
  const t = useTranslation();

  useEffect(() => {
    fetchAnalytics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [eventId]);

  const fetchAnalytics = async () => {
    try {
      const [analyticsRes, eventRes] = await Promise.all([
        api.get(`/registrations/${eventId}/analytics`),
        api.get('/events')
      ]);
      
      setAnalytics(analyticsRes.data);
      const currentEvent = eventRes.data.find(e => e._id === eventId);
      setEvent(currentEvent);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    return analytics.reduce((acc, group) => ({
      totalRegistrations: acc.totalRegistrations + group.registrations,
      totalCheckedIn: acc.totalCheckedIn + group.checkedIn,
      totalCapacity: acc.totalCapacity + group.capacity
    }), { totalRegistrations: 0, totalCheckedIn: 0, totalCapacity: 0 });
  };

  if (loading) {
    return (
      <div dir={dir} className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-lg">{t.loading}</div>
      </div>
    );
  }

  const totals = calculateTotals();
  const utilizationRate = totals.totalCapacity > 0 
    ? ((totals.totalRegistrations / totals.totalCapacity) * 100).toFixed(1) 
    : 0;
  const checkInRate = totals.totalRegistrations > 0 
    ? ((totals.totalCheckedIn / totals.totalRegistrations) * 100).toFixed(1) 
    : 0;

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{t.analytics}</h1>
              {event && <p className="text-gray-600">{event.title}</p>}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={toggleLanguage}>
              <Globe className="w-4 h-4 me-2" />
              {language === 'en' ? 'العربية' : 'English'}
            </Button>
            <Button onClick={() => navigate(`/event/${eventId}/checkin`)} variant="outline">
              <UserCheck className="w-4 h-4 me-2" />
              {isRTL ? 'تسجيل الدخول' : 'Check-in'}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{isRTL ? 'إجمالي التسجيلات' : 'Total Registrations'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{totals.totalRegistrations}</div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {isRTL ? 'من' : 'of'} {totals.totalCapacity} {isRTL ? 'سعة' : 'capacity'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{isRTL ? 'حضور مسجل' : 'Checked In'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{totals.totalCheckedIn}</div>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {checkInRate}% {isRTL ? 'معدل الحضور' : 'check-in rate'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{isRTL ? 'معدل الاستخدام' : 'Utilization Rate'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{utilizationRate}%</div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {isRTL ? 'من السعة المتاحة' : 'of available capacity'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{isRTL ? 'الأماكن المتبقية' : 'Remaining Spots'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {totals.totalCapacity - totals.totalRegistrations}
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {isRTL ? 'متاح للتسجيل' : 'available for registration'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <AnalyticsChart
            data={analytics}
            type="bar"
            title={isRTL ? 'التسجيلات حسب المجموعة' : 'Registrations by Group'}
            dataKey="registrations"
          />
          <AnalyticsChart
            data={analytics}
            type="pie"
            title={isRTL ? 'حالة تسجيل الدخول' : 'Check-in Status'}
            dataKey="checkedIn"
          />
        </div>

        {/* Detailed Group Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'إحصائيات تفصيلية' : 'Detailed Statistics'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className={`py-3 px-4 text-${isRTL ? 'right' : 'left'} font-semibold`}>
                      {isRTL ? 'المجموعة' : 'Group'}
                    </th>
                    <th className={`py-3 px-4 text-${isRTL ? 'right' : 'left'} font-semibold`}>
                      {isRTL ? 'السعة' : 'Capacity'}
                    </th>
                    <th className={`py-3 px-4 text-${isRTL ? 'right' : 'left'} font-semibold`}>
                      {isRTL ? 'التسجيلات' : 'Registrations'}
                    </th>
                    <th className={`py-3 px-4 text-${isRTL ? 'right' : 'left'} font-semibold`}>
                      {isRTL ? 'حضور' : 'Checked In'}
                    </th>
                    <th className={`py-3 px-4 text-${isRTL ? 'right' : 'left'} font-semibold`}>
                      {isRTL ? 'متاح' : 'Available'}
                    </th>
                    <th className={`py-3 px-4 text-${isRTL ? 'right' : 'left'} font-semibold`}>
                      {isRTL ? 'النسبة' : 'Rate'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.map((group, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{group.groupName}</td>
                      <td className="py-3 px-4">{group.capacity}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {group.registrations}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {group.checkedIn}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                          {group.available}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-blue-500 h-full"
                              style={{
                                width: `${(group.registrations / group.capacity) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 min-w-[3rem] text-end">
                            {((group.registrations / group.capacity) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventAnalytics;