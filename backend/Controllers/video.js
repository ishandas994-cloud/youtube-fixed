const Video = require("../Models/video");
const User  = require("../Models/user");
const { createNotification } = require("./notification");

// ================= HELPER =================
const getAbsoluteVideoLink = (link) => {
  if (!link) return link;
  if (link.startsWith("http")) return link;
  const baseUrl = process.env.BACKEND_URL || "http://localhost:4000";
  return `${baseUrl}${link.startsWith("/") ? "" : "/"}${link}`;
};

// ================= UPLOAD VIDEO =================
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });

    const { title, description, videoLink, videoType, thumbnail } = req.body;

    const newVideo = await Video.create({
      user: req.user._id, title, description, videoLink, videoType, thumbnail,
    });

    // Notify all subscribers about new video
    const uploader = await User.findById(req.user._id);
    const subscribers = await User.find({ subscriptions: req.user._id }, "_id");
    for (const sub of subscribers) {
      await createNotification({
        recipient: sub._id,
        sender:    req.user._id,
        type:      "new_video",
        video:     newVideo._id,
        message:   `${uploader.channelName} uploaded a new video: "${title}"`,
      });
    }

    const video = newVideo.toObject();
    video.videoLink = getAbsoluteVideoLink(video.videoLink);
    video.thumbnail = getAbsoluteVideoLink(video.thumbnail);

    return res.status(201).json({ success: true, video });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET ALL VIDEOS =================
exports.getAllVideo = async (req, res) => {
  try {
    let videos = await Video.find()
      .populate("user", "channelName userName profilePic")
      .sort({ createdAt: -1 });

    videos = videos.map((v) => {
      const obj = v.toObject();
      obj.videoLink = getAbsoluteVideoLink(obj.videoLink);
      obj.thumbnail = getAbsoluteVideoLink(obj.thumbnail);
      return obj;
    });

    return res.status(200).json({ success: true, count: videos.length, videos });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= SEARCH =================
exports.searchVideos = async (req, res) => {
  try {
    let videos = await Video.find({ title: { $regex: req.params.query, $options: "i" } })
      .populate("user", "channelName userName profilePic")
      .sort({ createdAt: -1 });

    videos = videos.map((v) => {
      const obj = v.toObject();
      obj.videoLink = getAbsoluteVideoLink(obj.videoLink);
      obj.thumbnail = getAbsoluteVideoLink(obj.thumbnail);
      return obj;
    });

    return res.status(200).json({ success: true, videos });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= TRENDING =================
exports.getTrendingVideos = async (req, res) => {
  try {
    let videos = await Video.aggregate([
      { $lookup: { from: "comments", localField: "_id", foreignField: "video", as: "comments" } },
      { $addFields: {
        likesCount:    { $size: "$likes" },
        dislikesCount: { $size: "$dislikes" },
        commentsCount: { $size: "$comments" },
        viewsCount:    { $ifNull: ["$views", 0] },
      }},
      { $addFields: { score: { $subtract: [
        { $add: [
          { $multiply: ["$likesCount",    3] },
          { $multiply: ["$commentsCount", 2] },
          { $multiply: ["$viewsCount",    1] },
        ]}, "$dislikesCount",
      ]}}},
      { $sort: { score: -1 } },
      { $limit: 20 },
    ]);

    videos = await Video.populate(videos, { path: "user", select: "channelName userName profilePic" });
    videos = videos.map((v) => {
      v.videoLink = getAbsoluteVideoLink(v.videoLink);
      v.thumbnail = getAbsoluteVideoLink(v.thumbnail);
      return v;
    });

    return res.status(200).json({ success: true, videos });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET VIDEO BY ID (increments views) =================
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("user", "channelName userName profilePic");

    if (!video) return res.status(404).json({ success: false, message: "Video not found" });

    const obj = video.toObject();
    obj.videoLink = getAbsoluteVideoLink(obj.videoLink);
    obj.thumbnail = getAbsoluteVideoLink(obj.thumbnail);

    return res.status(200).json({ success: true, video: obj });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET BY USER =================
exports.getVideoByUserId = async (req, res) => {
  try {
    let videos = await Video.find({ user: req.params.userId })
      .populate("user", "channelName userName profilePic")
      .sort({ createdAt: -1 });

    videos = videos.map((v) => {
      const obj = v.toObject();
      obj.videoLink = getAbsoluteVideoLink(obj.videoLink);
      obj.thumbnail = getAbsoluteVideoLink(obj.thumbnail);
      return obj;
    });

    return res.status(200).json({ success: true, videos });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= SUGGESTED =================
exports.getSuggestedVideos = async (req, res) => {
  try {
    const current = await Video.findById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: "Video not found" });

    let videos = await Video.find({ _id: { $ne: req.params.id }, videoType: current.videoType })
      .populate("user", "channelName userName profilePic")
      .limit(6);

    if (videos.length === 0) {
      videos = await Video.find({ _id: { $ne: req.params.id } })
        .populate("user", "channelName userName profilePic")
        .limit(6);
    }

    videos = videos.map((v) => {
      const obj = v.toObject();
      obj.videoLink = getAbsoluteVideoLink(obj.videoLink);
      obj.thumbnail = getAbsoluteVideoLink(obj.thumbnail);
      return obj;
    });

    return res.status(200).json({ success: true, videos });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= LIKE / DISLIKE =================
exports.toggleReaction = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: "Video not found" });

    const userId = req.user._id.toString();

    if (req.body.type === "like") {
      if (video.likes.includes(userId)) { video.likes.pull(userId); }
      else { video.likes.push(userId); video.dislikes.pull(userId); }
    }
    if (req.body.type === "dislike") {
      if (video.dislikes.includes(userId)) { video.dislikes.pull(userId); }
      else { video.dislikes.push(userId); video.likes.pull(userId); }
    }

    await video.save();

    return res.status(200).json({
      success: true,
      likes: video.likes, dislikes: video.dislikes,
      isLiked: video.likes.includes(userId),
      isDisliked: video.dislikes.includes(userId),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET LIKED VIDEOS =================
exports.getLikedVideos = async (req, res) => {
  try {
    let videos = await Video.find({ likes: req.user._id })
      .populate("user", "channelName userName profilePic")
      .sort({ createdAt: -1 });

    videos = videos.map((v) => {
      const obj = v.toObject();
      obj.videoLink = getAbsoluteVideoLink(obj.videoLink);
      obj.thumbnail = getAbsoluteVideoLink(obj.thumbnail);
      return obj;
    });

    return res.status(200).json({ success: true, videos });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DELETE VIDEO =================
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: "Video not found" });
    if (video.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    await Video.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Video deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};