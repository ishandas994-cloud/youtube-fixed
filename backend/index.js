require("dotenv").config();
const express     = require("express");
const cookieParser = require("cookie-parser");
const mongoose    = require("mongoose");
const connectDB   = require("./Connection/conn");

const app = express();

// ===== CORS =====
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===== CONNECT DB ON EVERY REQUEST (Vercel serverless needs this) =====
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ===== ROUTES =====
app.use("/api/user",         require("./Routes/user"));
app.use("/api/video",        require("./Routes/video"));
app.use("/api/comment",      require("./Routes/comment"));
app.use("/api/history",      require("./Routes/history"));
app.use("/api/watchlater",   require("./Routes/watchLater"));
app.use("/api/notification", require("./Routes/notification"));

// ===== HOME =====
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend running 🚀",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(500).json({ success: false, message: err.message });
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log("Server on port " + PORT));
}

module.exports = app;