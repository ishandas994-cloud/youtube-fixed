const express = require("express");
const router = express.Router();

const videoController = require("../Controllers/video");
const auth = require("../Connection/middleware/authentication");

// Upload Video
router.post("/", auth, videoController.uploadVideo);

// Get All Videos
router.get("/", videoController.getAllVideo);

// Trending Videos
router.get("/trending", videoController.getTrendingVideos);

// Search Videos
router.get("/search/:query", videoController.searchVideos);

// Suggested Videos
router.get("/suggested/:id", videoController.getSuggestedVideos);

// Like / Dislike
router.put("/react/:id", auth, videoController.toggleReaction);

// Videos By User
router.get("/user/:userId", videoController.getVideoByUserId);

// Liked Videos
router.get("/liked/all", auth, videoController.getLikedVideos);

// Single Video
router.get("/:id", videoController.getVideoById);

module.exports = router;