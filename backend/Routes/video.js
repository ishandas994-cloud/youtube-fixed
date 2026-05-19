const express = require("express");
const router = express.Router();
const videoController = require("../Controllers/video");
const auth = require("../Connection/middleware/authentication");

// Upload
router.post("/", auth, videoController.uploadVideo);

// Get All
router.get("/", videoController.getAllVideo);

// Trending
router.get("/trending", videoController.getTrendingVideos);

// Search
router.get("/search/:query", videoController.searchVideos);

// Suggested
router.get("/suggested/:id", videoController.getSuggestedVideos);

// Like / Dislike
router.put("/react/:id", auth, videoController.toggleReaction);

// Videos By User
router.get("/user/:userId", videoController.getVideoByUserId);

// Liked Videos
router.get("/liked/all", auth, videoController.getLikedVideos);

// Delete Video
router.delete("/:id", auth, videoController.deleteVideo);

// Single Video — must be last
router.get("/:id", videoController.getVideoById);

module.exports = router;