const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  availableDays: {
    type: [String], // e.g. ["Monday", "Tuesday"]
    required: true
  },
  startTime: {
    type: String, // "08:00"
    required: true
  },
  endTime: {
    type: String, // "17:00"
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);