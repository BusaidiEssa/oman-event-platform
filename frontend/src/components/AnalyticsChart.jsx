//shhe
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '../context/LanguageContext';

const AnalyticsChart = ({ data, type, title, dataKey }) => {
  const { isRTL } = useLanguage();

  // Calculate max value for scaling
  const maxValue = Math.max(...data.map(d => d[dataKey] || 0), 1);

  if (type === 'bar') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((item, index) => {
              const percentage = (item[dataKey] / maxValue) * 100;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{item.groupName}</span>
                    <span className="text-gray-600">
                      {item[dataKey]} / {item.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {data.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {t.noDataAvailable}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (type === 'pie') {
    // Simple pie chart visualization using CSS
    const totalCheckedIn = data.reduce((sum, item) => sum + item.checkedIn, 0);
    const totalRegistrations = data.reduce((sum, item) => sum + item.registrations, 0);
    const pending = totalRegistrations - totalCheckedIn;

    const checkedInPercentage = totalRegistrations > 0 
      ? (totalCheckedIn / totalRegistrations) * 100 
      : 0;
    const pendingPercentage = 100 - checkedInPercentage;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4">
            {/* Donut Chart */}
            <div className="relative w-48 h-48 mb-6">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                />
                {/* Checked-in segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray={`${checkedInPercentage * 2.513} 251.3`}
                  className="transition-all duration-500"
                />
                {/* Pending segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="20"
                  strokeDasharray={`${pendingPercentage * 2.513} 251.3`}
                  strokeDashoffset={-checkedInPercentage * 2.513}
                  className="transition-all duration-500"
                />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <div className="text-2xl font-bold">{totalRegistrations}</div>
                <div className="text-xs text-gray-500">
                  {isRTL ? 'المجموع' : 'Total'}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">
                    {isRTL ? 'حضور مسجل' : 'Checked In'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{totalCheckedIn}</span>
                  <span className="text-gray-500 text-sm">
                    ({checkedInPercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-sm">
                    {isRTL ? 'قيد الانتظار' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{pending}</span>
                  <span className="text-gray-500 text-sm">
                    ({pendingPercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default AnalyticsChart;