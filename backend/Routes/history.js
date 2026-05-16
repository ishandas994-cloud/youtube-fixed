const express = require("express");

const router = express.Router();

const auth = require("../Connection/middleware/authentication");

const {
  addToHistory,
  getHistory,
} = require("../Controllers/history");

// Add video to history
router.post("/add", auth, addToHistory);

// Get history
router.get("/get", auth, getHistory);

module.exports = router;