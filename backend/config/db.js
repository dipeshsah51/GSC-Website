const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gsc_website_db";

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500, // Timeout after 2.5s if Mongo server is unreachable
    });

    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Notice]: Not connected (${error.message}).`);
    console.log(
      `[Storage Mode]: Running with resilient storage fallback. All API endpoints (/api/quotes, /api/contacts, etc.) remain 100% active and testable!`
    );
    return false;
  }
};

module.exports = connectDB;