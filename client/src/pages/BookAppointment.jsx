import { useState } from "react";
import "./BookAppointment.css";
import {
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
  trackAppointment,
} from "../services/appointmentService";

const departments = [
  "General Doctor",
  "Eye Care",
  "Dentist",
  "Therapist",
  "ENT Specialist",
  "Pediatrician",
  "Gynecologist",
  "Cardiologist",
  "Dermatologist",
  "Orthopedic",
];

const formatDoctorName = (name) => {
  if (!name) return "Doctor";

  const cleanName = name.replace(/^dr\.?\s+/i, "").trim();
  const firstName = cleanName.split(/\s+/)[0];

  return `Doctor ${firstName}`;
};

export default function BookAppointment() {
  const API_BASE = import.meta.env.VITE_API_URL || "";
  const [mode, setMode] = useState("book");
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    department: "",
    doctorId: "",
    date: "",
    time: "",
    phone: "",
    message: "",
    referenceId: "",
    newDate: "",
    newTime: "",
  });

  const times = [
    "08:00 AM",
    "08:30 AM",
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
  ];

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const convertTo24Hour = (time12h) => {
    if (!time12h) return "";

    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }

    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const fetchAvailableDoctors = async (department, date, time) => {
    if (!department || !date || !time) {
      setAvailableDoctors([]);
      return;
    }

    try {
      setLoadingDoctors(true);

      const time24 = convertTo24Hour(time);

      const response = await fetch(
        `${API_BASE}/api/doctors/available?department=${encodeURIComponent(
          department
        )}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time24)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load available doctors");
      }

      setAvailableDoctors(data);
    } catch (error) {
      console.error(error);
      setAvailableDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "department" || name === "date" || name === "time") {
        updated.doctorId = "";

        const nextDepartment = name === "department" ? value : updated.department;
        const nextDate = name === "date" ? value : updated.date;
        const nextTime = name === "time" ? value : updated.time;

        fetchAvailableDoctors(nextDepartment, nextDate, nextTime);
      }

      return updated;
    });
  };

  const handleBook = async (e) => {
    e.preventDefault();

    try {
      const response = await bookAppointment({
        patientName: formData.fullName,
        email: formData.email,
        department: formData.department,
        doctorId: formData.doctorId,
        date: formData.date,
        time: convertTo24Hour(formData.time),
        phone: formData.phone,
        message: formData.message,
      });

      alert(
        `Appointment booked successfully ✅\nReference: ${response.referenceId}`
      );

      setAvailableDoctors([]);
      setFormData((prev) => ({
        ...prev,
        fullName: "",
        email: "",
        department: "",
        doctorId: "",
        date: "",
        time: "",
        phone: "",
        message: "",
      }));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();

    try {
      const data = await cancelAppointment({
        referenceId: formData.referenceId,
        phone: formData.phone,
      });

      alert(data.message);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();

    try {
      const data = await rescheduleAppointment({
        referenceId: formData.referenceId,
        phone: formData.phone,
        date: formData.newDate,
        time: convertTo24Hour(formData.newTime),
      });

      alert(data.message);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();

    try {
      const data = await trackAppointment({
        referenceId: formData.referenceId,
        phone: formData.phone,
      });

      alert(
        `Appointment Found ✅
Reference: ${data.referenceId}
Patient: ${data.patientName}
Department: ${data.department}
Doctor: ${data.doctorName || "Not assigned"}
Date: ${data.date}
Time: ${data.time}
Status: ${data.status}`
      );
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="appointment-page">
      <section className="hero">
        <h1>BOOK AN APPOINTMENT</h1>
        <p>
          Schedule your visit with our specialists today. Pick your department,
          choose a suitable time, and confirm your appointment in seconds.
        </p>
      </section>

      <div className="appointment-container">
        <div className="appointment-left">
          <h3>Need Help Booking?</h3>
          <p>Call our support team</p>
          <h2>+254 (0) 794 589 612</h2>
          <h2>+254 (0) 702 692 617</h2>
          <p>Monday - Saturday • 8:00 AM - 5:00 PM</p>
        </div>

        <div className="appointment-right">
          <div className="action-buttons">
            <button type="button" onClick={() => setMode("book")}>
              Book
            </button>
            <button type="button" onClick={() => setMode("cancel")}>
              Cancel
            </button>
            <button type="button" onClick={() => setMode("reschedule")}>
              Reschedule
            </button>
            <button type="button" onClick={() => setMode("track")}>
              My Booking
            </button>
          </div>

          {mode === "book" && (
            <form onSubmit={handleBook} className="appointment-form">
              <input
                type="text"
                name="fullName"
                placeholder="Enter patient's full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />

              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              <input
                type="date"
                name="date"
                min={getMinDate()}
                value={formData.date}
                onChange={handleChange}
                required
              />

              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              >
                <option value="">Select preferred time</option>
                {times.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              {loadingDoctors && (
                <p className="info-text">Loading available doctors...</p>
              )}

              {!loadingDoctors &&
                formData.department &&
                formData.date &&
                formData.time &&
                availableDoctors.length === 0 && (
                  <p className="error-text">
                    No doctors available for that department, date, and time.
                  </p>
                )}

              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
              >
                <option value="">Select doctor</option>
                {availableDoctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {formatDoctorName(doc.fullName)}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <textarea
                name="message"
                rows="6"
                placeholder="Describe symptoms or additional notes"
                value={formData.message}
                onChange={handleChange}
              />

              <button type="submit">BOOK APPOINTMENT</button>
            </form>
          )}

          {mode === "cancel" && (
            <form onSubmit={handleCancel} className="appointment-form">
              <input
                type="text"
                name="referenceId"
                placeholder="Enter booking reference ID"
                value={formData.referenceId}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <button type="submit">CANCEL APPOINTMENT</button>
            </form>
          )}

          {mode === "reschedule" && (
            <form onSubmit={handleReschedule} className="appointment-form">
              <input
                type="text"
                name="referenceId"
                placeholder="Enter booking reference ID"
                value={formData.referenceId}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <input
                type="date"
                name="newDate"
                min={getMinDate()}
                value={formData.newDate}
                onChange={handleChange}
                required
              />

              <select
                name="newTime"
                value={formData.newTime}
                onChange={handleChange}
                required
              >
                <option value="">Select new time</option>
                {times.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              <button type="submit">RESCHEDULE APPOINTMENT</button>
            </form>
          )}

          {mode === "track" && (
            <form className="appointment-form" onSubmit={handleTrack}>
              <div className="form-row">
                <input
                  type="text"
                  name="referenceId"
                  placeholder="Enter booking reference ID"
                  value={formData.referenceId}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit">CHECK MY APPOINTMENT</button>
            </form>
          )}
        </div>
      </div>

      <footer className="footer">Your health, our priority.</footer>
    </div>
  );
}
