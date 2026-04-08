import { Link, Outlet, useNavigate } from "react-router-dom";

export default function StaffLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-72 bg-blue-950 text-white p-6 shadow-2xl">
        <h1 className="text-2xl font-bold mb-8">Staff Portal</h1>

        <nav className="space-y-3">
          <Link
            to="/staff/dashboard"
            className="block rounded-xl px-4 py-3 hover:bg-blue-900"
          >
            Dashboard
          </Link>

          <Link
            to="/staff/appointments"
            className="block rounded-xl px-4 py-3 hover:bg-blue-900"
          >
            Appointments
          </Link>

          <button
            onClick={handleLogout}
            className="w-full text-left rounded-xl px-4 py-3 bg-red-600 hover:bg-red-700 mt-6"
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
