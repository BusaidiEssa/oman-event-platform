import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Lock, Unlock, Info } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import FormBuilder from './FormBuilder';
import api from '../api/axios';

const StakeholderFormEditor = ({ event, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupData, setGroupData] = useState({
    name: '',
    capacity: 50,
    fields: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const t = useTranslation();
  const { isRTL } = useLanguage();

  const handleAddGroup = () => {
    // Pre-fill with Name and Email fields
    setGroupData({ 
      name: '', 
      capacity: 50, 
      fields: [
        { id: 1, label: 'Full Name', type: 'text', required: true },
        { id: 2, label: 'Email', type: 'text', required: true }
      ]
    });
    setEditingGroup(null);
    setShowAddForm(true);
    setError('');
  };

  const handleEditGroup = (group) => {
    setGroupData({
      name: group.name,
      capacity: group.capacity,
      fields: group.fields.map((f, idx) => ({
        ...f,
        id: f._id || idx
      }))
    });
    setEditingGroup(group._id);
    setShowAddForm(true);
    setError('');
  };

  const handleSaveGroup = async () => {
    setError('');

    // Validation
    if (!groupData.name) {
      setError(t.nameAllGroups);
      return;
    }

    if (groupData.fields.length === 0) {
      setError(t.addFieldsToGroup);
      return;
    }

    // Check for required Name and Email fields
    const hasName = groupData.fields.some(f => 
      (f.label.toLowerCase().includes('name') || f.label.toLowerCase().includes('اسم')) && f.required
    );
    const hasEmail = groupData.fields.some(f => 
      (f.label.toLowerCase().includes('email') || f.label.toLowerCase().includes('بريد')) && f.required
    );

    if (!hasName || !hasEmail) {
      setError(t.requireNameEmail);
      return;
    }

    setLoading(true);

    try {
      // Remove id field before sending to backend
      const fieldsToSend = groupData.fields.map(({ id, ...rest }) => rest);

      let response;
      if (editingGroup) {
        response = await api.put(`/events/${event._id}/groups/${editingGroup}`, {
          ...groupData,
          fields: fieldsToSend
        });
      } else {
        response = await api.post(`/events/${event._id}/groups`, {
          ...groupData,
          fields: fieldsToSend
        });
      }
      
      onUpdate(response.data);
      setShowAddForm(false);
      setGroupData({ name: '', capacity: 50, fields: [] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save group');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleForm = async (groupId) => {
    try {
      const response = await api.patch(`/events/${event._id}/groups/${groupId}/toggle`);
      onUpdate(response.data.event);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle form');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm(t.confirmDeleteGroup)) return;

    try {
      const response = await api.delete(`/events/${event._id}/groups/${groupId}`);
      onUpdate(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete group');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add/Edit Form */}
      {showAddForm ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingGroup ? t.editGroup : t.addStakeholderGroup}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="groupName">{t.groupName} *</Label>
                <Input
                  id="groupName"
                  value={groupData.name}
                  onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
                  placeholder={t.placeholderGroupName}
                />
              </div>
              <div>
                <Label htmlFor="capacity">{t.capacity} *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={groupData.capacity}
                  onChange={(e) => setGroupData({ ...groupData, capacity: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Info alert about Name and Email */}
            <Alert className="border-blue-500 bg-blue-50">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {isRTL 
                  ? 'يتم تضمين حقول الاسم والبريد الإلكتروني تلقائياً ومطلوبة دائماً. يمكنك إضافة حقول إضافية حسب الحاجة.'
                  : 'Name and Email fields are automatically included and always required. You can add additional fields as needed.'}
              </AlertDescription>
            </Alert>

            {/* Form Builder - no preview */}
            <div>
              <FormBuilder
                fields={groupData.fields}
                onChange={(fields) => setGroupData({ ...groupData, fields })}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSaveGroup} disabled={loading}>
                {loading ? t.updating : t.save}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                {t.cancel}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Add Button */}
          <Button onClick={handleAddGroup}>
            <Plus className="w-4 h-4 me-2" />
            {t.addStakeholderGroup}
          </Button>

          {/* Groups List */}
          {event.groups && event.groups.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {event.groups.map((group) => (
                <Card key={group._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {t.capacity}: {group.capacity}
                        </p>
                      </div>
                      <Badge variant={group.isOpen ? "default" : "secondary"}>
                        {group.isOpen ? t.formOpen : t.formClosed}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-2">
                        {group.fields.length} {t.formFields}
                      </p>
                      <div className="space-y-1 text-xs text-gray-500">
                        {group.fields.map((field, idx) => (
                          <div key={idx}>• {field.label}</div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        variant={group.isOpen ? "outline" : "default"}
                        onClick={() => handleToggleForm(group._id)}
                        className="flex-1"
                      >
                        {group.isOpen ? (
                          <>
                            <Lock className="w-4 h-4 me-1" />
                            {t.closeForm}
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4 me-1" />
                            {t.openForm}
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditGroup(group)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteGroup(group._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {!group.isOpen && (
                      <Alert variant="secondary">
                        <AlertDescription className="text-xs">
                          {t.newRegistrationsClosed}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">{t.noStakeholderGroups}</p>
                <p className="text-sm text-gray-500 mt-2">{t.addStakeholderPrompt}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default StakeholderFormEditor;