const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    channelName: { type: String, required: true, trim: true },
    userName:    { type: String, required: true, unique: true, trim: true },
    password:    { type: String, required: true },
    about:       { type: String, default: "" },
    profilePic:  { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
