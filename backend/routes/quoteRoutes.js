const express = require("express");
const router = express.Router();
const {
  createQuote,
  getQuotes,
  getQuoteByReference,
  updateQuoteStatus,
  deleteQuote,
} = require("../controllers/quoteController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public endpoints
router.post("/", createQuote);
router.get("/track/:referenceId", getQuoteByReference);

// Protected Admin endpoints
router.get("/", protect, adminOnly, getQuotes);
router.patch("/:id", protect, adminOnly, updateQuoteStatus);
router.delete("/:id", protect, adminOnly, deleteQuote);

module.exports = router;
