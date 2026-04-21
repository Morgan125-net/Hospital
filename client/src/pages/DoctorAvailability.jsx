import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentWeekDates, getWeekDateByDay } from "../utils/weekDates";

const defaultAvailability = [
  { day: "Monday", startTime: "", endTime: "", isAvailable: true },
  { day: "Tuesday", startTime: "", endTime: "", isAvailable: true },
  { day: "Wednesday", startTime: "", endTime: "", isAvailable: true },
  { day: "Thursday", startTime: "", endTime: "", isAvailable: true },
  { day: "Friday", startTime: "", endTime: "", isAvailable: true },
  { day: "Saturday", startTime: "", endTime: "", isAvailable: false },
  { day: "Sunday", startTime: "", endTime: "", isAvailable: false },
];

export default function DoctorAvailability() {
  const navigate = useNavigate();
  const API_BASE =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost" ? "http://localhost:5000" : "");
  const token = localStorage.getItem("token");
  const weekDates = getCurrentWeekDates();
  const weekStart = weekDates[0];
  const weekEnd = weekDates[weekDates.length - 1];

  const [availability, setAvailability] = useState(defaultAvailability);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const handleAvailabilityChange = (index, field, value) => {
    const updated = [...availability];
    updated[index][field] = field === "isAvailable" ? value : value;
    setAvailability(updated);
  };

  const readJson = async (response) => {
    const contentType = response.headers.get("content-type") || "";
    return contentType.includes("application/json") ? response.json() : null;
  };

  const saveAvailability = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_BASE}/api/doctors/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ availability }),
        }
      );

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to save availability");
      }

      alert("Availability updated successfully");
    } catch (error) {
      console.error(error);
      alert(error.message || "Error updating availability");
    }
  };

  const addUnavailableDate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_BASE}/api/doctors/unavailable-dates`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ date, reason }),
        }
      );

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to add unavailable date");
      }

      alert("Unavailable date added successfully");
      setDate("");
      setReason("");
    } catch (error) {
      console.error(error);
      alert(error.message || "Error adding unavailable date");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-sky-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-950 via-blue-950 to-indigo-900 text-white shadow-xl">
          <div className="flex flex-col gap-5 p-7 md:flex-row md:items-end md:justify-between">
          <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-teal-200">
                Schedule Control
              </p>
              <h1 className="mt-3 text-4xl font-bold">
              Doctor Availability
            </h1>
              <p className="mt-3 text-slate-200">
              Set your working days and unavailable dates
            </p>
          </div>

          <button
            onClick={() => navigate("/doctor/dashboard")}
              className="rounded-xl bg-white px-5 py-3 font-semibold text-blue-950 shadow-lg hover:bg-teal-50"
          >
            Back to Dashboard
          </button>
          </div>
        </div>

        <form
          onSubmit={saveAvailability}
          className="mb-6 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-teal-100"
        >
          <div className="bg-gradient-to-r from-teal-700 to-cyan-700 p-6 text-white">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Weekly Working Hours</h2>
                <p className="mt-1 text-teal-50">
                  Choose the days and hours patients can book you.
                </p>
              </div>

              <p className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold text-teal-50 ring-1 ring-white/20">
                {weekStart.label} - {weekEnd.label}
              </p>
            </div>
          </div>

          <div className="space-y-4 p-6">
            {availability.map((slot, index) => {
              const weekDate = getWeekDateByDay(weekDates, slot.day);

              return (
                <div
                  key={slot.day}
                  className={`grid items-center gap-4 rounded-xl border p-4 md:grid-cols-4 ${
                    slot.isAvailable
                      ? "border-teal-100 bg-gradient-to-r from-teal-50 to-sky-50"
                      : "border-rose-100 bg-rose-50"
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-950">{slot.day}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {weekDate?.label}
                    </p>
                    <p
                      className={`mt-1 text-sm font-semibold ${
                        slot.isAvailable ? "text-teal-700" : "text-rose-700"
                      }`}
                    >
                      {slot.isAvailable ? "Open for bookings" : "Closed"}
                    </p>
                  </div>

                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) =>
                      handleAvailabilityChange(index, "startTime", e.target.value)
                    }
                    className="rounded-xl border border-teal-100 bg-white px-4 py-3 font-semibold text-slate-900 outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-400"
                    disabled={!slot.isAvailable}
                  />

                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) =>
                      handleAvailabilityChange(index, "endTime", e.target.value)
                    }
                    className="rounded-xl border border-teal-100 bg-white px-4 py-3 font-semibold text-slate-900 outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-400"
                    disabled={!slot.isAvailable}
                  />

                  <label className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm">
                    <input
                      type="checkbox"
                      checked={slot.isAvailable}
                      onChange={(e) =>
                        handleAvailabilityChange(
                          index,
                          "isAvailable",
                          e.target.checked
                        )
                      }
                    />
                    Available
                  </label>
                </div>
              );
            })}

          <button
            type="submit"
              className="mt-6 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg hover:from-teal-700 hover:to-blue-700"
          >
            Save Availability
          </button>
          </div>
        </form>

        <form
          onSubmit={addUnavailableDate}
          className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-rose-100"
        >
          <div className="bg-gradient-to-r from-rose-700 to-orange-600 p-6 text-white">
            <h2 className="text-2xl font-bold">
              Add Specific Unavailable Date
            </h2>
            <p className="mt-1 text-rose-50">
              Block leave days, meetings, or personal off days.
            </p>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 font-semibold outline-none focus:border-rose-500 focus:bg-white"
              required
            />

            <input
              type="text"
              placeholder="Reason, e.g. leave, meeting, off day"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 outline-none focus:border-orange-500 focus:bg-white"
            />

          <button
            type="submit"
              className="mt-6 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg hover:from-rose-700 hover:to-orange-700"
          >
            Add Unavailable Date
          </button>
          </div>
        </form>
      </div>
    </div>
  );
}
