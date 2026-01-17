import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Camera, CheckCircle2, XCircle, Keyboard, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import api from '../api/axios';

const QRScanner = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [scanMode, setScanMode] = useState('manual'); // 'camera' or 'manual'
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  
  const { toggleLanguage, language, isRTL, dir } = useLanguage();
  const t = useTranslation();

  useEffect(() => {
    // Focus on input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleCheckIn = async (code) => {
    if (!code || !code.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/registrations/checkin', {
        qrCode: code.trim()
      });

      setResult({
        success: true,
        data: response.data
      });

      // Auto-clear after 3 seconds
      setTimeout(() => {
        setResult(null);
        setQrCode('');
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Check-in failed';
      
      if (err.response?.status === 400 && errorMessage.includes('Already checked in')) {
        setResult({
          success: false,
          message: isRTL ? 'تم تسجيل الدخول مسبقاً' : 'Already checked in',
          data: err.response.data
        });
      } else if (err.response?.status === 404) {
        setResult({
          success: false,
          message: isRTL ? 'رمز QR غير صالح' : 'Invalid QR code'
        });
      } else {
        setError(errorMessage);
      }

      // Auto-clear after 3 seconds
      setTimeout(() => {
        setResult(null);
        setQrCode('');
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleCheckIn(qrCode);
  };

  const handleKeyPress = (e) => {
    // For barcode scanners that auto-submit with Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCheckIn(qrCode);
    }
  };

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate(`/event/${eventId}/analytics`)}>
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{t.scanQR}</h1>
              <p className="text-gray-600 text-sm">{t.verifyAttendee}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleLanguage}>
            <Globe className="w-4 h-4 me-2" />
            {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>

        {/* Scan Mode Selection */}
        <div className="flex gap-3 mb-6">
          <Button
            variant={scanMode === 'manual' ? 'default' : 'outline'}
            onClick={() => setScanMode('manual')}
            className="flex-1"
          >
            <Keyboard className="w-4 h-4 me-2" />
            {isRTL ? 'إدخال يدوي' : 'Manual Entry'}
          </Button>
          <Button
            variant={scanMode === 'camera' ? 'default' : 'outline'}
            onClick={() => setScanMode('camera')}
            className="flex-1"
            disabled
          >
            <Camera className="w-4 h-4 me-2" />
            {isRTL ? 'كاميرا' : 'Camera'}
            <span className="text-xs ms-2">({isRTL ? 'قريباً' : 'Soon'})</span>
          </Button>
        </div>

        {/* Main Content */}
        {scanMode === 'manual' && (
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'أدخل رمز QR' : 'Enter QR Code'}</CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'امسح الرمز باستخدام ماسح الباركود أو أدخله يدوياً'
                  : 'Scan with a barcode scanner or enter manually'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <Input
                  ref={inputRef}
                  type="text"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isRTL ? 'رمز QR...' : 'QR Code...'}
                  className="text-lg h-12"
                  disabled={loading}
                  autoFocus
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading || !qrCode.trim()}
                >
                  {loading ? (isRTL ? 'جاري التحقق...' : 'Verifying...') : t.checkIn}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Camera Mode Placeholder */}
        {scanMode === 'camera' && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  {isRTL 
                    ? 'وضع الكاميرا قيد التطوير'
                    : 'Camera mode is under development'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {isRTL 
                    ? 'استخدم الإدخال اليدوي في الوقت الحالي'
                    : 'Please use manual entry for now'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Result Display */}
        {result && (
          <Card className={`mt-4 border-2 ${result.success ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}`}>
            <CardContent className="py-8">
              <div className="text-center">
                {result.success ? (
                  <>
                    <CheckCircle2 className="w-20 h-20 mx-auto mb-4 text-green-500" />
                    <h2 className="text-2xl font-bold text-green-700 mb-2">
                      {isRTL ? 'تم التسجيل بنجاح!' : 'Check-in Successful!'}
                    </h2>
                    <p className="text-gray-700">
                      {result.data?.registration?.groupName}
                    </p>
                    <div className="mt-4 p-4 bg-white rounded-lg inline-block">
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'التوقيت: ' : 'Time: '}
                        {new Date(result.data?.registration?.checkedInAt).toLocaleTimeString(
                          isRTL ? 'ar-OM' : 'en-US'
                        )}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-20 h-20 mx-auto mb-4 text-orange-500" />
                    <h2 className="text-2xl font-bold text-orange-700 mb-2">
                      {result.message}
                    </h2>
                    {result.data?.checkedInAt && (
                      <p className="text-sm text-gray-600 mt-2">
                        {isRTL ? 'تم التسجيل في: ' : 'Previously checked in at: '}
                        {new Date(result.data.checkedInAt).toLocaleString(
                          isRTL ? 'ar-OM' : 'en-US'
                        )}
                      </p>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">
              {isRTL ? 'تعليمات' : 'Instructions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={`space-y-2 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>
                  {isRTL 
                    ? 'استخدم ماسح الباركود لمسح رمز QR من بطاقة الحضور'
                    : 'Use a barcode scanner to scan the QR code from the attendee card'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>
                  {isRTL 
                    ? 'سيتم إدخال الرمز تلقائياً والتحقق منه'
                    : 'The code will be automatically entered and verified'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>
                  {isRTL 
                    ? 'أو أدخل الرمز يدوياً واضغط على زر التحقق'
                    : 'Or enter the code manually and click the verify button'}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRScanner;