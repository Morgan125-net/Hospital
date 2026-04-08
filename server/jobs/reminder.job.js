const cron = require("node-cron");
const Appointment = require("../models/appointment.model");
const { sendAppointmentSMS } = require("../services/sms.service");

cron.schedule("0 8 * * *", async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const date = tomorrow.toISOString().split("T")[0];

  const appointments = await Appointment.find({
    date,
    status: "scheduled",
  });

  for (const appt of appointments) {
    await sendAppointmentSMS({
      phone: appt.phone,
      patientName: appt.patientName,
      date: appt.date,
      time: appt.time,
      referenceId: appt.referenceId,
    });
  }
});