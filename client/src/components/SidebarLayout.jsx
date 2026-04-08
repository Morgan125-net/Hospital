import { Link, Outlet, useNavigate } from "react-router-dom";

export default function SidebarLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white p-6 shadow-2xl">
        <h1 className="text-2xl font-bold mb-8">Hospital Admin</h1>

        <nav className="space-y-3">
          <Link
            to="/dashboard"
            className="block rounded-xl px-4 py-3 hover:bg-slate-800"
          >
            Dashboard
          </Link>

          <Link
            to="/appointments"
            className="block rounded-xl px-4 py-3 hover:bg-slate-800"
          >
            Appointments
          </Link>

          <Link
  to="/reports"
  className="block rounded-xl px-4 py-3 hover:bg-slate-800"
>
  Reports
</Link>

          <Link
            to="/admin/users"
            className="block rounded-xl px-4 py-3 hover:bg-slate-800"
          >
            Users
          </Link>

          <button
            onClick={handleLogout}
            className="w-full text-left rounded-xl px-4 py-3 bg-red-600 hover:bg-red-700 mt-6"
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