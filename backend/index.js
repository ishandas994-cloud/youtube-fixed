require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// ================= DATABASE =================

require("./Connection/conn");

// ================= CORS OPTIONS =================

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://youtube-frontend-eight.vercel.app",
      "https://youtube-wwj2.vercel.app",
      "https://nonqualitative-preposterously-anaya.ngrok-free.dev",
    ];

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS Not Allowed"));
  },
  credentials: true,
};

// Apply CORS to all routes (handles preflight automatically)
app.use(cors(corsOptions));

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

// ================= STATIC =================

app.use(
  "/videos",
  express.static(path.join(__dirname, "videos"))
);

// ================= API ROUTES =================

app.use("/api/user", userRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/watchlater", watchLaterRoutes);

// ================= HOME =================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend running successfully 🚀",
  });
});

// ================= 404 =================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ================= LOCAL SERVER =================

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
  });
}

module.exports = app;
