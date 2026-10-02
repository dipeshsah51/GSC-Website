import cleaningImg from "../assets/services/cleaning-hospitality.jpg";
import manpowerImg from "../assets/services/manpower-supply.jpg";
import eventImg from "../assets/services/event-management.jpg";
import pestImg from "../assets/services/pest-control.jpg";
import maintenanceImg from "../assets/services/maintenance.jpg";
import constructionImg from "../assets/services/general-construction.jpg";
import tradingImg from "../assets/services/trading-contracting.jpg";

export const companyInfo = {
  name: "Genting Services & Contracting",
  shortName: "GSC",
  established: 2018,
  address: "69 B Ring Road, Doha, Qatar",
  phone: "+974 7025 2552",
  phoneRaw: "+97470252552",
  whatsapp: "+974 7025 2552",
  whatsappUrl: "https://wa.me/97470252552?text=Hello%20GSC%2C%20I%20would%20like%20to%20inquire%20about%20your%20services.",
  email: "info@gsc.qa",
  workingHours: "Saturday - Thursday: 8:00 AM - 6:00 PM",
  fridayStatus: "Friday: Closed / Emergency Response Only",
  country: "State of Qatar",
};

export const companyStats = [
  { value: "2018", label: "Established in Qatar", suffix: "" },
  { value: "7", label: "Specialized Divisions", suffix: "+" },
  { value: "150", label: "Corporate Clients Served", suffix: "+" },
  { value: "100", label: "Quality & Safety Standard", suffix: "%" },
];

