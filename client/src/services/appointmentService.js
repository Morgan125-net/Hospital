const API_BASE = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');
const API = API_BASE ? `${API_BASE}/api/appointments` : '/api/appointments';

const sendRequest = async (url, method, payload, errorMessage) => {
  let response;

  try {
    response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error("Unable to reach the server. Check deployment, API URL, or CORS settings.");
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.message || errorMessage);
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
