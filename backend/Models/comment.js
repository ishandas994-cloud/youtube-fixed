const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  // REPLIES — nested array of reply objects
  replies: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      message: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);