export const servicesData = [
  {
    id: "cleaning-and-hospitality",
    slug: "cleaning-and-hospitality",
    title: "Cleaning & Hospitality",
    category: "Facility Services",
    image: cleaningImg,
    badge: "Most Requested",
    shortDesc:
      "Comprehensive commercial, residential and hospitality cleaning solutions delivered by vetted, certified hygiene specialists.",
    fullDesc:
      "GSC delivers premier cleaning and hospitality support services across Qatar. Whether you manage a commercial high-rise in West Bay, a luxury hospitality venue in Lusail, or require specialized post-construction deep cleaning, our trained personnel utilize eco-compliant chemicals and advanced equipment to uphold the highest sanitation standards.",
    features: [
      "Commercial office and corporate tower cleaning",
      "Hospitality housekeeping and guest services staffing",
      "Post-construction & renovation deep cleaning",
      "Window and glass facade exterior washing",
      "Upholstery, marble crystallization and carpet shampooing",
      "Daily scheduled janitorial and facility upkeep",
    ],
    benefits: [
      "Strict compliance with Qatar Ministry of Public Health standards",
      "Trained, uniformed, and background-checked workforce",
      "Flexible contracts: daily, monthly, annual or on-demand",
      "Eco-friendly, hospital-grade cleaning solutions",
    ],
    sectors: ["Corporate Towers", "Hotels & Resorts", "Hospitals & Clinics", "Educational Campuses"],
  },
  {
    id: "manpower-supply",
    slug: "manpower-supply",
    title: "Manpower Supply",
    category: "Workforce Solutions",
    image: manpowerImg,
    badge: "Scalable Teams",
    shortDesc:
      "Vetted, reliable skilled and semi-skilled workforce deployment to meet Qatar's most demanding project timelines.",
    fullDesc:
      "Navigating workforce demands requires agility and full legal compliance. GSC provides dependable manpower solutions across Qatar, supplying verified personnel ranging from technicians and tradespeople to hospitality staff, general helpers, and project supervisors, all compliant with Qatar Labor Laws.",
    features: [
      "Skilled MEP technicians, electricians, and plumbers",
      "Hospitality personnel: waitstaff, room attendants, kitchen stewards",
      "Civil construction labor and site support assistants",
      "Warehouse associates, loaders, and logistics support",
      "Short-term project reinforcement and long-term staffing",
      "Full payroll, accommodation, and transport management",
    ],
    benefits: [
      "100% compliant with Qatar Ministry of Labor regulations",
      "Rigorous screening, interview, and trade-testing process",
      "Rapid deployment capability for urgent project deadlines",
      "Reduced administrative and recruitment overhead for clients",
    ],
    sectors: ["Construction & Infrastructure", "Logistics & Warehousing", "Event Staging", "Facility Management"],
  },
  {
    id: "event-management",
    slug: "event-management",
    title: "Event Management",
    category: "Event Operations",
    image: eventImg,
    badge: "Turnkey Execution",
    shortDesc:
      "End-to-end event logistics, venue coordination, operational staffing, and on-ground management for corporate and public functions.",
    fullDesc:
      "From high-profile corporate galas and international conferences to cultural festivals and private exhibitions, GSC transforms event concepts into seamless realities. We handle the logistical heavy-lifting, crowd flow, temporary facilities, and hospitality support so you can focus on your guests.",
    features: [
      "Complete event logistics and on-site coordination",
      "Temporary staging, branding structures, and decor setup",
      "Guest relations, registration desk, and usher staffing",
      "Venue preparation, live maintenance, and post-event cleanup",
      "VIP hospitality catering support and lounge management",
      "Crowd control coordination and safety compliance",
    ],
    benefits: [
      "Experienced on-site event managers dedicated to your event",
      "Punctual setup and rapid breakdown turnaround",
      "Flawless presentation aligned with corporate brand standards",
      "Multi-lingual event hostesses and coordination crew",
    ],
    sectors: ["Government & Diplomatic Events", "Corporate Annual Summits", "Exhibitions & Trade Fairs", "Private Celebrations"],
  },
  {
    id: "pest-control",
    slug: "pest-control",
    title: "Pest Control",
    category: "Hygiene & Safety",
    image: pestImg,
    badge: "Municipality Approved",
    shortDesc:
      "Certified extermination, fumigation, and preventive pest defense engineered for Qatar's unique climate and commercial standards.",
    fullDesc:
      "Unwanted pests compromise health, brand reputation, and regulatory compliance. GSC offers certified Integrated Pest Management (IPM) designed specifically for residences, food processing plants, hospitality hubs, and commercial centers in Doha.",
    features: [
      "Commercial food and hospitality sanitation defense",
      "Targeted termite, cockroach, rodent, and bed bug treatments",
      "Eco-safe fumigation and residual misting protocols",
      "Preventive inspection routines with certified documentation",
      "Exterior barrier spraying and drain network treatments",
      "Emergency pest eradication call-out response",
    ],
    benefits: [
      "Approved by Qatar Ministry of Municipality & Environment",
      "Low-odor, human-safe and pet-safe chemical formulations",
      "Detailed inspection audit logs for health inspections",
      "Long-term defense guarantee with scheduled follow-ups",
    ],
    sectors: ["Restaurants & Cafes", "Supermarkets & Malls", "Residential Compounds", "Warehouses & Storage"],
  },
  {
    id: "maintenance",
    slug: "maintenance",
    title: "Maintenance",
    category: "Technical Services",
    image: maintenanceImg,
    badge: "24/7 Rapid Response",
    shortDesc:
      "Comprehensive MEP, HVAC air conditioning, plumbing, and civil repairs ensuring maximum facility uptime across Doha.",
    fullDesc:
      "Keep your properties functioning at peak performance. GSC provides comprehensive Planned Preventive Maintenance (PPM) and rapid emergency repairs covering HVAC chillers, electrical boards, plumbing fixtures, and interior architectural finishes.",
    features: [
      "HVAC & chiller maintenance, duct cleaning, and gas top-up",
      "Electrical wiring, DB panel inspections, and LED retrofits",
      "Plumbing installations, water pump repair, and leak fixing",
      "Civil works: plastering, tiling, painting, and gypsum repair",
      "Annual Maintenance Contracts (AMC) with dedicated technicians",
      "Routine safety testing and thermographic inspections",
    ],
    benefits: [
      "24/7 on-call dispatch for urgent plumbing or AC breakdowns",
      "Proactive PPM schedules to prevent costly system failures",
      "Original manufacturer spare parts with warranty",
      "Clear transparent reporting and maintenance logs",
    ],
    sectors: ["Commercial Buildings", "Villa Compounds", "Retail Showrooms", "Educational Facilities"],
  },
  {
    id: "general-construction",
    slug: "general-construction",
    title: "General Construction",
    category: "Contracting & Civil",
    image: constructionImg,
    badge: "Engineering Excellence",
    shortDesc:
      "High-standard civil construction, structural alterations, modern interior fitouts, and architectural renovations across Qatar.",
    fullDesc:
      "GSC delivers robust civil construction and turnkey interior fitout solutions that embody engineering integrity and modern architectural finishes. We handle structural modifications, masonry, partition systems, flooring, and decorative facades with unwavering attention to Qatar building codes.",
    features: [
      "Commercial office and retail interior turnkey fitouts",
      "Civil works, blockwork, plastering, and concrete repairs",
      "Acoustic gypsum partitions, suspended ceilings, and glass walls",
      "Porcelain, ceramic, marble, and vinyl flooring installation",
      "Exterior architectural upgrades, painting, and waterproofing",
      "Project site supervision and safety compliance management",
    ],
    benefits: [
      "Punctual project delivery within approved budget thresholds",
      "High-grade materials sourced from certified manufacturers",
      "Rigorous quality inspection at each construction milestone",
      "Turnkey management from concept schematics to handover",
    ],
    sectors: ["Corporate Offices", "Retail Flagships", "Residential Estates", "Commercial Showrooms"],
  },
  {
    id: "trading-and-contracting",
    slug: "trading-and-contracting",
    title: "Trading & Contracting",
    category: "Contracting & Civil",
    image: tradingImg,
    badge: "Procurement Partner",
    shortDesc:
      "Global procurement, building supplies trading, and specialized subcontracting agreements tailored for Qatar's infrastructure.",
    fullDesc:
      "Bridge your supply chain gap with GSC's reliable trading and contracting arm. We connect contractors, real estate developers, and corporate buyers with certified construction hardware, MEP supplies, safety gear, and specialized subcontracting packages across Qatar.",
    features: [
      "Sourcing and distribution of premium building materials",
      "MEP equipment, industrial tools, and electrical accessories",
      "Safety gear (PPE), uniforms, and facility consumable supplies",
      "Subcontracting agreements for specialized trade packages",
      "Custom supply chain agreements with volume cost advantages",
      "Logistics handling directly to project site locations",
    ],
    benefits: [
      "Direct relationships with certified global & regional manufacturers",
      "Guaranteed genuine materials compliant with Qatar standards (QCS)",
      "Flexible commercial terms for ongoing framework contracts",
      "Punctual site delivery reducing contractor idle time",
    ],
    sectors: ["Main Contractors", "Facility Operators", "Industrial Plants", "Real Estate Developers"],
  },
];

