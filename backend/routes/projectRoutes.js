const express = require("express");
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public endpoints
router.get("/", getProjects);
router.get("/:id", getProjectById);

// Admin portfolio management
router.post("/", protect, adminOnly, upload.single("image"), createProject);
router.patch("/:id", protect, adminOnly, upload.single("image"), updateProject);
router.delete("/:id", protect, adminOnly, deleteProject);

module.exports = router;
