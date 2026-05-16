const WatchLater = require("../Models/watchLater");

// ADD TO WATCH LATER
exports.addToWatchLater = async (req, res) => {
  try {
    const userId = req.user._id;
    const { video } = req.body;

    if (!video) return res.status(400).json({ success: false, message: "Video ID required" });

    const existing = await WatchLater.findOne({ user: userId, video });

    if (existing) return res.status(200).json({ success: true, message: "Already in Watch Later" });

    const entry = await WatchLater.create({ user: userId, video });

    res.status(201).json({ success: true, watchLater: entry });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET WATCH LATER
exports.getWatchLater = async (req, res) => {
  try {
    const videos = await WatchLater.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "video",
        populate: { path: "user", select: "channelName profilePic" },
      });

    res.status(200).json({ success: true, videos });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// REMOVE FROM WATCH LATER
exports.removeWatchLater = async (req, res) => {
  try {
    await WatchLater.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
