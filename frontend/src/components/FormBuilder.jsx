import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

const FormBuilder = ({ fields, onChange }) => {
  const { isRTL } = useLanguage();
  const t = useTranslation();
  const [editingField, setEditingField] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Check if a field is Name or Email (locked fields)
  const isLockedField = (label) => {
    const lowerLabel = label.toLowerCase();
    return (
      lowerLabel.includes('name') ||
      lowerLabel.includes('اسم') ||
      lowerLabel.includes('email') ||
      lowerLabel.includes('بريد')
    );
  };

  const addField = () => {
    const newField = {
      id: Date.now(),
      label: '',
      type: 'text',
      required: true,
      options: []
    };
    onChange([...fields, newField]);
    setEditingField(newField.id);
  };

  const updateField = (fieldId, updates) => {
    onChange(fields.map(f => 
      f.id === fieldId ? { ...f, ...updates } : f
    ));
  };

  const deleteField = (fieldId) => {
    onChange(fields.filter(f => f.id !== fieldId));
  };

  const addOption = (fieldId) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      updateField(fieldId, {
        options: [...(field.options || []), '']
      });
    }
  };

  const updateOption = (fieldId, optionIndex, value) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const deleteOption = (fieldId, optionIndex) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      updateField(fieldId, {
        options: field.options.filter((_, i) => i !== optionIndex)
      });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newFields = [...fields];
    const draggedField = newFields[draggedIndex];
    
    // Remove dragged field
    newFields.splice(draggedIndex, 1);
    // Insert at new position
    newFields.splice(dropIndex, 0, draggedField);
    
    onChange(newFields);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">
          {t.formFields}
        </Label>
        <Button type="button" onClick={addField} variant="outline" size="sm">
          <Plus className="w-4 h-4 me-1" />
          {t.addField}
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          {t.noFieldsYet}
        </div>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => {
          const isLocked = isLockedField(field.label);
          
          return (
            <Card
              key={field.id}
              className={`border ${draggedIndex === index ? 'opacity-50 bg-blue-50' : ''}`}
              draggable={!isLocked}
              onDragStart={(e) => !isLocked && handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <CardContent className="pt-3 pb-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    {!isLocked && (
                      <GripVertical className="w-4 h-4 text-gray-400 mt-1 cursor-move hover:text-gray-600" />
                    )}
                    {isLocked && (
                      <div className="w-4 h-4 mt-1" />
                    )}

                    <div className="flex-1 space-y-2">
                      {/* Field Label */}
                      <div>
                        <Label className="text-xs text-gray-600 block mb-1">
                          {t.fieldLabel}
                        </Label>
                        <Input
                          placeholder={t.placeholderFieldLabel}
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          disabled={isLocked}
                          title={isLocked ? 'This field cannot be edited' : ''}
                          className="h-8 text-sm"
                        />
                        {isLocked && (
                          <p className="text-xs text-orange-600 mt-0.5">
                            {isRTL ? 'هذا الحقل مقفول ولا يمكن تعديله' : 'This field is locked and cannot be edited'}
                          </p>
                        )}
                      </div>

                      {/* Field Type and Required - Only if not locked */}
                      {!isLocked && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-gray-600 block mb-1">
                              {t.fieldType}
                            </Label>
                            <Select
                              value={field.type}
                              onValueChange={(value) => updateField(field.id, { type: value })}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">{t.text}</SelectItem>
                                <SelectItem value="number">{t.number}</SelectItem>
                                <SelectItem value="select">{t.select}</SelectItem>
                                <SelectItem value="file">{t.file}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs text-gray-600 block mb-1">
                              {t.required}
                            </Label>
                            <Select
                              value={field.required ? 'yes' : 'no'}
                              onValueChange={(value) => updateField(field.id, { required: value === 'yes' })}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">{t.yes}</SelectItem>
                                <SelectItem value="no">{t.no}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {/* For locked fields, show read-only info */}
                      {isLocked && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-gray-600 block mb-1">
                              {t.fieldType}
                            </Label>
                            <div className="p-1.5 bg-gray-100 rounded text-xs text-gray-600">
                              {field.type}
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-gray-600 block mb-1">
                              {t.required}
                            </Label>
                            <div className="p-1.5 bg-gray-100 rounded text-xs text-gray-600">
                              {field.required ? t.yes : t.no}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Options for Select Type */}
                      {field.type === 'select' && !isLocked && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs text-gray-600">
                              {t.selectOptions}
                            </Label>
                            <Button
                              type="button"
                              onClick={() => addOption(field.id)}
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                            >
                              <Plus className="w-3 h-3 me-1" />
                              {t.add}
                            </Button>
                          </div>
                          {field.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex gap-1.5">
                              <Input
                                placeholder={`${t.option} ${optIndex + 1}`}
                                value={option}
                                onChange={(e) => updateOption(field.id, optIndex, e.target.value)}
                                className="flex-1 h-7 text-xs"
                              />
                              <Button
                                type="button"
                                onClick={() => deleteOption(field.id, optIndex)}
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    {!isLocked && (
                      <Button
                        type="button"
                        onClick={() => deleteField(field.id)}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info about locked fields */}
      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
        {isRTL 
          ? 'ملاحظة: حقول الاسم والبريد الإلكتروني مقفولة ولا يمكن حذفها أو تعديل نوعها'
          : 'Note: Name and Email fields are locked and cannot be deleted or have their type changed'}
      </div>
    </div>
  );
};

export default FormBuilder;