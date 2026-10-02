const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const quotesFile = path.join(dataDir, "quotes.json");
const contactsFile = path.join(dataDir, "contacts.json");
const projectsFile = path.join(dataDir, "projects.json");

// Helper to read JSON file safely
const readJson = (filePath, defaultData = []) => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content || "[]");
    }
    return defaultData;
  } catch (err) {
    return defaultData;
  }
};

// Helper to write JSON file safely
const writeJson = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Storage write error:", err.message);
  }
};

const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Default seed projects for portfolio
const defaultProjects = [
  {
    _id: "proj_1",
    title: "Lusail Marina Commercial Tower",
    category: "Commercial Facility",
    service: "Cleaning & Hospitality",
    location: "Lusail Marina, Doha",
    client: "Lusail Real Estate",
    year: "2024",
    imageUrl: "/src/assets/services/cleaning-hospitality.jpg",
    description: "Full-scale corporate cleaning, deep sanitization, and hospitality staffing for a 32-story landmark tower.",
    scope: ["Daily Janitorial Services", "High-Rise Façade Cleaning", "Executive Hospitality Staff", "Marble Polishing"],
    stats: "32 Floors • 100% SLA Met",
    featured: true,
  },
  {
    _id: "proj_2",
    title: "Doha Metro Infrastructure Maintenance",
    category: "Infrastructure",
    service: "Trading & Contracting",
    location: "Doha Metro Stations, Qatar",
    client: "Rail Contracting Consortium",
    year: "2024",
    imageUrl: "/src/assets/services/trading-contracting.jpg",
    description: "Specialized building materials supply, maintenance workforce deployment, and MEP contracting support.",
    scope: ["Procurement of Technical Supplies", "Certified MEP Technicians", "Emergency Repair Dispatch", "Safety Audit Compliance"],
    stats: "5 Stations Maintained",
    featured: true,
  },
  {
    _id: "proj_3",
    title: "The Pearl-Qatar Luxury Residences",
    category: "Residential & Luxury",
    service: "Maintenance & Fit-Out",
    location: "Porto Arabia, The Pearl",
    client: "Private Residential Association",
    year: "2024",
    imageUrl: "/src/assets/services/maintenance.jpg",
    description: "Round-the-clock MEP maintenance, preventive HVAC overhauls, plumbing, and luxury interior fit-outs.",
    scope: ["24/7 Rapid Response Team", "Chilled Water AC Maintenance", "Electrical Load Distribution", "Luxury Interior Renovations"],
    stats: "120+ Units Serviced",
    featured: true,
  },
  {
    _id: "proj_4",
    title: "Qatar International Sports Championship",
    category: "Event Management",
    service: "Event Operations",
    location: "Khalifa International Stadium",
    client: "National Sports Committee",
    year: "2023",
    imageUrl: "/src/assets/services/event-management.jpg",
    description: "Comprehensive event crowd control marshals, VIP ushering, rapid post-event venue turnaround, and sanitation.",
    scope: ["400+ Event Support Staff", "VIP Protocol Services", "Rapid Turnaround Janitorial", "Waste Management"],
    stats: "45,000 Spectators Managed",
    featured: true,
  },
  {
    _id: "proj_5",
    title: "Ras Laffan Industrial Complex Pest Management",
    category: "Industrial",
    service: "Pest Control",
    location: "Ras Laffan Industrial City",
    client: "Energy & Gas Facilities",
    year: "2024",
    imageUrl: "/src/assets/services/pest-control.jpg",
    description: "Ministry-compliant eco-friendly pest management, chemical sanitization, and rodent control in harsh desert environments.",
    scope: ["MOPH Approved Treatments", "Barrier Insect Protection", "Termite Prevention", "Quarterly Environmental Audits"],
    stats: "250,000 sqm Coverage",
    featured: false,
  },
  {
    _id: "proj_6",
    title: "Hamad Port Logistics Hub Expansion",
    category: "Industrial & Logistics",
    service: "Manpower Supply",
    location: "Hamad Port, Umm Al Houl",
    client: "Global Logistics Operator",
    year: "2024",
    imageUrl: "/src/assets/services/manpower-supply.jpg",
    description: "Deployment of certified forklift operators, warehouse logistics teams, riggers, and civil technicians.",
    scope: ["Certified Heavy Equipment Operators", "QHSE Compliant Workforce", "Bilingual Site Supervisors", "Visa & Logistics Management"],
    stats: "180+ Skilled Personnel",
    featured: false,
  },
];

module.exports = {
  isMongoConnected,
  getStoredQuotes: () => readJson(quotesFile, []),
  saveStoredQuotes: (data) => writeJson(quotesFile, data),
  getStoredContacts: () => readJson(contactsFile, []),
  saveStoredContacts: (data) => writeJson(contactsFile, data),
  getStoredProjects: () => readJson(projectsFile, defaultProjects),
  saveStoredProjects: (data) => writeJson(projectsFile, data),
  defaultProjects,
};
