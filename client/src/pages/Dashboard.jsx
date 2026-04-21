import { useCallback, useEffect, useMemo, useState } from "react";

export default function Dashboard() {
  const API_BASE =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost" ? "http://localhost:5000" : "");
  const [appointments, setAppointments] = useState([]);
  const [department, setDepartment] = useState("All");
  const [bookingFilter, setBookingFilter] = useState("total");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAppointments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/api/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : [];

      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

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
    completed: appointments.filter((a) => a.status === "completed").length,
    today: appointments.filter((a) => a.date === today).length,
  };

  const visibleAppointments = useMemo(() => {
    let filtered = filteredAppointments;

    if (bookingFilter === "today") {
      filtered = filtered.filter((appt) => appt.date === today);
    } else if (bookingFilter !== "total") {
      filtered = filtered.filter((appt) => appt.status === bookingFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (appt) =>
          (appt.patientName && appt.patientName.toLowerCase().includes(term)) ||
          (appt.phone && appt.phone.includes(term))
      );
    }

    return filtered;
  }, [bookingFilter, filteredAppointments, today, searchTerm]);

  const displayedAppointments = [...visibleAppointments].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const filterTitle = {
    total: "Recent Bookings",
    scheduled: "Scheduled Bookings",
    cancelled: "Cancelled Bookings",
    completed: "Completed Bookings",
    today: "Today's Bookings",
  }[bookingFilter];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-blue-900 to-emerald-800 text-white shadow-xl">
        <div className="flex flex-col gap-5 p-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
              Admin Overview
            </p>
            <h1 className="mt-3 text-4xl font-bold">Dashboard Overview</h1>
            <p className="mt-3 max-w-2xl text-slate-200">
              Summary, stats, filters and recent hospital bookings with a quick
              read on today&apos;s activity.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border border-white/20 bg-white/15 px-4 py-3 font-semibold text-white placeholder-white/50 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="rounded-xl border border-white/20 bg-white/15 px-4 py-3 font-semibold text-white backdrop-blur"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept} className="text-slate-900">
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Today"
          value={stats.today}
          accent="blue"
          active={bookingFilter === "today"}
          onClick={() => setBookingFilter("today")}
        />
        <StatCard
          title="Scheduled"
          value={stats.scheduled}
          accent="green"
          active={bookingFilter === "scheduled"}
          onClick={() => setBookingFilter("scheduled")}
        />
        <StatCard
          title="Cancelled"
          value={stats.cancelled}
          accent="red"
          active={bookingFilter === "cancelled"}
          onClick={() => setBookingFilter("cancelled")}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          accent="cyan"
          active={bookingFilter === "completed"}
          onClick={() => setBookingFilter("completed")}
        />
        <StatCard
          title="Total Bookings"
          value={stats.total}
          accent="indigo"
          active={bookingFilter === "total"}
          onClick={() => setBookingFilter("total")}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl">
        <div className="border-b border-blue-100 bg-gradient-to-r from-white to-blue-50 p-6">
          <h2 className="text-2xl font-bold text-slate-950">{filterTitle}</h2>
          <p className="text-slate-500">
            {displayedAppointments.length} booking
            {displayedAppointments.length === 1 ? "" : "s"} shown
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-indigo-950 text-white">
              <tr>
                <th className="p-4 text-left">Patient</th>
                <th className="p-4 text-left">Department</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Time</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedAppointments.length > 0 ? (
                displayedAppointments.map((appt, index) => (
                  <tr
                    key={appt._id || index}
                    className="border-b border-slate-100 hover:bg-blue-50"
                  >
                    <td className="p-4">{appt.patientName || "—"}</td>
                    <td className="p-4">{appt.department}</td>
                    <td className="p-4">{appt.date}</td>
                    <td className="p-4">{appt.time}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          appt.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : appt.status === "completed"
                            ? "bg-cyan-100 text-cyan-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No bookings found for this view
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* eslint-disable react/prop-types */
function StatCard({ title, value, accent = "slate", active = false, onClick }) {
  const accentMap = {
    indigo: "from-indigo-600 to-blue-600 text-white",
    green: "from-emerald-500 to-teal-500 text-white",
    red: "from-red-500 to-rose-500 text-white",
    blue: "from-sky-500 to-cyan-500 text-white",
    cyan: "from-cyan-500 to-teal-500 text-white",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl bg-gradient-to-br ${accentMap[accent]} p-6 text-left shadow-xl transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-cyan-200 ${
        active ? "ring-4 ring-slate-900/20" : ""
      }`}
    >
      <p className="text-sm font-semibold text-white/80">{title}</p>
      <h3 className="mt-3 text-4xl font-bold">{value}</h3>
    </button>
  );
}
