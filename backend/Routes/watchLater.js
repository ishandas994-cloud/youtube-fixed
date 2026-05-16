const express = require("express");

const router = express.Router();

const auth = require("../Connection/middleware/authentication");

const {
  addToWatchLater,
  getWatchLater,
  removeWatchLater,
} = require("../Controllers/watchLater");

router.post("/add", auth, addToWatchLater);

router.get("/get", auth, getWatchLater);

router.delete(
  "/remove/:id",
  auth,
  removeWatchLater
);

module.exports = router;