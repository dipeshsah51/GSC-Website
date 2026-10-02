const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    service: {
      type: String,
      required: [true, "Service category is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Project location in Qatar is required"],
      trim: true,
      default: "Doha, Qatar",
    },
    client: {
      type: String,
      trim: true,
      default: "Confidential Client",
    },
    year: {
      type: String,
      default: "2024-2025",
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL or asset path is required"],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
    },
    scope: {
      type: [String],
      default: [],
    },
    stats: {
      type: String,
      default: "Delivered On Schedule",
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
