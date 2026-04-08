import { useEffect, useMemo, useState } from "react";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
     const response = await fetch(
  `${import.meta.env.VITE_API_URL || ""}/api/appointments`,
  {
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
     await fetch(`${import.meta.env.VITE_API_URL || ""}/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      fetchAppointments();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-200">
        <h1 className="text-4xl font-bold">Appointments Management</h1>
        <p className="text-slate-500 mt-2">
          Manage all patient appointments
        </p>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <input
            type="text"
            placeholder="Search by patient name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-xl px-4 py-3"
          />

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="border rounded-xl px-4 py-3"
          >
            {departments.map((dept) => (
              <option key={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900 text-white">
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
              <tr key={appt._id || index} className="border-b hover:bg-slate-50">
                <td className="p-4">{appt.patientName || "—"}</td>
                <td className="p-4">{appt.phone}</td>
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
                <td className="p-4">
                  <select
                    value={appt.status}
                    onChange={(e) => updateStatus(appt._id, e.target.value)}
                    className="border rounded-lg px-3 py-2"
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
