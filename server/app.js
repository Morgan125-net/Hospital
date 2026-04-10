const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const doctorRoutes = require('./routes/doctor.routes');

const app = express();

const explicitAllowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://hospital-six-smoky.vercel.app',
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (explicitAllowedOrigins.includes(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Origin not allowed'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.options(/.*/, cors());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);

// health check
app.get('/', (req, res) => {
  res.json({ status: 'Hospital Appointment API running' });
});

app.use((err, req, res, next) => {
  if (err?.message === 'CORS policy: Origin not allowed') {
    return res.status(403).json({ message: err.message });
  }

  return next(err);
});

module.exports = app;
