import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

const FormBuilder = ({ fields, onFieldsChange }) => {
  const { isRTL } = useLanguage();
  const t = useTranslation();

  const handleAddField = () => {
    onFieldsChange([...fields, { label: '', type: 'text' }]);
  };

  const handleRemoveField = (index) => {
    onFieldsChange(fields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...fields];
    updated[index][field] = value;
    onFieldsChange(updated);
  };

  return (
    <div className="space-y-2">
      {fields.map((field, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <Input
            placeholder={t.fieldLabel}
            value={field.label}
            onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
            className="flex-1"
          />
          <Select
            value={field.type}
            onValueChange={(val) => handleFieldChange(idx, 'type', val)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">{t.text}</SelectItem>
              <SelectItem value="number">{t.number}</SelectItem>
              <SelectItem value="select">{t.select}</SelectItem>
              <SelectItem value="file">{t.file}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => handleRemoveField(idx)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleAddField}
      >
        <Plus className="w-3 h-3 me-1" />
        {t.addField}
      </Button>
    </div>
  );
};

export default FormBuilder;