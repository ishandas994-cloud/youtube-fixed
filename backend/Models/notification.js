const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type:      { type: String, enum: ["new_video", "new_comment", "new_reply", "new_subscriber"], required: true },
  video:     { type: mongoose.Schema.Types.ObjectId, ref: "Video", default: null },
  message:   { type: String, required: true },
  read:      { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);