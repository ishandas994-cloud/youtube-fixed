require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// ================= DATABASE =================
require("./Connection/conn");

// ================= CORS =================
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    // Allow localhost and any vercel.app subdomain
    if (
      origin.startsWith("http://localhost") ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }
    return callback(new Error("CORS blocked: " + origin));
  },
  credentials: true,
}));

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ================= ROUTES =================
const userRoutes = require("./Routes/user");
const videoRoutes = require("./Routes/video");
const commentRoutes = require("./Routes/comment");
const historyRoutes = require("./Routes/history");
const watchLaterRoutes = require("./Routes/watchLater");

app.use("/api/user", userRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/watchlater", watchLaterRoutes);

// ================= HOME =================
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Backend running 🚀" });
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ================= ERROR =================
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(500).json({ success: false, message: err.message });
});

// ================= START =================
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

module.exports = app;
