const express = require("express");
const router = express.Router();
const {
  createContact,
  getContacts,
  updateContactStatus,
  deleteContact,
} = require("../controllers/contactController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public inquiry submission
router.post("/", createContact);

// Protected Admin inquiries management
router.get("/", protect, adminOnly, getContacts);
router.patch("/:id", protect, adminOnly, updateContactStatus);
router.delete("/:id", protect, adminOnly, deleteContact);

module.exports = router;
