const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URL;

  if (!mongoUri) {
    console.error("MONGO_URL is not set in environment variables");
    return;
  }

  if (mongoose.connection.readyState >= 1) {
    console.log("MongoDB already connected");
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    // Do NOT call process.exit() - let Vercel handle the error gracefully
  }
};

connectDB();

module.exports = connectDB;