import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import api from '../api/axios';

const DynamicForm = ({ event, group, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { isRTL, language } = useLanguage();
  const t = useTranslation();

  const handleInputChange = (fieldLabel, value) => {
    setFormData({
      ...formData,
      [fieldLabel]: value
    });
  };

  const handleFileChange = (fieldLabel, file) => {
    setFiles({
      ...files,
      [fieldLabel]: file
    });
    // Store file name in formData
    setFormData({
      ...formData,
      [fieldLabel]: file?.name || ''
    });
  };

  const validateForm = () => {
    for (const field of group.fields) {
      if (field.required && !formData[field.label]) {
        return `${field.label} ${t.fieldRequired}`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // For file uploads, we would need to convert to base64 or use FormData
      // For now, we'll just send the form data
      const response = await api.post('/registrations/register', {
        eventSlug: event.slug,
        groupName: group.name,
        formData,
        language
      });

      onSuccess(response.data);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message === 'Capacity reached') {
        setError(t.capacityReached);
      } else {
        setError(err.response?.data?.message || t.registrationFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const commonProps = {
      id: field.label,
      required: field.required,
      value: formData[field.label] || '',
      onChange: (e) => handleInputChange(field.label, e.target.value)
    };

    switch (field.type) {
      case 'text':
        return (
          <Input
            {...commonProps}
            type="text"
            placeholder={`${t.enterField} ${field.label}`}
          />
        );
      
      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            placeholder={`${t.enterField} ${field.label}`}
          />
        );
      
      case 'select':
        return (
          <Select
            value={formData[field.label] || ''}
            onValueChange={(value) => handleInputChange(field.label, value)}
            required={field.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={t.selectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'file':
        return (
          <div>
            <Input
              id={field.label}
              type="file"
              required={field.required}
              onChange={(e) => handleFileChange(field.label, e.target.files?.[0])}
              className="cursor-pointer"
            />
            {files[field.label] && (
              <p className="text-sm text-gray-600 mt-1">
                {t.selectedFile}{files[field.label].name}
              </p>
            )}
          </div>
        );
      
      default:
        return (
          <Input
            {...commonProps}
            type="text"
            placeholder={`${t.enterField} ${field.label}`}
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <CardTitle className="text-xl">
            {t.registerAs}{group.name}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Render Dynamic Fields */}
          {group.fields.map((field, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={field.label}>
                {field.label}
                {field.required && <span className="text-red-500 ms-1">*</span>}
              </Label>
              {renderField(field)}
            </div>
          ))}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              <Send className="w-4 h-4 me-2" />
              {loading ? t.submitting : t.submit}
            </Button>
            <Button type="button" variant="outline" onClick={onBack}>
              {t.cancel}
            </Button>
          </div>

          {/* Privacy Notice */}
          <p className="text-xs text-gray-500 text-center mt-4">
            {t.emailReceiveQR}
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default DynamicForm;