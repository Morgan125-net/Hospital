import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentWeekDates, getWeekDateByDay } from "../utils/weekDates";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const API_BASE =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost" ? "http://localhost:5000" : "");
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState("scheduled");
  const [updatingId, setUpdatingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/doctors/dashboard`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load doctor dashboard");
      }

      setDoctor(data.doctor);
      setAppointments(data.appointments || []);
      setTotalAppointments(data.totalAppointments || 0);
    } catch (error) {
      console.error(error);
      alert(error.message || "Error loading dashboard");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const markCompleted = async (appointmentId) => {
    try {
      setUpdatingId(appointmentId);
      const response = await fetch(
        `${API_BASE}/api/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "completed" }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Failed to update appointment");
      }

      await fetchDashboard();
    } catch (error) {
      alert(error.message || "Unable to mark appointment as completed");
    } finally {
      setUpdatingId("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-700 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-red-600 text-lg">Doctor data not found.</p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const todaysAppointments = appointments.filter((appt) => appt.date === today);
  const scheduledAppointments = appointments.filter(
    (appt) => appt.status === "scheduled"
  );
  const cancelledAppointments = appointments.filter(
    (appt) => appt.status === "cancelled"
  );
  const completedAppointments = appointments.filter(
    (appt) => appt.status === "completed"
  );
  const visibleAppointments = appointments.filter((appt) => {
    let matches = true;

    if (bookingFilter === "today") {
      matches = appt.date === today;
    } else if (bookingFilter !== "total") {
      matches = appt.status === bookingFilter;
    }

    if (matches && searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      matches =
        (appt.patientName && appt.patientName.toLowerCase().includes(term)) ||
        (appt.phone && appt.phone.includes(term));
    }

    return matches;
  });
  const activeAvailability = (doctor.availability || []).filter(
    (slot) => slot.isAvailable
  ).length;
  const weekDates = getCurrentWeekDates();
  const weekStart = weekDates[0];
  const weekEnd = weekDates[weekDates.length - 1];

  const statusClass = (status) => {
    if (status === "cancelled") return "bg-red-50 text-red-700 ring-red-100";
    if (status === "completed") return "bg-cyan-50 text-cyan-700 ring-cyan-100";
    if (status === "confirmed") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    return "bg-amber-50 text-amber-700 ring-amber-100";
  };

  const tableTitle = {
    total: "All Bookings",
    today: "Today's Bookings",
    scheduled: "Scheduled Bookings",
    cancelled: "Cancelled Bookings",
    completed: "Completed Bookings",
  }[bookingFilter];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-fuchsia-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        <section className="mb-6 overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl">
          <div className="grid gap-6 bg-gradient-to-br from-indigo-950 via-teal-800 to-amber-500 p-7 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-teal-200">
                Doctor Portal
              </p>
              <h1 className="mt-3 text-4xl font-bold">
                Welcome, Dr. {doctor.fullName}
              </h1>
              <p className="mt-3 max-w-2xl text-slate-200">
                Your appointments, weekly availability, and patient schedule in
                one focused workspace.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-slate-200">Department</p>
              <p className="text-3xl font-bold">{doctor.department}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/doctor/availability")}
                  className="rounded-lg bg-amber-300 px-4 py-2 font-semibold text-slate-950 shadow-md hover:bg-amber-200"
                >
                  Manage Availability
                </button>

                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-white/15 px-4 py-2 font-semibold text-white ring-1 ring-white/25 hover:bg-white/25"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 mb-6">
          <DoctorStatCard
            title="Today"
            value={todaysAppointments.length}
            tone="teal"
            active={bookingFilter === "today"}
            onClick={() => setBookingFilter("today")}
          />
          <DoctorStatCard
            title="Scheduled"
            value={scheduledAppointments.length}
            tone="amber"
            active={bookingFilter === "scheduled"}
            onClick={() => setBookingFilter("scheduled")}
          />
          <DoctorStatCard
            title="Cancelled"
            value={cancelledAppointments.length}
            tone="red"
            active={bookingFilter === "cancelled"}
            onClick={() => setBookingFilter("cancelled")}
          />
          <DoctorStatCard
            title="Completed"
            value={completedAppointments.length}
            tone="cyan"
            active={bookingFilter === "completed"}
            onClick={() => setBookingFilter("completed")}
          />
          <DoctorStatCard
            title="Total Bookings"
            value={totalAppointments}
            tone="slate"
            active={bookingFilter === "total"}
            onClick={() => setBookingFilter("total")}
          />
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-xl">
          <div className="border-b border-teal-100 bg-gradient-to-r from-teal-50 via-white to-amber-50 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-950">
              {tableTitle}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {visibleAppointments.length} booking
              {visibleAppointments.length === 1 ? "" : "s"} assigned to your
              schedule
            </p>
            <input
              type="text"
              placeholder="Search by patient name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-4 w-full rounded-lg border border-teal-100 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          {visibleAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gradient-to-r from-teal-700 to-indigo-700 text-left text-sm text-white">
                  <tr>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {visibleAppointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-amber-50/70">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {appt.patientName}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{appt.department}</td>
                      <td className="px-6 py-4 text-slate-600">{appt.date}</td>
                      <td className="px-6 py-4 text-slate-600">{appt.time}</td>
                      <td className="px-6 py-4 text-slate-600">{appt.phone}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold capitalize ring-1 ${statusClass(
                            appt.status
                          )}`}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {appt.status === "completed" ? (
                          <span className="text-sm font-semibold text-slate-400">
                            Completed
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => markCompleted(appt._id)}
                            disabled={
                              updatingId === appt._id ||
                              appt.status === "cancelled"
                            }
                            className="rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:from-teal-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
                          >
                            {updatingId === appt._id ? "Saving..." : "Mark completed"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-6 text-slate-500">No appointments found.</p>
          )}
        </div>

        <div className="mb-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-600 via-cyan-600 to-emerald-500 p-5 text-white shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-50">
            Active Work Days
          </p>
          <h2 className="mt-3 text-4xl font-bold">{activeAvailability}</h2>
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-xl">
          <div className="border-b border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-lime-50 px-6 py-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Weekly Availability
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your working windows for {weekStart.label} - {weekEnd.label}
                </p>
              </div>
              <span className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
                Current week
              </span>
            </div>
          </div>

          {doctor.availability && doctor.availability.length > 0 ? (
            <div className="grid gap-4 p-6 md:grid-cols-2">
              {doctor.availability.map((slot, index) => {
                const weekDate = getWeekDateByDay(weekDates, slot.day);

                return (
                  <div
                    key={index}
                    className={`rounded-xl border p-4 shadow-sm ${
                      slot.isAvailable
                        ? "border-emerald-100 bg-gradient-to-br from-emerald-50 to-cyan-50"
                        : "border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {slot.day}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {weekDate?.label}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          slot.isAvailable
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {slot.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold text-slate-700">
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="p-6 text-slate-500">No availability set yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* eslint-disable react/prop-types */
function DoctorStatCard({ title, value, tone, active, onClick }) {
  const toneMap = {
    teal: "border-teal-100 bg-gradient-to-br from-teal-500 to-cyan-500 text-white",
    amber: "border-amber-100 bg-gradient-to-br from-amber-400 to-orange-500 text-white",
    red: "border-red-100 bg-gradient-to-br from-rose-500 to-red-600 text-white",
    cyan: "border-cyan-100 bg-gradient-to-br from-cyan-500 to-blue-600 text-white",
    slate: "border-indigo-100 bg-gradient-to-br from-indigo-600 to-violet-600 text-white",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-5 text-left shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-amber-200 ${toneMap[tone]} ${
        active ? "ring-4 ring-amber-200" : ""
      }`}
    >
      <p className="text-sm font-medium opacity-80">{title}</p>
      <h2 className="mt-3 text-4xl font-bold">{value}</h2>
    </button>
  );
}
