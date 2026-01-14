import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import { generateQRCode } from '../utils/qrGenerator.js';
import { sendQREmail } from '../utils/emailService.js';

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

    // Atomic capacity check
    const currentCount = await Registration.countDocuments({
      eventId: event._id,
      groupName
    });

    if (currentCount >= group.capacity) {
      return res.status(400).json({ message: 'Capacity reached' });
    }

    // Generate unique QR code
    const qrData = {
      eventId: event._id,
      groupName,
      registrationId: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    const qrCode = await generateQRCode(qrData);

    const registration = new Registration({
      eventId: event._id,
      groupName,
      formData,
      qrCode: qrData.registrationId,
      email: formData.email || formData.Email
    });

    await registration.save();

    // Send email with QR code
    if (registration.email) {
      await sendQREmail(
        registration.email,
        qrCode,
        event.title,
        language || 'en'
      );
    }

    res.status(201).json({
      message: 'Registration successful',
      qrCode,
      registrationId: registration._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

export const checkIn = async (req, res) => {
  try {
    const { qrCode } = req.body;

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
