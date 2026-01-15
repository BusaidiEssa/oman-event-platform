import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

const RegistrationForm = ({ event, group, onBack, onSubmit, error, submitting }) => {
  const [formData, setFormData] = useState({});
  const { toggleLanguage, language, isRTL } = useLanguage();
  const t = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← {t.cancel}
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleLanguage}>
            <Globe className="w-4 h-4 me-2" />
            {language === 'en' ? 'AR' : 'EN'}
          </Button>
        </div>
        <CardTitle className={`text-2xl ${isRTL ? 'font-arabic' : ''}`}>
          {group.name}
        </CardTitle>
        <p className="text-sm text-gray-600">{event.title}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {group.fields.map((field, idx) => (
            <div key={idx}>
              <Label className={isRTL ? 'font-arabic' : ''}>{field.label}</Label>
              <Input
                type={field.type === 'number' ? 'number' : field.type === 'file' ? 'file' : 'text'}
                className="mt-1"
                required
                onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
              />
            </div>
          ))}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Submitting...' : t.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegistrationForm;