export const projectsData = [
  {
    id: "west-bay-commercial-tower",
    title: "West Bay Commercial High-Rise Facility Care",
    category: "Facility Services",
    location: "West Bay, Doha",
    service: "Cleaning & Maintenance",
    year: "2024",
    image: cleaningImg,
    description:
      "Comprehensive daily janitorial operations, glass facade maintenance, and mechanical system monitoring for a 32-story corporate commercial tower.",
    scope: ["Daily cleaning for 45,000 sqm floor area", "Preventive HVAC filter cycles", "Waste management & recycling protocols"],
  },
  {
    id: "lusail-corporate-conference",
    title: "Lusail Marina International Forum Logistics",
    category: "Event Operations",
    location: "Lusail City, Qatar",
    service: "Event Management",
    year: "2024",
    image: eventImg,
    description:
      "Full turnkey operational staffing, staging logistics, and VIP hospitality coordination for a 3-day corporate investment conference with 1,200+ attendees.",
    scope: ["VIP registration management", "Stage setup & lighting logistics", "Round-the-clock venue hygiene & steward support"],
  },
  {
    id: "al-rayyan-industrial-hvac",
    title: "Industrial Logistics Complex MEP Overhaul",
    category: "Technical Services",
    location: "Al Rayyan Industrial Area",
    service: "Maintenance",
    year: "2023",
    image: maintenanceImg,
    description:
      "Planned preventive maintenance, AC chiller overhaul, and emergency electrical load balancing across 4 temperature-controlled logistics distribution hubs.",
    scope: ["12 heavy rooftop chillers serviced", "Electrical distribution panels re-engineered", "24/7 on-site emergency maintenance team"],
  },
  {
    id: "the-pearl-luxury-residential",
    title: "The Pearl-Qatar Residential Estate Fitout",
    category: "Contracting & Civil",
    location: "The Pearl, Doha",
    service: "General Construction",
    year: "2023",
    image: constructionImg,
    description:
      "High-end interior renovation, Italian porcelain tiling, acoustic wall paneling, and custom architectural ceiling installations for luxury apartments.",
    scope: ["Complete interior demolition & fitout", "Custom ceiling gypsum & cove lighting", "Waterproofing & premium floor installations"],
  },
  {
    id: "doha-downtown-workforce",
    title: "Commercial Development Workforce Deployment",
    category: "Workforce Solutions",
    location: "Downtown Doha",
    service: "Manpower Supply",
    year: "2024",
    image: manpowerImg,
    description:
      "Rapid mobilization of 80+ vetted technicians, certified electricians, and safety assistants to accelerate delivery on a major multi-use commercial center.",
    scope: ["Full Qatar labor compliance & visa processing", "On-site safety orientation & daily briefing", "Zero safety incident record achieved"],
  },
  {
    id: "hospitality-hub-pest-control",
    title: "Hospitality Chain Annual Integrated Pest Defense",
    category: "Hygiene & Safety",
    location: "Old Airport Road & Doha Port",
    service: "Pest Control",
    year: "2024",
    image: pestImg,
    description:
      "Year-round municipality-approved pest prevention and eco-safe fumigation coverage for 6 hotel properties, dining venues, and back-of-house storage areas.",
    scope: ["Monthly preventative treatments", "HACCP compliant documentation", "Zero pest infestation rating retained"],
  },
];

