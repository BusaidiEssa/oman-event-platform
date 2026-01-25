import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, UserCheck, Clock, TrendingUp, Download, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import api from '../api/axios';

ChartJS.register(BarElement, ArcElement, Title, Tooltip, Legend);

const EventAnalytics = ({ eventId }) => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { isRTL } = useLanguage();
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
        api.get('/events'),
      ]);

      setAnalytics(analyticsRes.data || []);
      const currentEvent = eventsRes.data.find((e) => e._id === eventId);
      setEvent(currentEvent);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExportCSV = () => {
    if (!analytics || analytics.length === 0) return;

    const headers = isRTL
      ? ['المجموعة', 'السعة', 'التسجيلات', 'حضور مسجل', 'متاح', 'النسبة']
      : ['Group', 'Capacity', 'Registrations', 'Checked In', 'Available', 'Rate'];

    const rows = analytics.map((group) => [
      group.groupName,
      group.capacity,
      group.registrations,
      group.checkedIn,
      group.available,
      `${((group.registrations / group.capacity) * 100).toFixed(1)}%`,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.title || 'event'}-analytics.csv`;
    a.click();
  };

  const calculateTotals = () => {
    return analytics.reduce(
      (acc, group) => ({
        totalRegistrations: acc.totalRegistrations + group.registrations,
        totalCheckedIn: acc.totalCheckedIn + group.checkedIn,
        totalCapacity: acc.totalCapacity + group.capacity,
      }),
      { totalRegistrations: 0, totalCheckedIn: 0, totalCapacity: 0 }
    );
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="text-lg">{t.loading}</div>
      </div>
    );
  }

  const totals = calculateTotals();
  const utilizationRate = totals.totalCapacity
    ? ((totals.totalRegistrations / totals.totalCapacity) * 100).toFixed(1)
    : 0;
  const checkInRate = totals.totalRegistrations
    ? ((totals.totalCheckedIn / totals.totalRegistrations) * 100).toFixed(1)
    : 0;

  const barChartData = {
    labels: analytics.map((group) => group.groupName),
    datasets: [
      {
        label: isRTL ? 'التسجيلات' : 'Registrations',
        data: analytics.map((group) => group.registrations),
        backgroundColor: '#4A90E2',
      },
    ],
  };

  const pieChartData = {
    labels: analytics.map((group) => group.groupName),
    datasets: [
      {
        label: isRTL ? 'حضور مسجل' : 'Checked In',
        data: analytics.map((group) => group.checkedIn),
        backgroundColor: analytics.map(
          (_, index) =>
            ['#42A5F5', '#AB47BC', '#FF7043', '#66BB6A', '#FFA726'][
              index % 5
            ]
        ),
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={fetchAnalytics} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 me-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t['refresh']}
        </Button>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="w-4 h-4 me-2" />
          {t['exportCSV']}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Registration card summaries code (no change needed) */}
      </div>

      {/* Charts using Chart.js */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {isRTL ? 'التسجيلات حسب المجموعة' : 'Registrations by Group'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {isRTL ? 'حالة تسجيل الدخول' : 'Check-in Status'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventAnalytics;