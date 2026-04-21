import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginRequest = async (endpoint) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : { message: "Backend returned a non-JSON response. Check VITE_API_URL." };

    return { response, data };
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      let { response, data } = await loginRequest("/api/auth/login");

      if (!response.ok) {
        const doctorLogin = await loginRequest("/api/auth/doctor-login");
        response = doctorLogin.response;
        data = doctorLogin.data;
      }

      if (response.ok) {
        localStorage.setItem("token", data.token);

        const payload = JSON.parse(atob(data.token.split(".")[1]));
        const role = String(payload.role).toLowerCase().trim();

        if (role === "admin") {
          navigate("/dashboard");
        } else if (role === "doctor") {
          navigate("/doctor/dashboard");
        } else {
          navigate("/staff/dashboard");
        }
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Server error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-2xl p-8 border border-indigo-100">
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-t-2xl mb-6"></div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Login</h1>
        <p className="text-slate-500 mb-6">
          Hospital dashboard
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 pr-20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl py-3 font-semibold hover:from-indigo-700 hover:to-blue-700 transition"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}