export const teamMembers = [
  {
    name: "Shyam Sundar Sah",
    role: "Managing Director",
    department: "Executive Leadership",
    bio: "Guiding GSC's strategic trajectory and long-term vision in Qatar since 2018 with extensive executive contracting expertise.",
    focus: "Corporate Strategy, Key Accounts & Partnerships",
  },
  {
    name: "Puskar Raidas",
    role: "General Manager",
    department: "Management",
    bio: "Overseeing all business units, ensuring operational excellence, contractual integrity, and high client retention across Qatar.",
    focus: "Business Development & Operational Performance",
  },
  {
    name: "Binod B.K",
    role: "Operation Manager",
    department: "Field Operations",
    bio: "Directing day-to-day service execution, technical workforce mobilization, and rigorous on-site quality control standards.",
    focus: "Manpower Deployment, Logistics & Site Safety",
  },
  {
    name: "M.D Afjal Mikrani",
    role: "Accounting Officer",
    department: "Finance & Administration",
    bio: "Managing financial planning, corporate compliance, vendor relations, and transparent billing for all contracting agreements.",
    focus: "Financial Governance & Contract Administration",
  },
];

export const testimonialsData = [
  {
    id: 1,
    name: "Tariq Al-Mansoor",
    role: "Facilities Director",
    company: "Doha Commercial Tower Management",
    rating: 5,
    date: "August 2024",
    text: "GSC has been handling our 28-story facility cleaning and scheduled maintenance for over two years. Their response time is exceptional, staff are polite and well-trained, and management is always reachable. Truly a benchmark for service in Qatar.",
  },
  {
    id: 2,
    name: "Elena Rostova",
    role: "Head of Events & Operations",
    company: "Gulf Hospitality & Exhibitions",
    rating: 5,
    date: "November 2024",
    text: "We partnered with GSC for multiple international business summits in Lusail. Their event coordination team and steward staff were punctual, polished, and handled last-minute logistical changes with zero stress. Outstanding professionalism!",
  },
  {
    id: 3,
    name: "Eng. Rashid Al-Kuwari",
    role: "Project Manager",
    company: "Al-Raya Contracting Co.",
    rating: 5,
    date: "January 2025",
    text: "When we needed skilled MEP labor and specialized equipment on short notice for our residential project, GSC deployed fully compliant, experienced technicians within 48 hours. They saved our project deadline.",
  },
  {
    id: 4,
    name: "Faisal Al-Thani",
    role: "Operations Head",
    company: "Pearl Hospitality Group",
    rating: 5,
    date: "September 2024",
    text: "Their pest control and sanitation services are second to none in Doha. Strict documentation, safe methods, and 100% municipality approval compliance. We never have to worry about audits.",
  },
];

