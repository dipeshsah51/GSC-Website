const express = require("express");
const router = express.Router();
const { login, registerAdmin, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Authentication endpoints
router.post("/login", login);
router.post("/register", registerAdmin);
router.get("/me", protect, getMe);

module.exports = router;
