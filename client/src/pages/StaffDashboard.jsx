import { useEffect, useState } from "react";

export default function StaffDashboard() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const total = appointments.length;
  const scheduled = appointments.filter(
    (a) => a.status === "scheduled"
  ).length;
  const cancelled = appointments.filter(
    (a) => a.status === "cancelled"
  ).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h1 className="text-4xl font-bold">Staff Dashboard</h1>
        <p className="text-slate-500 mt-2">
          Reception overview of all hospital appointments
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl shadow p-6">
          <p>Total Bookings</p>
          <h2 className="text-4xl font-bold">{total}</h2>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <p>Scheduled</p>
          <h2 className="text-4xl font-bold text-green-600">{scheduled}</h2>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <p>Cancelled</p>
          <h2 className="text-4xl font-bold text-red-600">{cancelled}</h2>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="p-4 text-left">Patient</th>
              <th className="p-4 text-left">Department</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Time</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.slice(0, 5).map((appt, index) => (
              <tr key={index} className="border-b">
                <td className="p-4">{appt.patientName}</td>
                <td className="p-4">{appt.department}</td>
                <td className="p-4">{appt.date}</td>
                <td className="p-4">{appt.time}</td>
                <td className="p-4">{appt.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}