import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import GroupBuilder from './GroupBuilder';
import api from '../../api/axios';

const CreateEvent = () => {
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    groups: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { toggleLanguage, language, isRTL, dir } = useLanguage();
  const t = useTranslation();
  const navigate = useNavigate();

  const handleAddGroup = () => {
    setNewEvent({
      ...newEvent,
      groups: [...newEvent.groups, { name: '', capacity: 50, fields: [] }]
    });
  };

  const handleRemoveGroup = (index) => {
    setNewEvent({
      ...newEvent,
      groups: newEvent.groups.filter((_, i) => i !== index)
    });
  };

  const handleGroupChange = (index, updatedGroup) => {
    const updated = [...newEvent.groups];
    updated[index] = updatedGroup;
    setNewEvent({ ...newEvent, groups: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newEvent.title || !newEvent.date || newEvent.groups.length === 0) {
      setError('Please fill in all required fields and add at least one stakeholder group');
      return;
    }

    for (let group of newEvent.groups) {
      if (!group.name) {
        setError('All stakeholder groups must have a name');
        return;
      }
    }

    setLoading(true);

    try {
      await api.post('/events', newEvent);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={dir} className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className={isRTL ? 'font-arabic' : ''}>{t.createEvent}</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={toggleLanguage}>
                  <Globe className="w-4 h-4 me-2" />
                  {language === 'en' ? 'AR' : 'EN'}
                </Button>
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                  {t.cancel}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label className={isRTL ? 'font-arabic' : ''}>{t.eventTitle} *</Label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className={isRTL ? 'font-arabic' : ''}>{t.date} *</Label>
                    <Input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className={isRTL ? 'font-arabic' : ''}>{t.location}</Label>
                    <Input
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className={isRTL ? 'font-arabic' : ''}>{t.description}</Label>
                  <Input
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-semibold ${isRTL ? 'font-arabic' : ''}`}>
                    {t.addGroup} *
                  </h3>
                  <Button type="button" size="sm" onClick={handleAddGroup}>
                    <Plus className="w-4 h-4 me-1" />
                    {t.addGroup}
                  </Button>
                </div>

                {newEvent.groups.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No stakeholder groups added yet
                  </p>
                )}

                <div className="space-y-4">
                  {newEvent.groups.map((group, index) => (
                    <GroupBuilder
                      key={index}
                      group={group}
                      index={index}
                      onGroupChange={handleGroupChange}
                      onRemoveGroup={handleRemoveGroup}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : t.save}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEvent;