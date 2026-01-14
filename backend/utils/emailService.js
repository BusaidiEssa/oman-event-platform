import nodemailer from 'nodemailer';

// initializing to env variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
//english & arabic email content translations
export const sendQREmail = async (email, qrCode, eventTitle, language = 'en') => {
  const translations = {
    en: {
      subject: `Registration Confirmation - ${eventTitle}`,
      body: `
        <h2>Registration Successful!</h2>
        <p>Thank you for registering for ${eventTitle}.</p>
        <p>Please find your QR code below. Present this at the event entrance.</p>
        <img src="${qrCode}" alt="QR Code" />
      `
    },
    ar: {
      subject: `تأكيد التسجيل - ${eventTitle}`,
      body: `
        <h2>تم التسجيل بنجاح!</h2>
        <p>شكراً لتسجيلك في ${eventTitle}.</p>
        <p>يرجى العثور على رمز QR أدناه. قدمه عند مدخل الفعالية.</p>
        <img src="${qrCode}" alt="QR Code" />
      `
    }
  };

  //select content based on register's chosen language
  const content = translations[language] || translations.en;

  // emmail configuration
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: content.subject,
    html: content.body
  };
  // check if email was sent or not
  try {
    await transporter.sendMail(mailOptions);
    console.log(' :) Email sent successfully to', email);
  } catch (error) {
    console.error(' :( Email sending error:', error);
    throw error;
  }
};