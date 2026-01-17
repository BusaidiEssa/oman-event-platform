import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, X, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import api from '../api/axios';

const RegistrationsList = ({ eventId, event }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReg, setEditingReg] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  const t = useTranslation();

  useEffect(() => {
    fetchRegistrations();
  }, [eventId]);

  const fetchRegistrations = async () => {
    try {
      const response = await api.get(`/registrations/${eventId}`);
      setRegistrations(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (registration) => {
    setEditingReg(registration._id);
    setEditFormData(registration.formData);
    setError('');
  };

  const handleSaveEdit = async (registrationId) => {
    try {
      await api.put(`/registrations/${registrationId}`, {
        formData: editFormData
      });
      
      setRegistrations(registrations.map(r => 
        r._id === registrationId 
          ? { ...r, formData: editFormData }
          : r
      ));
      
      setEditingReg(null);
      setEditFormData({});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update registration');
    }
  };

  const handleCancelEdit = () => {
    setEditingReg(null);
    setEditFormData({});
    setError('');
  };

  const handleDelete = async (registrationId) => {
    if (!window.confirm(t.confirmDeleteRegistration)) return;

    try {
      await api.delete(`/registrations/${registrationId}`);
      setRegistrations(registrations.filter(r => r._id !== registrationId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete registration');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          {t.loading}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {t.registrations} ({registrations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {t.noRegistrations}
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map((registration) => (
                <Card key={registration._id} className="border-2">
                  <CardContent className="pt-6">
                    {editingReg === registration._id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        {Object.entries(editFormData).map(([key, value]) => (
                          <div key={key}>
                            <Label>{key}</Label>
                            <Input
                              value={value}
                              onChange={(e) => setEditFormData({
                                ...editFormData,
                                [key]: e.target.value
                              })}
                            />
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(registration._id)}
                          >
                            {t.save}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            {t.cancel}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <Badge className="mb-2">{registration.groupName}</Badge>
                            <div className="space-y-2">
                              {Object.entries(registration.formData).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="font-medium">{key}:</span>{' '}
                                  <span className="text-gray-700">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {registration.checkedIn ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-xs text-gray-500">
                            {new Date(registration.createdAt).toLocaleDateString()}
                            {registration.checkedIn && (
                              <span className="ms-2">
                                • {t.checkedIn}: {new Date(registration.checkedInAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(registration)}
                            >
                              <Edit2 className="w-4 h-4 me-1" />
                              {t.edit}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(registration._id)}
                            >
                              <Trash2 className="w-4 h-4 me-1" />
                              {t.delete}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationsList;