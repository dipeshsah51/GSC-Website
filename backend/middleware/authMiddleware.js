const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "gsc_qatar_jwt_super_secret_key_2026"
      );

      // Check if user exists in database if mongo is connected and ID is valid ObjectId
      const mongoose = require("mongoose");
      const { isMongoConnected } = require("../services/storageService");

      let user = null;
      if (isMongoConnected() && mongoose.Types.ObjectId.isValid(decoded.id)) {
        try {
          user = await User.findById(decoded.id).select("-password");
        } catch (e) {
          user = null;
        }
      }

      if (user) {
        req.user = user;
      } else {
        // Fallback for initial demo admin token
        req.user = {
          _id: decoded.id || "admin_id",
          name: decoded.name || "GSC Administrator",
          email: decoded.email || "admin@gsc-qatar.com",
          role: decoded.role || "admin",
        };
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized: Invalid or expired access token",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized: No token provided in authorization header",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Forbidden: Administrative privileges required",
  });
};

module.exports = {
  protect,
  adminOnly,
};
