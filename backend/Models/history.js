const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

// Allow updating updatedAt manually (for re-watched videos)
historySchema.set("timestamps", { createdAt: "createdAt", updatedAt: "updatedAt" });

module.exports = mongoose.model("History", historySchema);
