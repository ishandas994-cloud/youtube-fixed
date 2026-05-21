const express = require("express");
const router = express.Router();
const { addComment, getCommentsByVideo, addReply, deleteComment } = require("../Controllers/comment");
const auth = require("../Connection/middleware/authentication");

router.post("/",                         auth, addComment);
router.get("/:videoId",                  getCommentsByVideo);
router.post("/reply/:commentId",         auth, addReply);
router.delete("/delete/:commentId",      auth, deleteComment);

module.exports = router;