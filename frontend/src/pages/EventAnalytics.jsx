import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Users, UserCheck, Clock, TrendingUp, Globe, Download, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import AnalyticsChart from '../components/AnalyticsChart';
import api from '../api/axios';

const EventAnalytics = ({ eventId }) => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const { toggleLanguage, language, isRTL, dir } = useLanguage();
  const t = useTranslation();

  useEffect(() => {
    if (eventId) {
      fetchAnalytics();
    }
  }, [eventId]);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const [analyticsRes, eventsRes] = await Promise.all([
        api.get(`/registrations/${eventId}/analytics`),
        api.get('/events')
      ]);
      
      setAnalytics(analyticsRes.data);
      const currentEvent = eventsRes.data.find(e => e._id === eventId);
      setEvent(currentEvent);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const handleExportCSV = () => {
    if (!analytics || analytics.length === 0) return;

    const headers = isRTL 
      ? ['المجموعة', 'السعة', 'التسجيلات', 'حضور مسجل', 'متاح', 'النسبة']
      : ['Group', 'Capacity', 'Registrations', 'Checked In', 'Available', 'Rate'];
    
    const rows = analytics.map(group => [
      group.groupName,
      group.capacity,
      group.registrations,
      group.checkedIn,
      group.available,
      `${((group.registrations / group.capacity) * 100).toFixed(1)}%`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.title || 'event'}-analytics.csv`;
    a.click();
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
      <div className="py-12 text-center">
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
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 me-2 ${refreshing ? 'animate-spin' : ''}`} />
          {isRTL ? 'تحديث' : 'Refresh'}
        </Button>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="w-4 h-4 me-2" />
          {isRTL ? 'تصدير CSV' : 'Export CSV'}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wide">
              {isRTL ? 'إجمالي التسجيلات' : 'Total Registrations'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-blue-600">{totals.totalRegistrations}</div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-500"
                  style={{ width: `${utilizationRate}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">
                {utilizationRate}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isRTL ? 'من' : 'of'} {totals.totalCapacity} {isRTL ? 'سعة' : 'capacity'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wide">
              {isRTL ? 'حضور مسجل' : 'Checked In'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-green-600">{totals.totalCheckedIn}</div>
              <div className="bg-green-100 p-3 rounded-full">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-600 h-full transition-all duration-500"
                  style={{ width: `${checkInRate}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">
                {checkInRate}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {checkInRate}% {isRTL ? 'معدل الحضور' : 'check-in rate'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wide">
              {isRTL ? 'معدل الاستخدام' : 'Utilization Rate'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-purple-600">{utilizationRate}%</div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div className="text-xs text-gray-600">
                    {isRTL ? 'مستخدم' : 'Used'}: {totals.totalRegistrations}
                  </div>
                  <div className="text-xs text-gray-600">
                    {isRTL ? 'متاح' : 'Free'}: {totals.totalCapacity - totals.totalRegistrations}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wide">
              {isRTL ? 'الأماكن المتبقية' : 'Remaining Spots'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-orange-600">
                {totals.totalCapacity - totals.totalRegistrations}
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              {isRTL ? 'متاح للتسجيل' : 'available for registration'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
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
          {analytics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {isRTL ? 'لا توجد بيانات' : 'No data available'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className={`py-3 px-4 text-${isRTL ? 'right' : 'left'} font-semibold text-sm uppercase tracking-wide text-gray-700`}>
                      {isRTL ? 'المجموعة' : 'Group'}
                    </th>
                    <th className={`py-3 px-4 text-${isRTL ? 'right' : 'left'} font-semibold text-sm uppercase tracking-wide text-gray-700`}>
                      {isRTL ? 'السعة' : 'Capacity'}
                    </th>
                    <th className={`py-3 px-4 text-${isRTL ? 'right' : 'left'} font-semibold text-sm uppercase tracking-wide text-gray-700`}>
                      {isRTL ? 'التسجيلات' : 'Registrations'}
                    </th>
                    <th className={`py-3 px-4 text-${isRTL ? 'right' : 'left'} font-semibold text-sm uppercase tracking-wide text-gray-700`}>
                      {isRTL ? 'حضور' : 'Checked In'}
                    </th>
                    <th className={`py-3 px-4 text-${isRTL ? 'right' : 'left'} font-semibold text-sm uppercase tracking-wide text-gray-700`}>
                      {isRTL ? 'متاح' : 'Available'}
                    </th>
                    <th className={`py-3 px-4 text-${isRTL ? 'right' : 'left'} font-semibold text-sm uppercase tracking-wide text-gray-700`}>
                      {isRTL ? 'النسبة' : 'Fill Rate'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.map((group, index) => {
                    const fillRate = (group.registrations / group.capacity) * 100;
                    const checkInPercent = group.registrations > 0 
                      ? (group.checkedIn / group.registrations) * 100 
                      : 0;
                    
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-medium">{group.groupName}</td>
                        <td className="py-4 px-4 text-gray-700">{group.capacity}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {group.registrations}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({checkInPercent.toFixed(0)}% {isRTL ? 'حضور' : 'checked in'})
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {group.checkedIn}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {group.available}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden min-w-[100px]">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  fillRate >= 90 ? 'bg-red-500' :
                                  fillRate >= 70 ? 'bg-orange-500' :
                                  fillRate >= 50 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${fillRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium min-w-[3rem] text-end">
                              {fillRate.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="py-4 px-4">{isRTL ? 'المجموع' : 'Total'}</td>
                    <td className="py-4 px-4">{totals.totalCapacity}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-900">
                        {totals.totalRegistrations}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-900">
                        {totals.totalCheckedIn}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-200 text-orange-900">
                        {totals.totalCapacity - totals.totalRegistrations}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-semibold">
                        {utilizationRate}%
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventAnalytics;