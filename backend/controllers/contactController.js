const Contact = require("../models/Contact");
const {
  isMongoConnected,
  getStoredContacts,
  saveStoredContacts,
} = require("../services/storageService");

// @desc    Submit a contact inquiry message
// @route   POST /api/contacts
// @access  Public
const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (Name, Email, Phone, Message).",
      });
    }

    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: (subject || "General Service Inquiry").trim(),
      message: message.trim(),
      status: "New",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let savedContact;

    if (isMongoConnected()) {
      savedContact = await Contact.create(contactData);
    } else {
      const existing = getStoredContacts();
      savedContact = { _id: `msg_${Date.now()}`, ...contactData };
      existing.unshift(savedContact);
      saveStoredContacts(existing);
    }

    res.status(201).json({
      success: true,
      message: "Thank you for reaching out to Genting Services & Contracting. Our team will contact you shortly.",
      contact: savedContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process message inquiry",
    });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contacts
// @access  Private (Admin)
const getContacts = async (req, res) => {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;

    if (isMongoConnected()) {
      const query = {};
      if (status && status !== "All") {
        query.status = status;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
      }

      const total = await Contact.countDocuments(query);
      const contacts = await Contact.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      return res.json({
        success: true,
        count: contacts.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        contacts,
      });
    } else {
      let contacts = getStoredContacts();

      if (status && status !== "All") {
        contacts = contacts.filter((c) => c.status === status);
      }
      if (search) {
        const s = search.toLowerCase();
        contacts = contacts.filter(
          (c) =>
            c.name?.toLowerCase().includes(s) ||
            c.email?.toLowerCase().includes(s) ||
            c.phone?.toLowerCase().includes(s) ||
            c.subject?.toLowerCase().includes(s)
        );
      }

      const total = contacts.length;
      const startIdx = (Number(page) - 1) * Number(limit);
      const paginated = contacts.slice(startIdx, startIdx + Number(limit));

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
        contacts: paginated,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve contact messages",
    });
  }
};

// @desc    Update contact status
// @route   PATCH /api/contacts/:id
// @access  Private (Admin)
const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (isMongoConnected()) {
      const contact = await Contact.findById(id);
      if (!contact) {
        return res.status(404).json({ success: false, message: "Message not found" });
      }

      if (status) contact.status = status;
      const updated = await contact.save();
      return res.json({
        success: true,
        message: "Message status updated successfully",
        contact: updated,
      });
    } else {
      const contacts = getStoredContacts();
      const index = contacts.findIndex((c) => c._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: "Message not found" });
      }

      if (status) contacts[index].status = status;
      contacts[index].updatedAt = new Date().toISOString();
      saveStoredContacts(contacts);

      return res.json({
        success: true,
        message: "Message status updated successfully",
        contact: contacts[index],
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update contact status",
    });
  }
};

// @desc    Delete a contact message
// @route   DELETE /api/contacts/:id
// @access  Private (Admin)
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const contact = await Contact.findById(id);
      if (!contact) {
        return res.status(404).json({ success: false, message: "Message not found" });
      }
      await contact.deleteOne();
      return res.json({ success: true, message: "Message deleted successfully" });
    } else {
      const contacts = getStoredContacts();
      const filtered = contacts.filter((c) => c._id !== id);
      saveStoredContacts(filtered);
      return res.json({ success: true, message: "Message deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete message",
    });
  }
};

module.exports = {
  createContact,
  getContacts,
  updateContactStatus,
  deleteContact,
};
