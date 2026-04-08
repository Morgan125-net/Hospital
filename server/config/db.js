const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI environment variable is not set');
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    // Don't exit process on deployment, just log the error
    if (process.env.NODE_ENV === 'production') {
      console.error('Continuing without database connection...');
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;