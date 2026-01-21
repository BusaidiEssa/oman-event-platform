import mongoose from 'mongoose';
// defines the schema for the manager collection
const managerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, //converts email to lowercase to ensure consistency
    trim: true //remove any leading or trailing spaces
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Manager', managerSchema);
