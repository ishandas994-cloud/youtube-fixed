require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

// ===== CORS - manually set headers on EVERY response =====
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===== DATABASE =====
require("./Connection/conn");

// ===== ROUTES =====
const userRoutes     = require("./Routes/user");
const videoRoutes    = require("./Routes/video");
const commentRoutes  = require("./Routes/comment");
const historyRoutes  = require("./Routes/history");
const watchLaterRoutes = require("./Routes/watchLater");

app.use("/api/user",      userRoutes);
app.use("/api/video",     videoRoutes);
app.use("/api/comment",   commentRoutes);
app.use("/api/history",   historyRoutes);
app.use("/api/watchlater", watchLaterRoutes);

// ===== HOME =====
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Backend running 🚀" });
});

// ===== 404 =====
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ===== ERROR =====
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.message);
  res.status(500).json({ success: false, message: err.message });
});

// ===== LOCAL ONLY =====
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log("Server running on port " + PORT));
}

module.exports = app;