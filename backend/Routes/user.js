const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/user");
const auth = require("../Connection/middleware/authentication");

// AUTH
router.post("/signUp", UserController.signUp);
router.post("/login",  UserController.signin);
router.post("/logout", UserController.logout);

// PROFILE — /me must come before /:id
router.get("/profile/me",  auth, UserController.getMyProfile);
router.get("/profile/:id", UserController.getUserProfile);

// USERS
router.get("/getUser/:id", UserController.getUserById);
router.get("/allUsers",    UserController.getAllUsers);

// UPDATE
router.put("/update", auth, UserController.updateUser);

// SUBSCRIBE
router.post("/subscribe/:id", auth, UserController.toggleSubscribe);
router.get("/subscriptions",  auth, UserController.getSubscriptions);

module.exports = router;