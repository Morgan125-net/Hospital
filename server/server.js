require("dotenv").config();
const connectDB = require("./config/db");
require("./jobs/reminder.job");

const app = require("./app");
const cors = require("cors");

const PORT = process.env.PORT || 5000;

// ✅ CORS for local + live frontend
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://hospital-six-smoky.vercel.app",
    ],
    credentials: true,
  })
);

// ✅ Connect MongoDB first
connectDB();

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});