const express = require('express');
const router = express.Router();

const Doctor = require('../models/doctor.model');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

// Create doctor (admin only)
router.post('/', auth, role(['admin']), async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();

    res.status(201).json({
      message: 'Doctor created',
      doctor
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all doctors
router.get('/', auth, async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
});

module.exports = router;