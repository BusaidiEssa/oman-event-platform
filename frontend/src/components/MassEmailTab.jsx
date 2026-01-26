import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Send, 
  Filter, 
  Users, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

const MassEmailTab = ({ eventId, registrations }) => {
  const { isRTL } = useLanguage();
  const [filters, setFilters] = useState({
    groupName: 'all',
    checkedIn: 'all', // 'all', 'true', 'false'
    searchEmail: ''
  });
  
  const [emailData, setEmailData] = useState({
    subject: '',
    message: ''
  });

  const [filteredCount, setFilteredCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Get unique group names
  const groups = [...new Set(registrations.map(r => r.groupName))];

  // Filter registrations based on selected filters
  useEffect(() => {
    let filtered = registrations;

    // Filter by group
    if (filters.groupName !== 'all') {
      filtered = filtered.filter(r => r.groupName === filters.groupName);
    }

    // Filter by check-in status
    if (filters.checkedIn === 'true') {
      filtered = filtered.filter(r => r.checkedIn === true);
    } else if (filters.checkedIn === 'false') {
      filtered = filtered.filter(r => r.checkedIn === false);
    }

    // Filter by email search
    if (filters.searchEmail.trim()) {
      filtered = filtered.filter(r => 
        r.email.toLowerCase().includes(filters.searchEmail.toLowerCase())
      );
    }

    setFilteredCount(filtered.length);
  }, [filters, registrations]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleEmailDataChange = (key, value) => {
    setEmailData(prev => ({ ...prev, [key]: value }));
  };

  const handleSendEmails = async () => {
    if (!emailData.subject.trim() || !emailData.message.trim()) {
      setError(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return;
    }

    if (filteredCount === 0) {
      setError(isRTL ? 'لا يوجد مستلمون بناءً على الفلاتر المحددة' : 'No recipients based on selected filters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post(`/registrations/${eventId}/mass-email`, {
        filters: filters,
        emailData: emailData
      });

      setSuccess(
        isRTL 
          ? `تم إرسال ${response.data.sentCount} رسالة بريد إلكتروني بنجاح!`
          : `Successfully sent ${response.data.sentCount} emails!`
      );
      
      // Clear form
      setEmailData({ subject: '', message: '' });

      // Auto-clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Mass email error:', err);
      setError(
        err.response?.data?.message || 
        (isRTL ? 'فشل إرسال البريد الإلكتروني' : 'Failed to send emails')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {isRTL ? 'تصفية المستلمين' : 'Filter Recipients'}
          </CardTitle>
          <CardDescription>
            {isRTL 
              ? 'اختر من سيتلقى رسائل البريد الإلكتروني' 
              : 'Select who will receive the emails'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Group Filter */}
          <div className="space-y-2">
            <Label>{isRTL ? 'فئة المشاركين' : 'Stakeholder Group'}</Label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={filters.groupName}
              onChange={(e) => handleFilterChange('groupName', e.target.value)}
            >
              <option value="all">
                {isRTL ? 'جميع الفئات' : 'All Groups'}
              </option>
              {groups.map(group => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          {/* Check-in Status Filter */}
          <div className="space-y-2">
            <Label>{isRTL ? 'حالة تسجيل الدخول' : 'Check-in Status'}</Label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={filters.checkedIn}
              onChange={(e) => handleFilterChange('checkedIn', e.target.value)}
            >
              <option value="all">
                {isRTL ? 'الكل' : 'All'}
              </option>
              <option value="true">
                {isRTL ? 'تم تسجيل الدخول فقط' : 'Checked-in Only'}
              </option>
              <option value="false">
                {isRTL ? 'لم يتم تسجيل الدخول فقط' : 'Not Checked-in Only'}
              </option>
            </select>
          </div>

          {/* Email Search Filter */}
          <div className="space-y-2">
            <Label>{isRTL ? 'بحث بالبريد الإلكتروني' : 'Search by Email'}</Label>
            <Input
              type="text"
              placeholder={isRTL ? 'أدخل البريد الإلكتروني...' : 'Enter email...'}
              value={filters.searchEmail}
              onChange={(e) => handleFilterChange('searchEmail', e.target.value)}
            />
          </div>

          {/* Recipient Count */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">
                  {isRTL ? 'عدد المستلمين:' : 'Recipients Count:'}
                </span>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {filteredCount}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Composition Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {isRTL ? 'كتابة الرسالة' : 'Compose Message'}
          </CardTitle>
          <CardDescription>
            {isRTL 
              ? 'اكتب رسالة البريد الإلكتروني التي سيتم إرسالها' 
              : 'Write the email message to be sent'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              {isRTL ? 'الموضوع' : 'Subject'}
              <span className="text-red-500 ms-1">*</span>
            </Label>
            <Input
              id="subject"
              type="text"
              placeholder={
                isRTL 
                  ? 'أدخل موضوع البريد الإلكتروني...' 
                  : 'Enter email subject...'
              }
              value={emailData.subject}
              onChange={(e) => handleEmailDataChange('subject', e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              {isRTL ? 'الرسالة' : 'Message'}
              <span className="text-red-500 ms-1">*</span>
            </Label>
            <Textarea
              id="message"
              rows={8}
              placeholder={
                isRTL 
                  ? 'اكتب رسالتك هنا...\n\nيمكنك استخدام الحقول التالية:\n{name} - اسم المسجل\n{groupName} - فئة المشارك\n{eventTitle} - عنوان الحدث' 
                  : 'Write your message here...\n\nYou can use these placeholders:\n{name} - Registrant name\n{groupName} - Stakeholder group\n{eventTitle} - Event title'
              }
              value={emailData.message}
              onChange={(e) => handleEmailDataChange('message', e.target.value)}
            />
            <p className="text-xs text-gray-500">
              {isRTL 
                ? 'استخدم {name} و {groupName} و {eventTitle} للتخصيص' 
                : 'Use {name}, {groupName}, {eventTitle} for personalization'}
            </p>
          </div>

         

          {/* Success/Error Messages */}
          {success && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Send Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleSendEmails}
              disabled={loading || filteredCount === 0 || !emailData.subject || !emailData.message}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  {isRTL ? 'جارٍ الإرسال...' : 'Sending...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 me-2" />
                  {isRTL 
                    ? `إرسال إلى ${filteredCount} مستلم` 
                    : `Send to ${filteredCount} Recipients`}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-blue-900">
              <p className="font-semibold">
                {isRTL ? 'نصائح:' : 'Tips:'}
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>
                  {isRTL 
                    ? 'استخدم الفلاتر لاستهداف مجموعات محددة' 
                    : 'Use filters to target specific groups'}
                </li>
                <li>
                  {isRTL 
                    ? 'قم بتخصيص الرسائل باستخدام {name} و {groupName}' 
                    : 'Personalize messages using {name} and {groupName}'}
                </li>
                <li>
                  {isRTL 
                    ? 'تحقق من عدد المستلمين قبل الإرسال' 
                    : 'Verify recipient count before sending'}
                </li>
                <li>
                  {isRTL 
                    ? 'يمكنك إرسال رسائل منفصلة لمجموعات مختلفة' 
                    : 'You can send separate messages to different groups'}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MassEmailTab;
