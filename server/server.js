require('dotenv').config();
const connectDB = require('./config/db');
require("./jobs/reminder.job");
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});