const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      required: true,
      unique: true,
    },
    patientId: {
      type: String,
      default: "",
    },
    patientName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no-show", "confirmed"],
      default: "scheduled",
    },
    createdBy: {
      type: String,
      default: "patient",
    },
    updatedBy: {
      type: String,
      default: "",
    },
    updatedRole: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);