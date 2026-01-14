//Event schema that includes fieldschema and groupSchema
import mongoose from 'mongoose';

//field schema 
const fieldSchema = new mongoose.Schema({
  label: String,
  type: {
    type: String,
    enum: ['text', 'number', 'select', 'file']
  },
  options: [String],
  required: Boolean
});
//groupschema that uses the field schema
const groupSchema = new mongoose.Schema({
  name: String,
  capacity: Number,
  fields: [fieldSchema]
});
//event schema that uses the group schema
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true
  },
  location: String,
  description: String,
  groups: [groupSchema],
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Event', eventSchema);