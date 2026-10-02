const Quote = require("../models/Quote");
const {
  isMongoConnected,
  getStoredQuotes,
  saveStoredQuotes,
} = require("../services/storageService");

// Generate unique Qatar reference ID like GSC-849201
const generateReferenceId = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `GSC-${randomNum}`;
};

// @desc    Submit a new Quote Request
// @route   POST /api/quotes
// @access  Public
const createQuote = async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      phone,
      service,
      location,
      contractType,
      timeline,
      notes,
    } = req.body;

    // Validation
    if (!name || !email || !phone || !service || !location || !notes) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (Name, Email, Phone, Service, Location, Notes).",
      });
    }

    const referenceId = generateReferenceId();

    const quoteData = {
      referenceId,
      name: name.trim(),
      company: (company || "").trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      service,
      location,
      contractType: contractType || "One-Time Project",
      timeline: timeline || "Immediately (Within 48 hours)",
      notes: notes.trim(),
      status: "Pending",
      adminNotes: "",
      estimatedBudget: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let savedQuote;

    if (isMongoConnected()) {
      savedQuote = await Quote.create(quoteData);
    } else {
      const existing = getStoredQuotes();
      savedQuote = { _id: `qt_${Date.now()}`, ...quoteData };
      existing.unshift(savedQuote);
      saveStoredQuotes(existing);
    }

    res.status(201).json({
      success: true,
      message: "Quote request submitted successfully to Genting Services & Contracting W.L.L.",
      referenceId,
      quote: savedQuote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process quote request",
    });
  }
};

// @desc    Get all quote requests
// @route   GET /api/quotes
// @access  Private (Admin)
const getQuotes = async (req, res) => {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;

    if (isMongoConnected()) {
      const query = {};
      if (status && status !== "All") {
        query.status = status;
      }
      if (search) {
        query.$or = [
          { referenceId: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { company: { $regex: search, $options: "i" } },
          { service: { $regex: search, $options: "i" } },
        ];
      }

      const total = await Quote.countDocuments(query);
      const quotes = await Quote.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      return res.json({
        success: true,
        count: quotes.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        quotes,
      });
    } else {
      let quotes = getStoredQuotes();

      if (status && status !== "All") {
        quotes = quotes.filter((q) => q.status === status);
      }
      if (search) {
        const s = search.toLowerCase();
        quotes = quotes.filter(
          (q) =>
            q.referenceId?.toLowerCase().includes(s) ||
            q.name?.toLowerCase().includes(s) ||
            q.email?.toLowerCase().includes(s) ||
            q.service?.toLowerCase().includes(s) ||
            q.company?.toLowerCase().includes(s)
        );
      }

      const total = quotes.length;
      const startIdx = (Number(page) - 1) * Number(limit);
      const paginated = quotes.slice(startIdx, startIdx + Number(limit));

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
        quotes: paginated,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve quotes",
    });
  }
};

// @desc    Get quote details by reference ID
// @route   GET /api/quotes/:referenceId
// @access  Public (Tracking)
const getQuoteByReference = async (req, res) => {
  try {
    const { referenceId } = req.params;

    if (isMongoConnected()) {
      const quote = await Quote.findOne({ referenceId: referenceId.toUpperCase() });
      if (!quote) {
        return res.status(404).json({
          success: false,
          message: `Quote with reference ${referenceId} not found`,
        });
      }
      return res.json({ success: true, quote });
    } else {
      const quotes = getStoredQuotes();
      const quote = quotes.find(
        (q) => q.referenceId?.toUpperCase() === referenceId.toUpperCase()
      );
      if (!quote) {
        return res.status(404).json({
          success: false,
          message: `Quote with reference ${referenceId} not found`,
        });
      }
      return res.json({ success: true, quote });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch quote",
    });
  }
};

// @desc    Update quote status / admin notes
// @route   PATCH /api/quotes/:id
// @access  Private (Admin)
const updateQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, estimatedBudget } = req.body;

    if (isMongoConnected()) {
      const quote = await Quote.findById(id);
      if (!quote) {
        return res.status(404).json({ success: false, message: "Quote not found" });
      }

      if (status) quote.status = status;
      if (adminNotes !== undefined) quote.adminNotes = adminNotes;
      if (estimatedBudget !== undefined) quote.estimatedBudget = estimatedBudget;

      const updated = await quote.save();
      return res.json({
        success: true,
        message: "Quote status updated successfully",
        quote: updated,
      });
    } else {
      const quotes = getStoredQuotes();
      const index = quotes.findIndex((q) => q._id === id || q.referenceId === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: "Quote not found" });
      }

      if (status) quotes[index].status = status;
      if (adminNotes !== undefined) quotes[index].adminNotes = adminNotes;
      if (estimatedBudget !== undefined) quotes[index].estimatedBudget = estimatedBudget;
      quotes[index].updatedAt = new Date().toISOString();

      saveStoredQuotes(quotes);
      return res.json({
        success: true,
        message: "Quote status updated successfully",
        quote: quotes[index],
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update quote",
    });
  }
};

// @desc    Delete a quote
// @route   DELETE /api/quotes/:id
// @access  Private (Admin)
const deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const quote = await Quote.findById(id);
      if (!quote) {
        return res.status(404).json({ success: false, message: "Quote not found" });
      }
      await quote.deleteOne();
      return res.json({ success: true, message: "Quote removed successfully" });
    } else {
      const quotes = getStoredQuotes();
      const filtered = quotes.filter((q) => q._id !== id && q.referenceId !== id);
      saveStoredQuotes(filtered);
      return res.json({ success: true, message: "Quote removed successfully" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete quote",
    });
  }
};

module.exports = {
  createQuote,
  getQuotes,
  getQuoteByReference,
  updateQuoteStatus,
  deleteQuote,
};
