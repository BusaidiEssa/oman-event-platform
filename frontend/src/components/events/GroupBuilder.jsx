import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import FormBuilder from './FormBuilder';

const GroupBuilder = ({ group, index, onGroupChange, onRemoveGroup }) => {
  const { isRTL } = useLanguage();
  const t = useTranslation();

  const handleChange = (field, value) => {
    onGroupChange(index, { ...group, [field]: value });
  };

  const handleFieldsChange = (fields) => {
    onGroupChange(index, { ...group, fields });
  };

  return (
    <Card className="bg-gray-50">
      <CardContent className="p-4">
        <div className="flex gap-2 mb-3">
          <Input
            placeholder={t.groupName}
            value={group.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder={t.capacity}
            value={group.capacity}
            onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 0)}
            className="w-24"
          />
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => onRemoveGroup(index)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <FormBuilder
          fields={group.fields}
          onFieldsChange={handleFieldsChange}
        />
      </CardContent>
    </Card>
  );
};

export default GroupBuilder;