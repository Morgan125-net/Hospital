const API = `${import.meta.env.VITE_API_URL}/api/appointments`;

const sendRequest = async (url, method, payload, errorMessage) => {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || errorMessage);
  }

  return data;
};

export const bookAppointment = (payload) =>
  sendRequest(API, "POST", payload, "Booking failed");

export const cancelAppointment = (payload) =>
  sendRequest(`${API}/cancel`, "PATCH", payload, "Cancellation failed");

export const rescheduleAppointment = (payload) =>
  sendRequest(`${API}/reschedule`, "PATCH", payload, "Reschedule failed");

export const trackAppointment = (payload) =>
  sendRequest(`${API}/track`, "POST", payload, "Appointment not found");