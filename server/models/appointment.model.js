const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  referenceId: {
  type: String,
  required: true,
  unique: true
},
  patientId: {
    type: String,
    required: true
  },
  patientName: {
  type: String,
  required: true
},
phone: {
  type: String,
  required: true
},
  date: { 
    type: String, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  department: { 
    type: String, 
    required: true 
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  createdBy: {
    type: String
  },
  updatedBy: {
  type: String
},
updatedRole: {
  type: String
},
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);