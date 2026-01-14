//simple registration schema
import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  groupName: {
    type: String,
    required: true
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  qrCode: {
    type: String,
    required: true,
    unique: true
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: Date,
  email: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Registration', registrationSchema);