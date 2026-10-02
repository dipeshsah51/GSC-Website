const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

// Import Route Handlers
const quoteRoutes = require("./routes/quoteRoutes");
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");

// Import Middleware
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// CORS Configuration - allows Vite dev & preview servers and mobile on local LAN
app.use(
  cors({
    origin: true, // Allow request origin from localhost or mobile LAN IP
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root route
app.get("/", (req, res) => {
  res.json({
    name: "Genting Services & Contracting W.L.L. - REST API",
    version: "1.0.0",
    status: "Active",
    location: "Doha, Qatar",
    docs: {
      health: "/api/health",
      quotes: "/api/quotes",
      contacts: "/api/contacts",
      projects: "/api/projects",
      auth: "/api/auth",
    },
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  const isMongoReady = mongoose.connection.readyState === 1;
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    database: {
      connected: isMongoReady,
      status: isMongoReady ? "Connected (MongoDB)" : "Local Storage Mode (Active)",
    },
    system: "GSC Doha API Node.js Service",
  });
});

// API Routes
app.use("/api/quotes", quoteRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Port and Server Start
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Genting Services & Contracting W.L.L. Backend Started`);
  console.log(` API Endpoint : http://localhost:${PORT}`);
  console.log(` Health Check : http://localhost:${PORT}/api/health`);
  console.log(` Environment  : ${process.env.NODE_ENV || "development"}`);
  console.log(`=======================================================`);
});

module.exports = app;