const mongoose = require("mongoose");

mongoose.set("bufferCommands", false);
mongoose.set("strictQuery", false);

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log("MongoDB already connected");
    return;
  }

  const mongoUri = process.env.MONGO_URL;
  if (!mongoUri) {
    console.error("MONGO_URL is not set");
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
    });
    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
};

module.exports = connectDB;