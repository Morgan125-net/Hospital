import { useEffect, useMemo, useState } from "react";

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [department, setDepartment] = useState("All");

useEffect(() => {
  fetchAppointments();
}, []);

const fetchAppointments = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/appointments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("DASHBOARD DATA:", data);

    setAppointments(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Dashboard fetch error:", error);
  }
};

  const departments = useMemo(() => {
    const unique = [...new Set(appointments.map((a) => a.department).filter(Boolean))];
    return ["All", ...unique];
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    if (department === "All") return appointments;
    return appointments.filter((a) => a.department === department);
  }, [appointments, department]);

  const today = new Date().toISOString().split("T")[0];

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter((a) => a.status === "scheduled").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
    today: appointments.filter((a) => a.date === today).length,
  };

  const recentAppointments = [...filteredAppointments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Dashboard Overview</h1>
            <p className="text-slate-500 mt-2">
              Summary, stats, filters and recent hospital bookings
            </p>
          </div>

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="border rounded-xl px-4 py-3 bg-white"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Bookings" value={stats.total} />
        <StatCard title="Scheduled" value={stats.scheduled} accent="green" />
        <StatCard title="Cancelled" value={stats.cancelled} accent="red" />
        <StatCard title="Today" value={stats.today} accent="blue" />
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold">Recent Bookings</h2>
          <p className="text-slate-500">Latest 5 bookings from the selected filter</p>
        </div>

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
            {recentAppointments.map((appt, index) => (
              <tr key={index} className="border-b hover:bg-slate-50">
                <td className="p-4">{appt.patientName || "—"}</td>
                <td className="p-4">{appt.department}</td>
                <td className="p-4">{appt.date}</td>
                <td className="p-4">{appt.time}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      appt.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {appt.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, accent = "slate" }) {
  const accentMap = {
    slate: "text-slate-900",
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-blue-600",
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
      <p className="text-slate-500 text-sm">{title}</p>
      <h3 className={`text-4xl font-bold mt-2 ${accentMap[accent]}`}>{value}</h3>
    </div>
  );
}

