import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import FormBuilder from '../components/FormBuilder';
import api from '../api/axios';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: ''
  });
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { toggleLanguage, language, isRTL, dir } = useLanguage();
  const t = useTranslation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addGroup = () => {
    setGroups([
      ...groups,
      {
        id: Date.now(),
        name: '',
        capacity: 50,
        fields: []
      }
    ]);
  };

  const updateGroup = (groupId, updates) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, ...updates } : g
    ));
  };

  const deleteGroup = (groupId) => {
    setGroups(groups.filter(g => g.id !== groupId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title || !formData.date) {
      setError(t.fillAllRequired);
      return;
    }

    if (groups.length === 0) {
      setError(t.addAtLeastOneGroup);
      return;
    }

    // Validate each group
    for (const group of groups) {
      if (!group.name) {
        setError(t.nameAllGroups);
        return;
      }
      if (group.fields.length === 0) {
        setError(`${t.addFieldsToGroup} "${group.name}"`);
        return;
      }
    }

    setLoading(true);

    try {
      // Remove temporary IDs before sending
      const cleanedGroups = groups.map(({ id, ...group }) => group);
      
      await api.post('/events', {
        ...formData,
        groups: cleanedGroups
      });
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            {t.back}
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleLanguage}>
            <Globe className="w-4 h-4 me-2" />
            {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t.createEvent}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t.eventDetails}</h3>
                
                <div>
                  <Label htmlFor="title">{t.eventTitle} *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={t.placeholderEventTitle}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="date">{t.date} *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">{t.location}</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder={t.placeholderLocation}
                  />
                </div>

                <div>
                  <Label htmlFor="description">{t.description}</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                    placeholder={t.placeholderDescription}
                  />
                </div>
              </div>

              {/* Stakeholder Groups */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{t.stakeholderGroups}</h3>
                  <Button type="button" onClick={addGroup} variant="outline" size="sm">
                    <Plus className="w-4 h-4 me-2" />
                    {t.addGroup}
                  </Button>
                </div>

                {groups.length === 0 && (
                  <Alert>
                    <AlertDescription>{t.addStakeholderPrompt}</AlertDescription>
                  </Alert>
                )}

                {groups.map((group, index) => (
                  <Card key={group.id} className="border-2">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-3">
                          <Input
                            placeholder={t.placeholderGroupName}
                            value={group.name}
                            onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                            className="text-lg font-semibold"
                          />
                          <div className="flex items-center gap-2">
                            <Label className="whitespace-nowrap">{t.capacity}:</Label>
                            <Input
                              type="number"
                              min="1"
                              value={group.capacity}
                              onChange={(e) => updateGroup(group.id, { capacity: parseInt(e.target.value) || 0 })}
                              className="w-32"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGroup(group.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <FormBuilder
                        fields={group.fields}
                        onChange={(fields) => updateGroup(group.id, { fields })}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? t.creating : t.save}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  {t.cancel}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEvent;