import { useEffect, useState } from "react";

export default function StaffDashboard() {
  const API_BASE =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost" ? "http://localhost:5000" : "");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingFilter, setBookingFilter] = useState("total");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
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
          : null;

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load appointments");
        }

        setAppointments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setError(error.message || "Unable to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [API_BASE]);

  const total = appointments.length;
  const today = new Date().toISOString().split("T")[0];
  const todaysBookings = appointments.filter((a) => a.date === today).length;
  const scheduled = appointments.filter(
    (a) => a.status === "scheduled"
  ).length;
  const cancelled = appointments.filter(
    (a) => a.status === "cancelled"
  ).length;
  const completed = appointments.filter(
    (a) => a.status === "completed"
  ).length;
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
  const latestAppointments = visibleAppointments;
  const filterTitle = {
    total: "Latest Appointments",
    today: "Today's Bookings",
    scheduled: "Scheduled Bookings",
    cancelled: "Cancelled Bookings",
    completed: "Completed Bookings",
  }[bookingFilter];

  const statusClass = (status) => {
    if (status === "cancelled") return "bg-red-50 text-red-700 ring-red-100";
    if (status === "completed") return "bg-cyan-50 text-cyan-700 ring-cyan-100";
    if (status === "confirmed") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    return "bg-amber-50 text-amber-700 ring-amber-100";
  };

  return (
    <div>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl">
          <div className="grid gap-6 bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-900 p-7 md:grid-cols-[1.4fr_0.8fr] md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
                Staff Portal
              </p>
              <h1 className="mt-3 text-4xl font-bold">Reception Command Center</h1>
              <p className="mt-3 max-w-2xl text-slate-200">
                Track bookings, spot urgent schedule changes, and keep patient
                flow tidy from one clean view.
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-slate-200">Today&apos;s pulse</p>
              <p className="mt-2 text-4xl font-bold">{total}</p>
              <p className="mt-1 text-sm text-emerald-100">appointments in the system</p>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StaffStatCard
            title="Today"
            value={todaysBookings}
            accent="from-sky-500 to-cyan-500"
            active={bookingFilter === "today"}
            onClick={() => setBookingFilter("today")}
          />
          <StaffStatCard
            title="Scheduled"
            value={scheduled}
            accent="from-emerald-500 to-teal-500"
            active={bookingFilter === "scheduled"}
            onClick={() => setBookingFilter("scheduled")}
          />
          <StaffStatCard
            title="Cancelled"
            value={cancelled}
            accent="from-red-500 to-rose-500"
            active={bookingFilter === "cancelled"}
            onClick={() => setBookingFilter("cancelled")}
          />
          <StaffStatCard
            title="Completed"
            value={completed}
            accent="from-cyan-600 to-blue-600"
            active={bookingFilter === "completed"}
            onClick={() => setBookingFilter("completed")}
          />
          <StaffStatCard
            title="Total Bookings"
            value={total}
            accent="from-indigo-600 to-blue-600"
            active={bookingFilter === "total"}
            onClick={() => setBookingFilter("total")}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-cyan-100 bg-gradient-to-r from-white to-cyan-50 px-6 py-5">
            <div>
              <h2 className="text-xl font-bold text-slate-950">{filterTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Patient bookings for the selected card
              </p>
            </div>
            <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-semibold text-cyan-800">
              {loading ? "Loading" : `${latestAppointments.length} shown`}
            </span>
          </div>

          <div className="border-b border-cyan-100 px-6 py-4">
            <input
              type="text"
              placeholder="Search by patient name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-cyan-950 text-left text-sm text-white">
                <tr>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestAppointments.length > 0 ? (
                  latestAppointments.map((appt, index) => (
                    <tr key={appt._id || index} className="hover:bg-cyan-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {appt.patientName}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{appt.department}</td>
                      <td className="px-6 py-4 text-slate-600">{appt.date}</td>
                      <td className="px-6 py-4 text-slate-600">{appt.time}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold capitalize ring-1 ${statusClass(
                            appt.status
                          )}`}
                        >
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                      {loading ? "Loading appointments..." : "No appointments found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* eslint-disable react/prop-types */
function StaffStatCard({ title, value, accent, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl bg-gradient-to-br ${accent} p-5 text-left text-white shadow-xl transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-cyan-200 ${
        active ? "ring-4 ring-slate-900/20" : ""
      }`}
    >
      <p className="text-sm font-semibold text-white/80">{title}</p>
      <h2 className="mt-3 text-4xl font-bold">{value}</h2>
    </button>
  );
}
