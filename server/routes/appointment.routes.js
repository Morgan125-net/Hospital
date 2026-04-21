const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const auth = require("../middleware/auth.middleware");
const { sendAppointmentSMS } = require("../services/sms.service");
const Appointment = require("../models/appointment.model");
const Doctor = require("../models/doctor.model");

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
  if (!time || typeof time !== "string") return false;
  const [hour, minute] = time.split(":").map(Number);
  if (isNaN(hour) || isNaN(minute)) return false;
  if (hour < 8 || hour >= 17) return false;
  if (![0, 30].includes(minute)) return false;
  return true;
};

const portalRoles = ["admin", "staff", "doctor"];
const appointmentStatuses = [
  "scheduled",
  "completed",
  "cancelled",
  "no-show",
  "confirmed",
];

const getWeekday = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "long",
  });

const isDoctorAvailable = (doctor, date, time) => {
  const selectedDate = new Date(date);

  if (Number.isNaN(selectedDate.getTime())) {
    return false;
  }

  const weekday = getWeekday(selectedDate);
  const availability = doctor.availability || [];
  const unavailableDates = doctor.unavailableDates || [];

  const hasWorkingSlot = availability.some(
    (slot) =>
      slot.day === weekday &&
      slot.isAvailable &&
      time >= slot.startTime &&
      time < slot.endTime
  );

  const isBlockedDate = unavailableDates.some((item) => item.date === date);

  return hasWorkingSlot && !isBlockedDate;
};

const canManageAppointments = (user) => portalRoles.includes(user?.role);

const canAccessAppointment = (user, appointment) => {
  if (["admin", "staff"].includes(user?.role)) return true;
  if (user?.role === "doctor") {
    return String(appointment.doctorId) === String(user.id);
  }
  return false;
};

// ===============================
// PUBLIC PATIENT ROUTE
// ===============================
router.post("/", async (req, res) => {
  try {
    const {
      date,
      time,
      department,
      patientName,
      phone,
      email,
      doctorId,
      message,
    } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database connection unavailable" });
    }

    if (!department || !date || !time || !patientName || !phone || !doctorId) {
      return res.status(400).json({
        message: "Department, date, time, patient name, phone, and doctor are required",
      });
    }

    if (!departments[department]) {
      return res.status(400).json({ message: "Invalid department name" });
    }

    if (!validateTime(time)) {
      return res.status(400).json({
        message:
          "Appointments only allowed between 08:00 and 17:00 in 30-minute intervals",
      });
    }

    const selectedDate = new Date(date);
    const today = new Date();

    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      return res.status(400).json({
        message: "Please choose a future working day",
      });
    }

    const day = selectedDate.getDay();
    if (day === 0 || day === 6) {
      return res.status(400).json({
        message: "Appointments are not available on weekends",
      });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (!doctor.isActive) {
      return res.status(400).json({ message: "Selected doctor is not active" });
    }

    if (doctor.department !== department) {
      return res.status(400).json({
        message: "Selected doctor does not belong to this department",
      });
    }

    if (!isDoctorAvailable(doctor, date, time)) {
      return res.status(409).json({
        message: "Selected doctor is not available for that date and time",
      });
    }

    const referenceId = `HSP-${Date.now()}`;

    const conflict = await Appointment.findOne({
      date,
      time,
      doctorId: doctor._id,
      status: { $ne: "cancelled" },
    });

    if (conflict) {
      return res.status(409).json({
        message: "This doctor is already booked for that date and time",
      });
    }

    const appointment = new Appointment({
      referenceId,
      patientName,
      department,
      doctorId: doctor._id,
      doctorName: doctor.fullName,
      date,
      time,
      phone,
      email,
      message,
      status: "scheduled",
      createdBy: "patient",
    });

    await appointment.save();

    try {
      await sendAppointmentSMS({
        phone,
        patientName,
        date,
        time,
        referenceId: appointment.referenceId,
      });
    } catch (error) {
      console.log("SMS skipped in presentation mode");
    }

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      referenceId: appointment.referenceId,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ===============================
// STAFF / ADMIN ROUTES
// ===============================
router.get("/", auth, async (req, res) => {
  try {
    if (!canManageAppointments(req.user)) {
      return res.status(403).json({ message: "Forbidden: insufficient rights" });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database connection unavailable" });
    }

    const query =
      req.user.role === "doctor" ? { doctorId: req.user.id } : {};
    const appointments = await Appointment.find(query).sort({
      date: -1,
      time: -1,
    });
    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// update appointment status
router.patch("/:id/status", auth, async (req, res) => {
  try {
    if (!canManageAppointments(req.user)) {
      return res.status(403).json({ message: "Forbidden: insufficient rights" });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database connection unavailable" });
    }

    const { status } = req.body;

    if (!appointmentStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid appointment status" });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (!canAccessAppointment(req.user, appointment)) {
      return res.status(403).json({ message: "Forbidden: insufficient rights" });
    }

    appointment.status = status;
    appointment.updatedBy = req.user.id || "";
    appointment.updatedRole = req.user.role || "";
    await appointment.save();

    return res.json({
      success: true,
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ===============================
// PUBLIC PATIENT ACTIONS
// ===============================

// Cancel appointment
router.patch("/cancel", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database connection unavailable" });
    }

    const { referenceId, phone } = req.body;

    const appointment = await Appointment.findOneAndUpdate(
      { referenceId, phone },
      { status: "cancelled" },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found. Check reference ID and phone number.",
      });
    }

    return res.json({
      success: true,
      message: "Appointment cancelled successfully",
      referenceId: appointment.referenceId,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Reschedule appointment
router.patch("/reschedule", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database connection unavailable" });
    }

    const { referenceId, phone, date, time } = req.body;

    if (!validateTime(time)) {
      return res.status(400).json({
        message:
          "Appointments only allowed between 08:00 and 17:00 in 30-minute intervals",
      });
    }

    const selectedDate = new Date(date);
    const today = new Date();

    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      return res.status(400).json({
        message: "Please choose a future working day",
      });
    }

    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.status(400).json({
        message: "Appointments are not available on weekends",
      });
    }

    const appointment = await Appointment.findOne({ referenceId, phone });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found. Check reference ID and phone number.",
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        message: "Cancelled appointments cannot be rescheduled",
      });
    }

    const doctor = await Doctor.findById(appointment.doctorId);

    if (!doctor || !doctor.isActive) {
      return res.status(400).json({
        message: "Assigned doctor is not available for rescheduling",
      });
    }

    if (!isDoctorAvailable(doctor, date, time)) {
      return res.status(409).json({
        message: "Selected doctor is not available for that date and time",
      });
    }

    const conflict = await Appointment.findOne({
      date,
      time,
      doctorId: appointment.doctorId,
      status: { $ne: "cancelled" },
      _id: { $ne: appointment._id },
    });

    if (conflict) {
      return res.status(409).json({
        message: "This doctor is already booked for that date and time",
      });
    }

    appointment.date = date;
    appointment.time = time;
    await appointment.save();

    return res.json({
      success: true,
      message: "Appointment rescheduled successfully",
      referenceId: appointment.referenceId,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Track appointment
router.post("/track", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database connection unavailable" });
    }

    const { referenceId, phone } = req.body;

    const appointment = await Appointment.findOne({ referenceId, phone });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found. Check reference ID and phone number.",
      });
    }

    return res.json({
      success: true,
      referenceId: appointment.referenceId,
      patientName: appointment.patientName,
      department: appointment.department,
      doctorName: appointment.doctorName,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
