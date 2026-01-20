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

    // Generate unique QR code ID
    const registrationId = `${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Generate QR code using ONLY the registrationId
    const qrCode = await generateQRCode(registrationId);

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
      registrationId: registration.qrCode, // ✅ return actual QR ID
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

    
    try {
      const parsed = JSON.parse(qrCode);
      if (parsed?.registrationId) {
        qrCode = parsed.registrationId;
      }
    } catch (e) {
        }

    const registration = await Registration.findOne({ qrCode });
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
