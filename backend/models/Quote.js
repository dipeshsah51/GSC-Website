const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Customer phone number is required"],
      trim: true,
    },
    service: {
      type: String,
      required: [true, "Service division is required"],
    },
    location: {
      type: String,
      required: [true, "Project location in Qatar is required"],
    },
    contractType: {
      type: String,
      default: "One-Time Project",
    },
    timeline: {
      type: String,
      default: "Immediately (Within 48 hours)",
    },
    notes: {
      type: String,
      required: [true, "Project scope or specifications are required"],
    },
    status: {
      type: String,
      enum: ["Pending", "Under Review", "Quotation Sent", "Approved", "Declined"],
      default: "Pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    estimatedBudget: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Quote", quoteSchema);
