import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, CheckCircle, XCircle, Search } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

const RegistrationsListTab = ({ registrations, setRegistrations }) => {
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const t = useTranslation();
  const { isRTL } = useLanguage();

  // Filter registrations
  useEffect(() => {
    let filtered = registrations;

    if (selectedGroup !== 'all') {
      filtered = filtered.filter(r => r.groupName === selectedGroup);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => {
        const nameStr = r.formData['Full Name']?.toLowerCase() || '';
        const emailStr = r.email?.toLowerCase() || '';
        const formDataStr = JSON.stringify(r.formData).toLowerCase();
        return nameStr.includes(query) || emailStr.includes(query) || formDataStr.includes(query);
      });
    }

    setFilteredRegistrations(filtered);
  }, [registrations, searchQuery, selectedGroup]);

  const handleToggleCheckIn = async (registrationId, currentStatus) => {
    try {
      const reg = registrations.find(r => r._id === registrationId);

      if (currentStatus) {
        // Toggle off (mark as not checked in)
        setRegistrations(registrations.map(r =>
          r._id === registrationId
            ? { ...r, checkedIn: false, checkedInAt: null }
            : r
        ));
      } else {
        // Check in via API
        const response = await api.post('/registrations/checkin', {
          qrCode: reg.qrCode
        });

        setRegistrations(registrations.map(r =>
          r._id === registrationId
            ? response.data.registration
            : r
        ));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle check-in');
    }
  };

  const handleDelete = async (registrationId) => {
    if (!window.confirm(t.confirmDeleteRegistration)) return;

    setDeleting(registrationId);
    setError('');

    try {
      await api.delete(`/registrations/${registrationId}`);
      
      // Remove from state
      setRegistrations(registrations.filter(r => r._id !== registrationId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete registration');
      console.error('Delete error:', err);
    } finally {
      setDeleting(null);
    }
  };

  const uniqueGroups = [...new Set(registrations.map(r => r.groupName))];
  const totalCount = filteredRegistrations.length;
  const checkedInCount = filteredRegistrations.filter(r => r.checkedIn).length;

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">{t.search || 'Search'}</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder={isRTL ? 'ابحث بالاسم أو البريد...' : 'Search by name or email...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-10"
                />
              </div>
            </div>

            {uniqueGroups.length > 0 && (
              <div>
                <Label>{isRTL ? 'المجموعة' : 'Group'}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    variant={selectedGroup === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedGroup('all')}
                  >
                    {isRTL ? 'الكل' : 'All'}
                  </Button>
                  {uniqueGroups.map(group => (
                    <Button
                      key={group}
                      variant={selectedGroup === group ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedGroup(group)}
                    >
                      {group}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-gray-500">
                  {isRTL ? 'إجمالي' : 'Total'}
                </p>
                <p className="text-2xl font-bold text-primary">{totalCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {isRTL ? 'حضور' : 'Checked In'}
                </p>
                <p className="text-2xl font-bold text-green-600">{checkedInCount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registrations List */}
      <Card>
        <CardContent className="pt-6">
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {registrations.length === 0 ? t.noRegistrations : 'No results found'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRegistrations.map(registration => (
                <div
                  key={registration._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{registration.groupName}</Badge>
                      {registration.checkedIn && (
                        <Badge variant="default" className="bg-green-600">
                          {isRTL ? 'حضور' : 'Checked In'}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">
                        {registration.formData['Full Name'] || 'N/A'}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {registration.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={registration.checkedIn ? 'default' : 'outline'}
                      onClick={() =>
                        handleToggleCheckIn(registration._id, registration.checkedIn)
                      }
                      disabled={deleting === registration._id}
                    >
                      {registration.checkedIn ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(registration._id)}
                      disabled={deleting === registration._id}
                    >
                      {deleting === registration._id ? '...' : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default RegistrationsListTab;