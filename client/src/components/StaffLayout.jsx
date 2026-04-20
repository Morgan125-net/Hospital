import { Link, Outlet, useNavigate } from "react-router-dom";

export default function StaffLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-cyan-50 via-emerald-50 to-amber-50">
      <aside className="w-72 bg-gradient-to-b from-cyan-950 via-blue-950 to-emerald-950 text-white p-6 shadow-2xl">
        <div className="mb-8 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">
            Front Desk
          </p>
          <h1 className="mt-2 text-2xl font-bold">Staff Portal</h1>
        </div>

        <nav className="space-y-3">
          <Link
            to="/staff/dashboard"
            className="block rounded-xl px-4 py-3 font-semibold text-slate-100 hover:bg-white/10"
          >
            Dashboard
          </Link>

          <Link
            to="/staff/appointments"
            className="block rounded-xl px-4 py-3 font-semibold text-slate-100 hover:bg-white/10"
          >
            Appointments
          </Link>

          <button
            onClick={handleLogout}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 text-left font-semibold text-white shadow-lg hover:from-red-700 hover:to-rose-700"
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
