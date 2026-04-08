const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const formatKenyanPhone = (phone) => {
  if (phone.startsWith("0")) {
    return `+254${phone.slice(1)}`;
  }

  if (phone.startsWith("254")) {
    return `+${phone}`;
  }

  return phone;
};

const sendAppointmentSMS = async ({
  phone,
  patientName,
  date,
  time,
  referenceId
}) => {
  const formattedPhone = formatKenyanPhone(phone);

  return client.messages.create({
    body: `Hello ${patientName}, your appointment is confirmed for ${date} at ${time}. Ref: ${referenceId}`,
    from: process.env.TWILIO_PHONE,
    to: formattedPhone
  });
};

module.exports = { sendAppointmentSMS };