const Notification = require("../Models/notification");
const User = require("../Models/user");

// ================= GET MY NOTIFICATIONS =================
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "channelName profilePic")
      .populate("video", "title thumbnail")
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.status(200).json({ success: true, notifications, unreadCount });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= MARK ALL AS READ =================
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= MARK ONE AS READ =================
exports.markOneRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= CREATE NOTIFICATION (internal helper) =================
exports.createNotification = async ({ recipient, sender, type, video, message }) => {
  try {
    if (recipient.toString() === sender.toString()) return; // don't notify yourself
    await Notification.create({ recipient, sender, type, video, message });
  } catch (err) {
    console.error("Notification create error:", err.message);
  }
};