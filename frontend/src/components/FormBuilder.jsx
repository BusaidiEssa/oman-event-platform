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

      <div className="space-y-3">
        {fields.map((field, index) => (
          <Card key={field.id} className="border-2 border-gray-200">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <GripVertical className="w-5 h-5 text-gray-400 mt-2 cursor-move" />
                  <div className="flex-1 space-y-3">
                    {/* Field Label */}
                    <div>
                      <Label className="text-xs text-gray-600">
                        {t.fieldLabel}
                      </Label>
                      <Input
                        placeholder={t.placeholderFieldLabel}
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    {/* Field Type */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-600">
                          {t.fieldType}
                        </Label>
                        <Select
                          value={field.type}
                          onValueChange={(value) => updateField(field.id, { type: value })}
                        >
                          <SelectTrigger className="mt-1">
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
                        <Label className="text-xs text-gray-600">
                          {t.required}
                        </Label>
                        <Select
                          value={field.required ? 'yes' : 'no'}
                          onValueChange={(value) => updateField(field.id, { required: value === 'yes' })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">{t.yes}</SelectItem>
                            <SelectItem value="no">{t.no}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Options for Select Type */}
                    {field.type === 'select' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs text-gray-600">
                            {t.selectOptions}
                          </Label>
                          <Button
                            type="button"
                            onClick={() => addOption(field.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <Plus className="w-3 h-3 me-1" />
                            {t.add}
                          </Button>
                        </div>
                        {field.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex gap-2">
                            <Input
                              placeholder={`${t.option} ${optIndex + 1}`}
                              value={option}
                              onChange={(e) => updateOption(field.id, optIndex, e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              onClick={() => deleteOption(field.id, optIndex)}
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    type="button"
                    onClick={() => deleteField(field.id)}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                {/* Field Preview */}
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <Label className="text-xs text-gray-500 mb-1 block">
                    {t.preview}
                  </Label>
                  <Label className="text-sm mb-1 block">
                    {field.label || t.untitled}
                    {field.required && <span className="text-red-500 ms-1">*</span>}
                  </Label>
                  {field.type === 'select' ? (
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectPlaceholder} />
                      </SelectTrigger>
                    </Select>
                  ) : field.type === 'file' ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center text-sm text-gray-500">
                      {t.clickToUpload}
                    </div>
                  ) : (
                    <Input
                      type={field.type}
                      placeholder={t.sampleInput}
                      disabled
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FormBuilder;