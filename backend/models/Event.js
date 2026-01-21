//Event schema that includes fieldschema and groupSchema
import mongoose from 'mongoose';

//field schema 
const fieldSchema = new mongoose.Schema({
  label: String, //the name of a field  (e.g., "Full Name")
  type: {
    type: String, 
    enum: ['text', 'number', 'select', 'file'] //the allowed field types: text box, number input , select dropdown or file upload
  },
  options: [String],// Array of options that is only aplicable if type is  select 
  required: Boolean // Indicated whether the field is required or not
});
//groupschema that uses the field schema
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  capacity: {  //Maxmimum number of people  allowed in the group
    type: Number,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: true // Registration form is open by default
  },
  fields: [fieldSchema] //array of fields
});
//event schema that uses the group schema
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String, //URL friendly identifier for the event derived from title
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true
  },
  location: String,
  description: String,
  groups: [groupSchema], //groups embedded as part of the evtn
  managerId: { //references the manager who created the event
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now // the date and time of event creation 
  }
});

export default mongoose.model('Event', eventSchema);
