import { useMemo, useState } from "react";

export default function Reports() {
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");
  const [range, setRange] = useState("today");

  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");

  const today = new Date();

  const isInRange = (dateStr) => {
    const appointmentDate = new Date(dateStr);
    const diffDays =
      (today.setHours(0, 0, 0, 0) - appointmentDate.setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24);

    if (range === "today") return diffDays === 0;
    if (range === "weekly") return diffDays >= 0 && diffDays < 7;
    if (range === "monthly") return diffDays >= 0 && diffDays < 30;

    return true;
  };

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const deptOk = department === "All" || a.department === department;
      const statusOk = status === "All" || a.status === status;
      return isInRange(a.date) && deptOk && statusOk;
    });
  }, [appointments, department, status, range]);

  const exportCSV = () => {
    const headers = ["Patient", "Department", "Date", "Time", "Status"];
    const rows = filtered.map((a) => [
      a.patientName,
      a.department,
      a.date,
      a.time,
      a.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${range}-report.csv`;
    link.click();
  };

  const departments = [
    "All",
    ...new Set(appointments.map((a) => a.department).filter(Boolean)),
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Hospital Reports</h1>
            <p className="text-slate-500 mt-2">
              Export daily, weekly, or monthly appointments
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border rounded-xl px-4 py-3"
        >
          <option value="today">Today</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="border rounded-xl px-4 py-3"
        >
          {departments.map((dept) => (
            <option key={dept}>{dept}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-xl px-4 py-3"
        >
          <option>All</option>
          <option>scheduled</option>
          <option>cancelled</option>
        </select>
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
            {filtered.map((a, i) => (
              <tr key={i} className="border-b">
                <td className="p-4">{a.patientName}</td>
                <td className="p-4">{a.department}</td>
                <td className="p-4">{a.date}</td>
                <td className="p-4">{a.time}</td>
                <td className="p-4">{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}