export const faqsData = [
  {
    category: "General & Overview",
    question: "What makes Genting Services & Contracting (GSC) unique in Qatar?",
    answer:
      "GSC is an integrated multi-division service partner established in Doha in 2018. Rather than coordinating with multiple separate vendors for cleaning, manpower, maintenance, pest control, construction, and trading, our clients benefit from a single accountable partner with dedicated project managers and transparent pricing.",
  },
  {
    category: "General & Overview",
    question: "Where is GSC located, and which areas in Qatar do you cover?",
    answer:
      "Our main office is located at 69 B Ring Road, Doha, Qatar. We execute operations throughout all municipalities in Qatar, including West Bay, Lusail, The Pearl, Al Wakrah, Al Rayyan, Al Khor, and the Industrial Area.",
  },
  {
    category: "Quotations & Contracts",
    question: "How can I request a quotation and how quickly will I receive it?",
    answer:
      "You can submit your requirements via our website's Request a Quote form, call us directly at +974 7025 2552, or message us on WhatsApp. Our technical team typically provides an initial proposal within 24 business hours following a brief site assessment or scope review.",
  },
  {
    category: "Quotations & Contracts",
    question: "Do you offer Annual Maintenance Contracts (AMC) and custom service agreements?",
    answer:
      "Yes. We offer fully customizable contract structures: one-off project contracts, scheduled monthly preventive retainers, and comprehensive Annual Maintenance Contracts (AMC) with dedicated personnel and SLA guarantees.",
  },
  {
    category: "Compliance & Safety",
    question: "Are your employees legally compliant and sponsored under Qatar Labor Law?",
    answer:
      "Absolutely. GSC strictly complies with all regulations of the Qatar Ministry of Labor, Ministry of Municipality, and Civil Defense. All workforce members carry valid QIDs, complete medical fitness checks, undergo safety inductions, and are covered by comprehensive insurance.",
  },
  {
    category: "Services & Manpower",
    question: "Can GSC provide emergency or after-hours service support?",
    answer:
      "Yes, for contracted facility and maintenance clients, we operate a 24/7 emergency dispatch helpline to address critical incidents such as major electrical failures, AC breakdowns during peak summer, or burst water mains.",
  },
  {
    category: "Services & Manpower",
    question: "What is your mobilization timeframe for manpower supply requests?",
    answer:
      "For standard trades and support personnel, we can mobilize teams within 48 to 72 hours. For specialized technical roles or large-volume crew deployments, we arrange custom mobilization plans to meet project schedules.",
  },
];
