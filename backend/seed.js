const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Project = require("./models/Project");
const Quote = require("./models/Quote");
const Contact = require("./models/Contact");
const { defaultProjects } = require("./services/storageService");

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gsc_website_db";
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
    console.log("[MongoDB Connected for Seeding]");

    // 1. Seed Admin User
    const adminEmail = "admin@gsc-qatar.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: "GSC System Administrator",
        email: adminEmail,
        password: "admin123456",
        role: "admin",
      });
      console.log(`[Admin User Created]: ${adminEmail} (Password: admin123456)`);
    } else {
      console.log(`[Admin User Exists]: ${adminEmail}`);
    }

    // 2. Seed Projects
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      const cleanProjects = defaultProjects.map(({ _id, ...rest }) => rest);
      await Project.insertMany(cleanProjects);
      console.log(`[Projects Seeded]: ${cleanProjects.length} Qatar landmark projects inserted.`);
    } else {
      console.log(`[Projects Present]: ${projectCount} projects already in database.`);
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[Seeding Error]:", error.message);
    process.exit(1);
  }
};

seedData();
