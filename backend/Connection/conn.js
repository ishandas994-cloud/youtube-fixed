const mongoose = require("mongoose");

mongoose.set("bufferCommands", false);

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  const mongoUri = process.env.MONGO_URL;
  if (!mongoUri) {
    console.error("MONGO_URL is not set");
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
};

connectDB();
module.exports = connectDB;