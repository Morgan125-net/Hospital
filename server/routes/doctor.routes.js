const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const Doctor = require("../models/doctor.model");
const Appointment = require("../models/appointment.model");

// List doctor accounts for admin dashboard
router.get("/", auth, role(["admin"]), async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create doctor account by admin
router.post("/", auth, role(["admin"]), async (req, res) => {
  try {
    const { fullName, username, password, email, phone, department } = req.body;

    if (!fullName || !username || !password || !department) {
      return res.status(400).json({
        message: "Full name, username, password, and department are required",
      });
    }

    const existingDoctor = await Doctor.findOne({ username: username.trim() });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = new Doctor({
      fullName: fullName.trim(),
      username: username.trim(),
      password: hashedPassword,
      email: email || "",
      phone: phone || "",
      department: department.trim(),
      role: "doctor",
    });

    await doctor.save();

    res.status(201).json({
      message: "Doctor account created successfully",
      doctor: {
        _id: doctor._id,
        fullName: doctor.fullName,
        username: doctor.username,
        email: doctor.email,
        phone: doctor.phone,
        department: doctor.department,
        role: doctor.role,
        isActive: doctor.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete doctor account by admin
router.delete("/:id", auth, role(["admin"]), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update doctor weekly availability
router.patch("/availability", auth, role(["doctor"]), async (req, res) => {
  try {
    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({
        message: "Availability must be an array",
      });
    }

    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.availability = availability;
    await doctor.save();

    res.json({
      message: "Availability updated successfully",
      availability: doctor.availability,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add unavailable date
router.patch("/unavailable-dates", auth, role(["doctor"]), async (req, res) => {
  try {
    const { date, reason } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const alreadyExists = (doctor.unavailableDates || []).find(
      (item) => item.date === date
    );

    if (alreadyExists) {
      return res.status(400).json({
        message: "This unavailable date already exists",
      });
    }

    doctor.unavailableDates.push({
      date,
      reason: reason || "",
    });

    await doctor.save();

    res.json({
      message: "Unavailable date added successfully",
      unavailableDates: doctor.unavailableDates,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available doctors for patients
router.get("/available", async (req, res) => {
  try {
    const { department, date, time } = req.query;

    if (!department || !date || !time) {
      return res.status(400).json({
        message: "Department, date and time are required",
      });
    }

    const selectedDate = new Date(date);

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const weekday = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const doctors = await Doctor.find({
      department,
      isActive: true,
    });

    const availableDoctors = [];

    for (const doctor of doctors) {
      const availability = doctor.availability || [];
      const unavailableDates = doctor.unavailableDates || [];

      const hasWorkingDay = availability.find(
        (slot) =>
          slot.day === weekday &&
          slot.isAvailable &&
          time >= slot.startTime &&
          time < slot.endTime
      );

      const blockedDate = unavailableDates.find((item) => item.date === date);

      const existingAppointment = await Appointment.findOne({
        doctorId: doctor._id,
        date,
        time,
        status: { $in: ["scheduled", "confirmed"] },
      });

      if (hasWorkingDay && !blockedDate && !existingAppointment) {
        availableDoctors.push({
          _id: doctor._id,
          fullName: doctor.fullName,
          department: doctor.department,
        });
      }
    }

    res.json(availableDoctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Doctor dashboard
router.get("/dashboard", auth, role(["doctor"]), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select("-password");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointments = await Appointment.find({
      doctorId: doctor._id,
      status: { $in: ["scheduled", "confirmed"] },
    }).sort({ date: 1, time: 1 });

    res.json({
      doctor,
      appointments,
      totalAppointments: appointments.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
