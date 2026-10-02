const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { isMongoConnected } = require("../services/storageService");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "admin",
    },
    process.env.JWT_SECRET || "gsc_qatar_jwt_super_secret_key_2026",
    {
      expiresIn: "30d",
    }
  );
};

// Fallback demo admin user
const demoAdmin = {
  _id: "demo_admin_gsc_1",
  name: "GSC System Admin",
  email: "admin@gsc-qatar.com",
  role: "admin",
};

// @desc    Admin login & get JWT token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your administrative email and password",
      });
    }

    if (isMongoConnected()) {
      const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

      if (user && (await user.matchPassword(password))) {
        return res.json({
          success: true,
          message: "Authentication successful",
          token: generateToken(user),
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    }

    // Check demo credentials fallback
    if (
      email.toLowerCase().trim() === "admin@gsc-qatar.com" &&
      password === "admin123456"
    ) {
      return res.json({
        success: true,
        message: "Authentication successful (Admin Portal)",
        token: generateToken(demoAdmin),
        user: demoAdmin,
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid email or password credentials",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Authentication error",
    });
  }
};

// @desc    Register a new administrator
// @route   POST /api/auth/register
// @access  Public (Initial setup) or Protected (Admin)
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role = "admin" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (isMongoConnected()) {
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists",
        });
      }

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
      });

      return res.status(201).json({
        success: true,
        message: "Administrator registered successfully",
        token: generateToken(user),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      // In-memory / demo response
      const newUser = {
        _id: `usr_${Date.now()}`,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role,
      };

      return res.status(201).json({
        success: true,
        message: "Administrator account created in local environment",
        token: generateToken(newUser),
        user: newUser,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to register administrator",
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

module.exports = {
  login,
  registerAdmin,
  getMe,
};
