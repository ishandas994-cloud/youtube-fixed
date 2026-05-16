const History = require("../Models/history");

// ================= ADD VIDEO TO HISTORY =================
exports.addToHistory = async (req, res) => {
  try {
    const { video } = req.body;

    // Check user
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const userId = req.user._id;

    if (!video) {
      return res.status(400).json({
        success: false,
        message: "Video ID is required",
      });
    }

    // Check existing history
    const existing = await History.findOne({
      user: userId,
      video: video,
    });

    if (existing) {
      // Update the timestamp so it bubbles to the top of history
      await History.findByIdAndUpdate(existing._id, { updatedAt: new Date() });

      return res.status(200).json({
        success: true,
        message: "History updated",
      });
    }

    // Create new history
    const history = await History.create({
      user: userId,
      video: video,
    });

    res.status(201).json({
      success: true,
      history,
    });

  } catch (error) {
    console.error("Add To History Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET USER HISTORY =================
exports.getHistory = async (req, res) => {
  try {

    // Check user
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const userId = req.user._id;

    const history = await History.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "video",
        select: "title thumbnail videoLink user createdAt",
        populate: {
          path: "user",
          select: "channelName profilePic",
        },
      });

    res.status(200).json({
      success: true,
      history,
    });

  } catch (error) {
    console.error("Get History Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};