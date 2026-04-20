import { Link, Outlet, useNavigate } from "react-router-dom";

export default function SidebarLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-rose-50 via-sky-50 to-emerald-50">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-indigo-950 via-slate-950 to-emerald-950 text-white p-6 shadow-2xl">
        <div className="mb-8 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200">
            Control Room
          </p>
          <h1 className="mt-2 text-2xl font-bold">Hospital Admin</h1>
        </div>

        <nav className="space-y-3">
          <Link
            to="/dashboard"
            className="block rounded-xl px-4 py-3 font-semibold text-slate-100 hover:bg-white/10"
          >
            Dashboard
          </Link>

          <Link
            to="/appointments"
            className="block rounded-xl px-4 py-3 font-semibold text-slate-100 hover:bg-white/10"
          >
            Appointments
          </Link>

          <Link
            to="/reports"
            className="block rounded-xl px-4 py-3 font-semibold text-slate-100 hover:bg-white/10"
          >
            Reports
          </Link>

          <Link
            to="/admin/users"
            className="block rounded-xl px-4 py-3 font-semibold text-slate-100 hover:bg-white/10"
          >
            Users
          </Link>

          <button
            onClick={handleLogout}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 text-left font-semibold text-white shadow-lg hover:from-red-700 hover:to-rose-700"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Page content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
