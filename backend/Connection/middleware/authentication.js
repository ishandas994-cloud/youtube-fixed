const jwt = require("jsonwebtoken");
const User = require("../../Models/user");

const auth = async (req, res, next) => {

  try {

    console.log("=========== AUTH MIDDLEWARE ===========");

    // Get Authorization Header
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    // Check if header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {

      return res.status(401).json({
        success: false,
        message: "No token provided",
      });

    }

    // Extract token
    const token = authHeader.split(" ")[1];

    console.log("TOKEN:", token);

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("DECODED TOKEN:", decoded);

    // Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {

      return res.status(401).json({
        success: false,
        message: "User not found",
      });

    }

    // Attach user to request
    req.user = user;

    next();

  } catch (error) {

    console.log("AUTH ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });

  }
};

module.exports = auth;