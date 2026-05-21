const express = require("express");
const router = express.Router();
const { getNotifications, markAllRead, markOneRead } = require("../Controllers/notification");
const auth = require("../Connection/middleware/authentication");

router.get("/",            auth, getNotifications);
router.put("/read/all",    auth, markAllRead);
router.put("/read/:id",    auth, markOneRead);

module.exports = router;