import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import { generateQRCode } from '../utils/qrGenerator.js';
import { sendQREmail } from '../utils/emailService.js';
import sgMail from '@sendgrid/mail'; // changed from nodemailer


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const register = async (req, res) => {
  try {
    const { eventSlug, groupName, formData, language } = req.body;

    const event = await Event.findOne({ slug: eventSlug });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const group = event.groups.find(g => g.name === groupName);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if registration form is open
    if (!group.isOpen) {
      return res.status(403).json({ 
        message: 'Registration for this category is currently closed' 
      });
    }

    // Atomic capacity check
    const currentCount = await Registration.countDocuments({
      eventId: event._id,
      groupName
    });

    if (currentCount >= group.capacity) {
      return res.status(400).json({ message: 'Capacity reached' });
    }

    // Extract email from form data (case-insensitive)
    const email = formData.email || formData.Email || formData.EMAIL;
    
    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required for registration' 
      });
    }

    // Generate unique QR code
    const registrationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const qrData = {
      eventId: event._id.toString(),
      groupName,
      registrationId,
      timestamp: new Date().toISOString()
    };

    const qrCode = await generateQRCode(qrData);

    const registration = new Registration({
      eventId: event._id,
      groupName,
      formData,
      qrCode: registrationId,
      email
    });

    await registration.save();

    // Send email with QR code
    try {
      await sendQREmail(
        email,
        qrCode,
        event.title,
        language || 'en'
      );
      console.log(`:D Registration email sent successfully to ${email}`);
    } catch (emailError) {
      console.error(`D; Failed to send email to ${email}:`, emailError.message);
      // Don't fail the registration if email fails, just log it to allow manual check in at venue
    }

    res.status(201).json({
      message: 'Registration successful',
      qrCode,
      registrationId: registration._id,
      emailSent: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

//retrieve registrations
export const getRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findOne({
      _id: eventId,
      managerId: req.managerId
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registrations = await Registration.find({ eventId })
      .sort({ createdAt: -1 });
    
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update registrations
export const updateRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const updates = req.body;

    // Verify event ownership
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const event = await Event.findOne({
      _id: registration.eventId,
      managerId: req.managerId
    });

    if (!event) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update allowed fields
    if (updates.formData) registration.formData = updates.formData;
    if (updates.email) registration.email = updates.email;

    await registration.save();
    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// handle delete registrations
export const deleteRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Verify event ownership
    const event = await Event.findOne({
      _id: registration.eventId,
      managerId: req.managerId
    });

    if (!event) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Registration.findByIdAndDelete(registrationId);
    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//handle checkin
export const checkIn = async (req, res) => {
  try {
    let { qrCode } = req.body;

    // Try to parse QR code if it's JSON
    let registrationId = qrCode;
    try {
      const parsed = JSON.parse(qrCode);
      registrationId = parsed.registrationId || parsed.qrCode || qrCode;
    } catch (e) {
      // If parsing fails, use qrCode as-is (it's already the registrationId)
      registrationId = qrCode;
    }

    const registration = await Registration.findOne({ qrCode: registrationId });
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.checkedIn) {
      return res.status(400).json({ 
        message: 'Already checked in',
        checkedInAt: registration.checkedInAt
      });
    }

    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    await registration.save();

    res.json({
      message: 'Check-in successful',
      registration
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//retrieve analytics
export const getAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({
      _id: eventId,
      managerId: req.managerId
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registrations = await Registration.find({ eventId });

    const analytics = event.groups.map(group => {
      const groupRegs = registrations.filter(r => r.groupName === group.name);
      return {
        groupName: group.name,
        capacity: group.capacity,
        isOpen: group.isOpen,
        registrations: groupRegs.length,
        checkedIn: groupRegs.filter(r => r.checkedIn).length,
        available: group.capacity - groupRegs.length
      };
    });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//send emails  using Sendgrid
export const sendMassEmail = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { filters, emailData } = req.body;

    console.log('Mass email request:', { eventId, filters, emailData });

    // Validate inputs
    if (!emailData?.subject || !emailData?.message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    // Get the event to verify ownership and get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Verify the user owns this event
    if (event.managerId.toString() !== req.managerId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Build query based on filters
    let query = { eventId };

    if (filters.groupName && filters.groupName !== 'all') {
      query.groupName = filters.groupName;
    }

    if (filters.checkedIn === 'true') {
      query.checkedIn = true;
    } else if (filters.checkedIn === 'false') {
      query.checkedIn = false;
    }

    if (filters.searchEmail && filters.searchEmail.trim()) {
      query.email = { $regex: filters.searchEmail.trim(), $options: 'i' };
    }

    console.log('Query:', query);

    // Get all matching registrations
    const registrations = await Registration.find(query);

    console.log('Found registrations:', registrations.length);

    if (registrations.length === 0) {
      return res.status(400).json({ message: 'No recipients found with the selected filters' });
    }

    // Send emails
    let sentCount = 0;
    let failedCount = 0;
    const errors = [];

    for (const registration of registrations) {
      try {
        // Get name from formData (try multiple field names)
        const name = registration.formData['Full Name'] || 
                    registration.formData['الاسم الكامل'] || 
                    registration.formData['Name'] ||
                    registration.formData['name'] ||
                    'Attendee';

        // Personalize the subject
        const personalizedSubject = emailData.subject
          .replace(/{name}/g, name)
          .replace(/{groupName}/g, registration.groupName)
          .replace(/{eventTitle}/g, event.title);

        // Personalize the message
        const personalizedMessage = emailData.message
          .replace(/{name}/g, name)
          .replace(/{groupName}/g, registration.groupName)
          .replace(/{eventTitle}/g, event.title);

        // Create email HTML
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
              }
              .message {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                white-space: pre-wrap;
              }
              .footer {
                background: #1f2937;
                color: #9ca3af;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                border-radius: 0 0 10px 10px;
              }
              .event-details {
                color: #6b7280;
                font-size: 14px;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">${event.title}</h1>
            </div>
            <div class="content">
              <div class="message">
                ${personalizedMessage.replace(/\n/g, '<br>')}
              </div>
              <div class="event-details">
                <p><strong>Group:</strong> ${registration.groupName}</p>
                <p><strong>Event Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from ${event.title} event management system.</p>
              <p>If you have any questions, please contact the event organizer.</p>
            </div>
          </body>
          </html>
        `;

        // SEND EMAIL USING SENDGRID 
        await sgMail.send({
          to: registration.email,
          from: process.env.EMAIL_FROM,
          subject: personalizedSubject,
          html: emailHtml
        });

        sentCount++;
        console.log(`:D Email sent to: ${registration.email}`);

      } catch (emailError) {
        console.error(`D; Failed to send email to ${registration.email}:`, emailError);
        failedCount++;
        errors.push({
          email: registration.email,
          error: emailError.message
        });
      }
    }

    console.log(`Mass email completed: ${sentCount} sent, ${failedCount} failed`);

    res.json({
      message: 'Mass email process completed',
      sentCount,
      failedCount,
      totalRecipients: registrations.length,
      errors: failedCount > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Mass email error:', error);
    res.status(500).json({ 
      message: 'Server error sending mass emails',
      error: error.message 
    });
  }
};
