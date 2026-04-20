import { useCallback, useEffect, useMemo, useState } from "react";

export default function Appointments() {
  const API_BASE =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost" ? "http://localhost:5000" : "");
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");

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
      console.error(error);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const departments = useMemo(() => {
    const unique = [...new Set(appointments.map((a) => a.department).filter(Boolean))];
    return ["All", ...unique];
  }, [appointments]);

  const filtered = useMemo(() => {
    return appointments.filter((appt) => {
      const matchesName = (appt.patientName || "")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesDept = department === "All" || appt.department === department;
      return matchesName && matchesDept;
    });
  }, [appointments, search, department]);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      fetchAppointments();
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-900 via-blue-900 to-emerald-800 text-white shadow-xl">
        <div className="p-7">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-200">
            Patient Flow
          </p>
          <h1 className="mt-3 text-4xl font-bold">Appointments Management</h1>
          <p className="mt-3 text-slate-200">
            Manage all patient appointments with quick filters and status updates.
          </p>
        </div>

        <div className="grid gap-4 bg-white/10 p-5 md:grid-cols-2">
          <input
            type="text"
            placeholder="Search by patient name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-white/20 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-300"
          />

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="rounded-xl border border-white/20 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-300"
          >
            {departments.map((dept) => (
              <option key={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-xl">
        <table className="w-full min-w-[900px]">
          <thead className="bg-cyan-950 text-white">
            <tr>
              <th className="p-4 text-left">Patient</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Department</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Time</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Quick Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((appt, index) => (
              <tr key={appt._id || index} className="border-b border-slate-100 hover:bg-cyan-50">
                <td className="p-4 font-semibold text-slate-900">{appt.patientName || "—"}</td>
                <td className="p-4">{appt.phone}</td>
                <td className="p-4">{appt.department}</td>
                <td className="p-4">{appt.date}</td>
                <td className="p-4">{appt.time}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      appt.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : appt.status === "completed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {appt.status}
                  </span>
                </td>
                <td className="p-4">
                  <select
                    value={appt.status}
                    onChange={(e) => updateStatus(appt._id, e.target.value)}
                    className="rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2 font-semibold text-cyan-900"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
