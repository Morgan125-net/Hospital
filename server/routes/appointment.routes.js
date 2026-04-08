const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const Appointment = require("../models/appointment.model");
const { sendAppointmentSMS } = require("../services/sms.service");

const departments = {
  "General Doctor": true,
  "Eye Care": true,
  Dentist: true,
  Therapist: true,
  "ENT Specialist": true,
  Pediatrician: true,
  Gynecologist: true,
  Cardiologist: true,
  Dermatologist: true,
  Orthopedic: true,
};

const validateTime = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  if (isNaN(hour) || isNaN(minute)) return false;
  if (hour < 8 || hour >= 17) return false;
  if (![0, 30].includes(minute)) return false;
  return true;
};

// ===============================
// PUBLIC PATIENT ROUTES
// ===============================

// Book appointment
router.post("/", async (req, res) => {
  try {
    const { date, time, department, patientName, phone } = req.body;

    if (!departments[department]) {
      return res.status(400).json({ message: "Invalid department name" });
    }

    if (!validateTime(time)) {
      return res.status(400).json({
        message: "Appointments only allowed between 08:00 and 17:00 in 30-minute intervals"
      });
    }

    const selectedDate = new Date(date);
    const today = new Date();

    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      return res.status(400).json({
        message: "Please choose a future working day"
      });
    }

    const day = selectedDate.getDay();
    if (day === 0 || day === 6) {
      return res.status(400).json({
        message: "Appointments are not available on weekends"
      });
    }

    const conflict = await Appointment.findOne({
      date,
      time,
      department,
      status: { $ne: "cancelled" }
    });

    if (conflict) {
      return res.status(409).json({
        message: "Time slot already booked"
      });
    }

    const appointment = new Appointment({
      referenceId: `HSP-${Date.now()}`,
      patientId: `PAT-${Date.now()}`,
      patientName,
      phone,
      department,
      date,
      time,
      status: "scheduled"
    });

    await appointment.save();

    await sendAppointmentSMS({
      phone,
      patientName,
      date,
      time,
      referenceId: appointment.referenceId,
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      referenceId: appointment.referenceId
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Track own booking
router.post("/track", async (req, res) => {
  try {
    const { referenceId, phone } = req.body;

    const appointment = await Appointment.findOne({
      referenceId,
      phone
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    res.json(appointment);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Cancel own booking
router.patch("/cancel", async (req, res) => {
  try {
    const { referenceId, phone } = req.body;

    const appointment = await Appointment.findOne({
      referenceId,
      phone
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({
      message: "Appointment cancelled successfully"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Reschedule own booking
router.patch("/reschedule", async (req, res) => {
  try {
    const { referenceId, phone, date, time } = req.body;

    if (!validateTime(time)) {
      return res.status(400).json({
        message: "Invalid time format"
      });
    }

    const appointment = await Appointment.findOne({
      referenceId,
      phone
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    const conflict = await Appointment.findOne({
      date,
      time,
      department: appointment.department,
      _id: { $ne: appointment._id },
      status: { $ne: "cancelled" }
    });

    if (conflict) {
      return res.status(409).json({
        message: "Time slot already booked"
      });
    }

    appointment.date = date;
    appointment.time = time;
    appointment.status = "scheduled";

    await appointment.save();

    res.json({
      message: "Appointment rescheduled successfully"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// STAFF / ADMIN ROUTES
// ===============================

// All appointments
router.get("/", auth, role(["staff", "admin"]), async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update status
router.patch("/:id/status", auth, role(["staff", "admin"]), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    appointment.status = req.body.status;
    appointment.updatedBy = req.user.id;
    appointment.updatedRole = req.user.role;

    await appointment.save();

    res.json({
      message: "Appointment status updated",
      appointment
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;