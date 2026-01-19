import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Configure SendGrid with your API key from .env
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// English & Arabic email content translations
export const sendQREmail = async (email, qrCode, eventTitle, language = 'en') => {
  // Extract base64 data from QR code data URL
  const qrBase64 = qrCode.replace(/^data:image\/png;base64,/, '');

  const translations = {
    en: {
      subject: `Registration Confirmation - ${eventTitle}`,
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            .header { 
              background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .content { 
              padding: 40px 30px;
            }
            .qr-container { 
              background: #f9fafb; 
              padding: 30px; 
              text-align: center; 
              margin: 30px 0; 
              border-radius: 12px;
              border: 2px dashed #d1d5db;
            }
            .qr-code { 
              max-width: 280px;
              width: 100%;
              height: auto; 
              display: block;
              margin: 0 auto;
            }
            .info-box {
              background: #e0f2fe; 
              padding: 20px; 
              border-left: 4px solid #0284c7; 
              margin: 25px 0; 
              border-radius: 6px;
            }
            .info-box p {
              margin: 0;
              line-height: 1.5;
            }
            .footer { 
              text-align: center; 
              padding: 30px;
              background-color: #f9fafb;
              color: #6b7280;
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
            }
            @media only screen and (max-width: 600px) {
              .header h1 {
                font-size: 24px;
              }
              .content {
                padding: 30px 20px;
              }
              .qr-code {
                max-width: 220px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🎉 Registration Successful!</h1>
            </div>
            <div class="content">
              <h2 style="color: #1f2937; margin-top: 0;">Welcome to ${eventTitle}</h2>
              <p style="font-size: 16px; color: #4b5563;">
                Thank you for registering! We're excited to have you join us.
              </p>
              <div class="qr-container">
                <p style="margin: 0 0 15px 0; font-weight: bold; color: #1f2937; font-size: 18px;">
                  Your Check-in QR Code
                </p>
                <img src="cid:qrcode" alt="QR Code" class="qr-code" />
                <p style="color: #059669; font-weight: bold; margin: 20px 0 10px 0; font-size: 16px;">
                  ✓ Please save this QR code
                </p>
                <p style="font-size: 14px; color: #6b7280; margin: 0;">
                  You'll need to present this at the event entrance for check-in.
                </p>
              </div>
              <div class="info-box">
                <p style="font-weight: bold; color: #0369a1; margin-bottom: 8px;">
                  📱 Quick Tip
                </p>
                <p style="color: #475569;">
                  Save this email or take a screenshot of your QR code for easy access at the event. 
                  You can also print it out if you prefer!
                </p>
              </div>
              <p style="font-size: 16px; color: #4b5563;">
                If you have any questions, please don't hesitate to contact the event organizers.
              </p>
              <p style="font-size: 16px; color: #4b5563; margin-top: 30px;">
                See you at the event! 🎊
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">This is an automated message from the SME Events Platform</p>
              <p style="margin: 10px 0 0 0; font-size: 12px;">
                Please do not reply to this email
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    ar: {
      subject: `تأكيد التسجيل - ${eventTitle}`,
      body: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              direction: rtl;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            .header { 
              background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .content { 
              padding: 40px 30px;
            }
            .qr-container { 
              background: #f9fafb; 
              padding: 30px; 
              text-align: center; 
              margin: 30px 0; 
              border-radius: 12px;
              border: 2px dashed #d1d5db;
            }
            .qr-code { 
              max-width: 280px;
              width: 100%;
              height: auto; 
              display: block;
              margin: 0 auto;
            }
            .info-box {
              background: #e0f2fe; 
              padding: 20px; 
              border-right: 4px solid #0284c7; 
              margin: 25px 0; 
              border-radius: 6px;
            }
            .info-box p {
              margin: 0;
              line-height: 1.5;
            }
            .footer { 
              text-align: center; 
              padding: 30px;
              background-color: #f9fafb;
              color: #6b7280;
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
            }
            @media only screen and (max-width: 600px) {
              .header h1 {
                font-size: 24px;
              }
              .content {
                padding: 30px 20px;
              }
              .qr-code {
                max-width: 220px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>!🎉 تم التسجيل بنجاح</h1>
            </div>
            <div class="content">
              <h2 style="color: #1f2937; margin-top: 0;">مرحباً بك في ${eventTitle}</h2>
              <p style="font-size: 16px; color: #4b5563;">
                شكراً لتسجيلك! نحن متحمسون لانضمامك إلينا.
              </p>
              <div class="qr-container">
                <p style="margin: 0 0 15px 0; font-weight: bold; color: #1f2937; font-size: 18px;">
                     الخاص بكQR هذا
                </p>
                <img src="cid:qrcode" alt="رمز QR" class="qr-code" />
                <p style="color: #059669; font-weight: bold; margin: 20px 0 10px 0; font-size: 16px;">
                    QR  يرجى حفظ رمز 
                </p>
                <p style="font-size: 14px; color: #6b7280; margin: 0;">
                  ستحتاج إلى تقديم هذا عند مدخل الفعالية لتسجيل الدخول.
                </p>
              </div>
              <div class="info-box">
                <p style="font-weight: bold; color: #0369a1; margin-bottom: 8px;">
                  📱 نصيحة سريعة
                </p>
                <p style="color: #475569;">
                  احفظ هذا البريد الإلكتروني أو التقط لقطة شاشة لرمز  الخاص بك لسهولة الوصول إليه في الفعالية. 
                  يمكنك أيضاً طباعته إذا كنت تفضل ذلك!
                </p>
              </div>
              <p style="font-size: 16px; color: #4b5563;">
                إذا كان لديك أي أسئلة، يرجى عدم التردد في الاتصال بمنظمي الفعالية.
              </p>
              <p style="font-size: 16px; color: #4b7280; margin-top: 30px;">
                نراكم في الفعالية! 🎊
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">هذه رسالة تلقائية من منصة فعاليات الشركات الصغيرة والمتوسطة</p>
              <p style="margin: 10px 0 0 0; font-size: 12px;">
                يرجى عدم الرد على هذا البريد الإلكتروني
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  };

  // Select content based on language
  const content = translations[language] || translations.en;

  // Compose SendGrid email message
  const msg = {
    to: email,
    from: process.env.EMAIL_FROM, 
    subject: content.subject,
    html: content.body,
    attachments: [
      {
        content: qrBase64,
        filename: 'qrcode.png',
        type: 'image/png',
        disposition: 'inline',
        content_id: 'qrcode'
      }
    ]
  };

  try {
    await sgMail.send(msg);
    console.log(`:D Email sent successfully to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`D; SendGrid email sending error to ${email}:`, error.response?.body || error);
    throw error;
  }
};
