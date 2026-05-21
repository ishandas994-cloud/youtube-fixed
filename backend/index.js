require("dotenv").config();
const express    = require("express");
const cookieParser = require("cookie-parser");
const mongoose   = require("mongoose");

const app = express();

// ===== CORS =====
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===== DATABASE =====
require("./Connection/conn");

// ===== DB READY CHECK =====
app.use("/api", async (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  let attempts = 0;
  const wait = setInterval(() => {
    attempts++;
    if (mongoose.connection.readyState === 1) { clearInterval(wait); return next(); }
    if (attempts >= 10) { clearInterval(wait); return res.status(503).json({ success: false, message: "Database not ready" }); }
  }, 500);
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
app.use((err, req, res, next) => res.status(500).json({ success: false, message: err.message }));

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log("Server on port " + PORT));
}

module.exports = app;