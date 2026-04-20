const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const doctorRoutes = require("./routes/doctor.routes");

const app = express();

const explicitAllowedOrigins = [
  process.env.CORS_ORIGIN,
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "https://hospital-six-smoky.vercel.app",
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (explicitAllowedOrigins.includes(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: Origin not allowed"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);

// health check
app.get("/", (req, res) => {
  res.json({ status: "Hospital Appointment API running" });
});

// error handler
app.use((err, req, res, next) => {
  if (err?.message === "CORS policy: Origin not allowed") {
    return res.status(403).json({ message: err.message });
  }

  return res.status(500).json({
    message: err.message || "Internal server error",
  });
});

module.exports = app;