import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "staff",
  });

  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/auth/users`
);
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("User created successfully");

        setForm({
          name: "",
          email: "",
          username: "",
          password: "",
          role: "staff",
        });

        fetchUsers();
      } else {
        alert(data.message || "Failed to create user");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Create user card */}
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Create Staff Account
        </h1>
        <p className="text-slate-500 mb-8">
          Admin can create receptionist and hospital staff accounts.
        </p>

        <form onSubmit={handleCreateUser} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
            required
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white rounded-xl py-3 font-semibold hover:bg-slate-800"
          >
            Create User
          </button>
        </form>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-3xl shadow-xl p-8 overflow-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">
          System Users
        </h1>

        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-slate-700">
              <th className="pb-4">Name</th>
              <th className="pb-4">Username</th>
              <th className="pb-4">Email</th>
              <th className="pb-4">Role</th>
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="py-4">{user.name}</td>
                  <td className="py-4">{user.username}</td>
                  <td className="py-4">{user.email}</td>
                  <td className="py-4 capitalize">{user.role}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}