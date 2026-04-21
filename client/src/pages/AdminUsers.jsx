import { useCallback, useEffect, useState } from "react";

const departments = [
  "Cardiologist",
  "Dentist",
  "Dermatologist",
  "ENT Specialist",
  "Eye Care",
  "General Doctor",
  "Gynecologist",
  "Orthopedic",
  "Pediatrician",
  "Therapist",
];

const roles = [
  { value: "admin", label: "Admin" },
  { value: "doctor", label: "Doctor" },
  { value: "staff", label: "Staff" },
];

export default function AdminUsers() {
  const API_BASE =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost" ? "http://localhost:5000" : "");
  const token = localStorage.getItem("token");
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "staff",
    department: departments[0],
    phone: "",
  });

  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const readJson = async (response) => {
    const contentType = response.headers.get("content-type") || "";
    return contentType.includes("application/json") ? response.json() : null;
  };

  const fetchAccounts = useCallback(async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [usersResponse, doctorsResponse] = await Promise.all([
        fetch(`${API_BASE}/api/auth/users`, { headers }),
        fetch(`${API_BASE}/api/doctors`, { headers }),
      ]);

      const usersData = await readJson(usersResponse);
      const doctorsData = await readJson(doctorsResponse);

      if (!usersResponse.ok || !doctorsResponse.ok) {
        throw new Error("Failed to fetch system accounts");
      }

      const users = Array.isArray(usersData)
        ? usersData.map((user) => ({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            accountType: "user",
          }))
        : [];

      const doctors = Array.isArray(doctorsData)
        ? doctorsData.map((doctor) => ({
            id: doctor._id,
            name: doctor.fullName || doctor.username || "-",
            username: doctor.username,
            email: doctor.email,
            phone: doctor.phone,
            role: "doctor",
            department: doctor.department,
            accountType: "doctor",
          }))
        : [];

      setAccounts([...users, ...doctors]);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    }
  }, [API_BASE, token]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      username: "",
      password: "",
      role: "staff",
      department: departments[0],
      phone: "",
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      const isDoctor = form.role === "doctor";
      const url = isDoctor
        ? `${API_BASE}/api/doctors`
        : `${API_BASE}/api/auth/register`;
      const payload = isDoctor
        ? {
            fullName: form.name,
            username: form.username,
            password: form.password,
            email: form.email,
            phone: form.phone,
            department: form.department,
          }
        : {
            name: form.name,
            email: form.email,
            username: form.username,
            password: form.password,
            role: form.role,
          };

      const response = await fetch(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await readJson(response);

      if (response.ok) {
        alert(
          isDoctor
            ? "Doctor account created successfully"
            : "User created successfully"
        );

        resetForm();
        fetchAccounts();
      } else {
        alert(data?.message || "Failed to create account");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  const handleDeleteAccount = async (account) => {
    const confirmed = window.confirm(
      `Delete ${account.name} from the system?`
    );

    if (!confirmed) return;

    try {
      const endpoint =
        account.accountType === "doctor"
          ? `${API_BASE}/api/doctors/${account.id}`
          : `${API_BASE}/api/auth/users/${account.id}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete account");
      }

      alert(data?.message || "Account deleted successfully");
      setSelectedAccount(null);
      fetchAccounts();
    } catch (error) {
      alert(error.message || "Server error");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!selectedAccount) return;

    try {
      const endpoint =
        selectedAccount.accountType === "doctor"
          ? `${API_BASE}/api/doctors/${selectedAccount.id}/password`
          : `${API_BASE}/api/auth/users/${selectedAccount.id}/password`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to change password");
      }

      alert(data?.message || "Password updated successfully");
      setNewPassword("");
    } catch (error) {
      alert(error.message || "Server error");
    }
  };

  const closeDetails = () => {
    setSelectedAccount(null);
    setNewPassword("");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Create user card */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-indigo-100">
        <div className="bg-gradient-to-br from-indigo-950 via-blue-900 to-emerald-800 p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
            Account Studio
          </p>
          <h1 className="mt-3 text-4xl font-bold">Create Account</h1>
          <p className="mt-3 text-slate-200">
            Admin can create staff, admin, and doctor portal accounts.
          </p>
        </div>

        <form onSubmit={handleCreateUser} className="space-y-4 p-8">
          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
            required
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 font-semibold outline-none focus:border-emerald-500 focus:bg-white"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          {form.role === "doctor" && (
            <>
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 outline-none focus:border-blue-500 focus:bg-white"
              />

              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 font-semibold outline-none focus:border-blue-500 focus:bg-white"
              >
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-indigo-700 to-emerald-600 py-3 font-semibold text-white shadow-lg hover:from-indigo-800 hover:to-emerald-700"
          >
            {form.role === "doctor" ? "Create Doctor" : "Create User"}
          </button>
        </form>
      </div>

      {/* Users table */}
      <div className="overflow-auto rounded-2xl bg-white shadow-xl ring-1 ring-emerald-100">
        <div className="bg-gradient-to-r from-emerald-700 to-cyan-700 p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-100">
            Directory
          </p>
          <h1 className="mt-3 text-4xl font-bold">System Accounts</h1>
        </div>

        <table className="w-full min-w-[420px]">
          <thead className="bg-emerald-50">
            <tr className="text-left text-emerald-900">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Role</th>
            </tr>
          </thead>

          <tbody>
            {accounts.length > 0 ? (
              accounts.map((account) => (
                <tr
                  key={account.id}
                  onClick={() => setSelectedAccount(account)}
                  className="cursor-pointer border-b border-slate-100 hover:bg-cyan-50"
                >
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {account.name}
                  </td>
                  <td className="px-6 py-4 capitalize text-slate-600">
                    {account.role || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-6 py-10 text-center text-slate-400">
                  No accounts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-700 to-cyan-700 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-emerald-100">
                    Account Details
                  </p>
                  <h2 className="mt-2 text-3xl font-bold">
                    {selectedAccount.name}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeDetails}
                  className="rounded-lg bg-white/15 px-3 py-2 font-bold text-white hover:bg-white/25"
                >
                  X
                </button>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid gap-3 rounded-xl bg-slate-50 p-4">
                <div className="flex justify-between gap-4">
                  <span className="text-sm font-semibold text-slate-500">
                    Role
                  </span>
                  <span className="capitalize text-slate-900">
                    {selectedAccount.role}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm font-semibold text-slate-500">
                    Department
                  </span>
                  <span className="text-slate-900">
                    {selectedAccount.department || "-"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm font-semibold text-slate-500">
                    Username
                  </span>
                  <span className="text-slate-900">
                    {selectedAccount.username || "-"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm font-semibold text-slate-500">
                    Email
                  </span>
                  <span className="text-right text-slate-900">
                    {selectedAccount.email || "-"}
                  </span>
                </div>

                {selectedAccount.phone && (
                  <div className="flex justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-500">
                      Phone
                    </span>
                    <span className="text-slate-900">
                      {selectedAccount.phone}
                    </span>
                  </div>
                )}
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Change Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
                  required
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-700 to-blue-700 py-3 font-semibold text-white shadow hover:from-indigo-800 hover:to-blue-800"
                >
                  Update Password
                </button>
              </form>

              <button
                type="button"
                onClick={() => handleDeleteAccount(selectedAccount)}
                className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 font-semibold text-white shadow hover:from-red-700 hover:to-rose-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
