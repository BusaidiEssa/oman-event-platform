import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const testEmail = async () => {
  console.log('Testing email configuration...\n');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');
  console.log('\n');

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email - SME Events Platform',
      html: `
        <h2>Email Configuration Successful!</h2>
        <p>Your SME Events Platform can now send emails.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\n✅ Email configuration is working correctly!');
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error(error.message);
    console.log('\n📝 Troubleshooting:');
    console.log('1. Check your Gmail App Password is correct (16 characters, no spaces)');
    console.log('2. Make sure 2-Factor Authentication is enabled');
    console.log('3. Verify EMAIL_USER is a valid Gmail address');
    console.log('4. Check your internet connection');
  }
};

testEmail();