import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config()

// Initialize transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('D; Email transporter verification failed:', error);
  } else {
    console.log(':D Email server is ready to send messages');
  }
});

// English & Arabic email content translations
export const sendQREmail = async (email, qrCode, eventTitle, language = 'en') => {
  const translations = {
    en: {
      subject: `Registration Confirmation - ${eventTitle}`,
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .qr-container { background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .qr-code { max-width: 300px; height: auto; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Registration Successful!</h1>
            </div>
            <div class="content">
              <h2>Welcome to ${eventTitle}</h2>
              <p>Thank you for registering! We're excited to have you join us.</p>
              
              <div class="qr-container">
                <p><strong>Your Check-in QR Code:</strong></p>
                <img src="${qrCode}" alt="QR Code" class="qr-code" />
                <p style="color: #059669; font-weight: bold;">Please save this QR code</p>
                <p style="font-size: 14px; color: #666;">You'll need to present this at the event entrance for check-in.</p>
              </div>
              
              <div style="background: #e0f2fe; padding: 15px; border-left: 4px solid #0284c7; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0;"><strong>📱 Tip:</strong> Save this email or take a screenshot of your QR code for easy access at the event.</p>
              </div>
              
              <p>If you have any questions, please don't hesitate to contact the event organizers.</p>
              
              <p>See you at the event! 🎊</p>
            </div>
            <div class="footer">
              <p>This is an automated message from the SME Events Platform</p>
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
        <html dir="rtl">
        <head>
          <style>
            body { font-family: 'Tajawal', Arial, sans-serif; line-height: 1.6; color: #333; direction: rtl; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .qr-container { background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .qr-code { max-width: 300px; height: auto; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 تم التسجيل بنجاح!</h1>
            </div>
            <div class="content">
              <h2>مرحباً بك في ${eventTitle}</h2>
              <p>شكراً لتسجيلك! نحن متحمسون لانضمامك إلينا.</p>
              
              <div class="qr-container">
                <p><strong>رمز QR الخاص بك:</strong></p>
                <img src="${qrCode}" alt="رمز QR" class="qr-code" />
                <p style="color: #059669; font-weight: bold;">يرجى حفظ رمز QR هذا</p>
                <p style="font-size: 14px; color: #666;">ستحتاج إلى تقديم هذا عند مدخل الفعالية لتسجيل الدخول.</p>
              </div>
              
              <div style="background: #e0f2fe; padding: 15px; border-right: 4px solid #0284c7; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0;"><strong>📱 نصيحة:</strong> احفظ هذا البريد الإلكتروني أو التقط لقطة شاشة لرمز QR الخاص بك لسهولة الوصول إليه في الفعالية.</p>
              </div>
              
              <p>إذا كان لديك أي أسئلة، يرجى عدم التردد في الاتصال بمنظمي الفعالية.</p>
              
              <p>نراكم في الفعالية! 🎊</p>
            </div>
            <div class="footer">
              <p>هذه رسالة تلقائية من منصة فعاليات الشركات الصغيرة والمتوسطة</p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  };

  // Select content based on language
  const content = translations[language] || translations.en;

  // Email configuration
  const mailOptions = {
    from: `"SME Events Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: content.subject,
    html: content.body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`:D Email sent successfully to ${email}`);
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`D; Email sending error to ${email}:`, error);
    throw error;
  }
};