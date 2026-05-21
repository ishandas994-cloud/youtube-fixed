const Comment = require("../Models/comment");

// ================= ADD COMMENT =================
exports.addComment = async (req, res) => {
  try {
    const { video, message } = req.body;

    if (!video || !message) {
      return res.status(400).json({ success: false, message: "Video and message are required" });
    }

    const newComment = await Comment.create({
      user: req.user._id,
      video,
      message,
    });

    const populated = await Comment.findById(newComment._id)
      .populate("user", "userName profilePic channelName");

    res.status(201).json({ success: true, newComment: populated });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET COMMENTS =================
exports.getCommentsByVideo = async (req, res) => {
  try {
    const comments = await Comment.find({ video: req.params.videoId })
      .populate("user", "userName profilePic channelName")
      .populate("replies.user", "userName profilePic channelName")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, comments });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= ADD REPLY =================
exports.addReply = async (req, res) => {
  try {
    const { message } = req.body;
    const { commentId } = req.params;

    if (!message) {
      return res.status(400).json({ success: false, message: "Reply message is required" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    comment.replies.push({ user: req.user._id, message });
    await comment.save();

    // Re-fetch with populated replies
    const updated = await Comment.findById(commentId)
      .populate("user", "userName profilePic channelName")
      .populate("replies.user", "userName profilePic channelName");

    res.status(201).json({ success: true, comment: updated });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DELETE COMMENT =================
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.status(200).json({ success: true, message: "Comment deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};