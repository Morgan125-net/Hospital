import { useCallback, useMemo, useState } from "react";

export default function Reports() {
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");
  const [range, setRange] = useState("today");

  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");

  const isInRange = useCallback((dateStr) => {
    const today = new Date();
    const appointmentDate = new Date(dateStr);
    const diffDays =
      (today.setHours(0, 0, 0, 0) - appointmentDate.setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24);

    if (range === "today") return diffDays === 0;
    if (range === "weekly") return diffDays >= 0 && diffDays < 7;
    if (range === "monthly") return diffDays >= 0 && diffDays < 30;

    return true;
  }, [range]);

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const deptOk = department === "All" || a.department === department;
      const statusOk = status === "All" || a.status === status;
      return isInRange(a.date) && deptOk && statusOk;
    });
  }, [appointments, department, status, isInRange]);

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
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-violet-900 to-rose-800 text-white shadow-xl">
        <div className="flex flex-col gap-5 p-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-rose-200">
              Insights
            </p>
            <h1 className="mt-3 text-4xl font-bold">Hospital Reports</h1>
            <p className="mt-3 text-slate-200">
              Export daily, weekly, or monthly appointments
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="rounded-xl bg-white px-6 py-3 font-semibold text-indigo-950 shadow-lg hover:bg-rose-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 font-semibold text-indigo-950 outline-none focus:border-indigo-500"
        >
          <option value="today">Today</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 font-semibold text-rose-950 outline-none focus:border-rose-500"
        >
          {departments.map((dept) => (
            <option key={dept}>{dept}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 font-semibold text-emerald-950 outline-none focus:border-emerald-500"
        >
          <option>All</option>
          <option>scheduled</option>
          <option>cancelled</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-xl">
        <table className="w-full min-w-[700px]">
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
            {filtered.map((a, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-indigo-50">
                <td className="p-4 font-semibold text-slate-900">{a.patientName}</td>
                <td className="p-4">{a.department}</td>
                <td className="p-4">{a.date}</td>
                <td className="p-4">{a.time}</td>
                <td className="p-4">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                    {a.status}
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
