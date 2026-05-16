const WatchLater = require("../Models/watchLater");

// ADD TO WATCH LATER
exports.addToWatchLater = async (req, res) => {

  try {

    const userId = req.user._id;

    const { video } = req.body;

    if (!video) {
      return res.status(400).json({
        success: false,
        message: "Video ID required",
      });
    }

    const alreadyExists = await WatchLater.findOne({
      user: userId,
      video,
    });

    if (alreadyExists) {
      return res.status(200).json({
        success: true,
        message: "Already added",
      });
    }

    const watchLater = await WatchLater.create({
      user: userId,
      video,
    });

    res.status(201).json({
      success: true,
      watchLater,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// GET WATCH LATER
exports.getWatchLater = async (req, res) => {

  try {

    const userId = req.user._id;

    const videos = await WatchLater.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "video",
        populate: {
          path: "user",
          select: "channelName profilePic",
        },
      });

    res.status(200).json({
      success: true,
      videos,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// REMOVE WATCH LATER
exports.removeWatchLater = async (req, res) => {

  try {

    await WatchLater.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Removed",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};