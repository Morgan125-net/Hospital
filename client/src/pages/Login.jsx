import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MedicalIllustration() {
  return (
    <svg
      viewBox="0 0 560 420"
      className="w-full max-w-xl"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heroBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
        <linearGradient id="scrub" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="coat" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>

      <rect x="28" y="40" width="504" height="320" rx="36" fill="url(#heroBg)" />
      <circle cx="92" cy="106" r="18" fill="#bfdbfe" />
      <circle cx="476" cy="88" r="14" fill="#93c5fd" />
      <circle cx="450" cy="314" r="22" fill="#bae6fd" />

      <rect x="68" y="114" width="118" height="144" rx="22" fill="#ffffff" opacity="0.88" />
      <rect x="92" y="142" width="70" height="12" rx="6" fill="#cbd5e1" />
      <rect x="92" y="170" width="48" height="48" rx="14" fill="#dbeafe" />
      <path d="M116 181h8v12h12v8h-12v12h-8v-12h-12v-8h12z" fill="#2563eb" />
      <rect x="92" y="230" width="70" height="10" rx="5" fill="#e2e8f0" />

      <circle cx="302" cy="154" r="58" fill="#f8d4c0" />
      <path d="M248 153c8-37 31-57 57-57 31 0 51 20 57 47-12-9-30-14-48-14-25 0-47 10-66 24z" fill="#0f172a" />
      <rect x="244" y="216" width="116" height="112" rx="32" fill="url(#coat)" />
      <path d="M282 214h42l18 33-39 33-39-33z" fill="url(#scrub)" />
      <rect x="230" y="230" width="38" height="100" rx="18" fill="url(#coat)" />
      <rect x="336" y="230" width="38" height="100" rx="18" fill="url(#coat)" />
      <path d="M284 245c8 16 15 28 19 37 4-9 11-21 19-37" fill="none" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
      <circle cx="302" cy="188" r="8" fill="#0f172a" />
      <path d="M286 202c10 10 22 10 32 0" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
      <path d="M382 148h44" stroke="#0ea5e9" strokeWidth="10" strokeLinecap="round" />
      <path d="M404 126v44" stroke="#0ea5e9" strokeWidth="10" strokeLinecap="round" />

      <rect x="398" y="204" width="92" height="72" rx="24" fill="#ffffff" opacity="0.92" />
      <circle cx="434" cy="240" r="16" fill="#dcfce7" />
      <path d="M434 232v16M426 240h16" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" />
      <rect x="456" y="232" width="18" height="8" rx="4" fill="#94a3b8" />
      <rect x="420" y="262" width="54" height="8" rx="4" fill="#cbd5e1" />
    </svg>
  );
}

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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.35),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_32%),linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_46%,_#f4f7fb_100%)]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-10 top-16 h-40 w-40 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute right-12 top-24 h-52 w-52 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-44 w-44 rounded-full bg-sky-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="order-2 lg:order-1">
            <div className="mx-auto max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-4 py-2 text-sm font-medium text-sky-700 shadow-sm backdrop-blur">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Trusted hospital access
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Welcome back to your hospital workspace
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Manage appointments, care teams, and daily operations from one
                secure dashboard designed for smooth hospital workflows.
              </p>

              <div className="mt-8">
                <MedicalIllustration />
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-lg shadow-sky-100/50 backdrop-blur">
                  <p className="text-sm font-semibold text-slate-900">Doctors</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Fast access to schedules and patient flow
                  </p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-lg shadow-sky-100/50 backdrop-blur">
                  <p className="text-sm font-semibold text-slate-900">Patients</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Cleaner booking and check-in management
                  </p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-lg shadow-sky-100/50 backdrop-blur">
                  <p className="text-sm font-semibold text-slate-900">Support</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Reliable tools for front desk teams
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-md">
              <div className="absolute -left-6 top-12 hidden rounded-2xl border border-cyan-100 bg-white/80 px-4 py-3 shadow-lg backdrop-blur sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                  Secure
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Encrypted hospital login
                </p>
              </div>
              <div className="absolute -right-6 bottom-14 hidden rounded-2xl border border-blue-100 bg-white/80 px-4 py-3 shadow-lg backdrop-blur sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  Care
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Staff and doctor access
                </p>
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_30px_90px_-35px_rgba(14,116,144,0.45)] backdrop-blur xl:p-9">
                <div className="mb-6 h-2 w-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600" />

                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">
                  Hospital Portal
                </p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">Login</h2>
                <p className="mt-2 text-slate-500">
                  Sign in to continue to the hospital dashboard.
                </p>

                <form onSubmit={handleLogin} className="mt-8 space-y-4">
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                    required
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3.5 pr-20 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-sky-700 hover:text-sky-900"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 py-3.5 font-semibold tracking-wide text-white shadow-lg shadow-sky-300/40 transition hover:from-cyan-700 hover:via-sky-700 hover:to-blue-800"
                  >
                    LOGIN
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
