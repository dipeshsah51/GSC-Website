import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Users,
  BriefcaseBusiness,
  Award,
  Sparkles,
  MessageCircle,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";

import {
  companyInfo,
  companyStats,
  servicesData,
  projectsData,
  testimonialsData,
  faqsData,
} from "../data/websiteData";

import "./Home.css";

function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [openFaq, setOpenFaq] = useState(0);

  const categories = ["All", "Facility Services", "Technical Services", "Workforce Solutions", "Contracting & Civil", "Event Operations", "Hygiene & Safety"];

  const filteredServices =
    activeCategory === "All"
      ? servicesData
      : servicesData.filter((s) => s.category === activeCategory);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? -1 : idx);
  };

  // Select images from data for visual sections
  const heroImage = servicesData.find((s) => s.slug === "general-construction")?.image;
  const cleaningImage = servicesData.find((s) => s.slug === "cleaning-and-hospitality")?.image;
  const manpowerImage = servicesData.find((s) => s.slug === "manpower-supply")?.image;
  const eventImage = servicesData.find((s) => s.slug === "event-management")?.image;
  const maintenanceImage = servicesData.find((s) => s.slug === "maintenance")?.image;

  return (
    <main className="home-page">
      {/* ================= 1. HERO SECTION ================= */}
      <section className="home-hero">
        <div className="hero-background">
          {heroImage && (
            <img
              src={heroImage}
              alt="Genting Services & Contracting Qatar"
            />
          )}
        </div>

        <div className="hero-overlay"></div>

        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-line"></span>
              <span>GENTING SERVICES & CONTRACTING • DOHA, QATAR</span>
            </div>

            <h1>
              Complete Services.
              <span className="hero-gold-text">Professional Standards.</span>
            </h1>

            <p className="hero-subtitle">
              Your integrated contracting and facility partner in Qatar. Delivering
              cleaning, manpower, event logistics, maintenance, pest defense, general
              construction, and trading solutions with certified excellence since 2018.
            </p>

            <div className="hero-actions">
              <Link to="/request-quote" className="button button-primary hero-btn-main">
                <span>Request a Free Quote</span>
                <ArrowRight size={17} />
              </Link>

              <Link to="/services" className="button button-navy hero-btn-sub">
                <span>Explore Divisions</span>
              </Link>

              <a
                href={`tel:${companyInfo.phoneRaw}`}
                className="hero-call-link"
              >
                <div className="hero-call-icon">
                  <Phone size={16} />
                </div>
                <div>
                  <small>Direct Helpline</small>
                  <strong>{companyInfo.phone}</strong>
                </div>
              </a>
            </div>

            <div className="hero-trust">
              <div className="hero-trust-item">
                <CheckCircle2 size={17} />
                <span>Qatar Registered (CR Verified)</span>
              </div>
              <div className="hero-trust-item">
                <CheckCircle2 size={17} />
                <span>Serving Clients Since 2018</span>
              </div>
              <div className="hero-trust-item">
                <CheckCircle2 size={17} />
                <span>24/7 Rapid Emergency Support</span>
              </div>
            </div>
          </div>

          {/* Hero Stats Card */}
          <div className="hero-stats-card">
            <div className="hero-stats-header">
              <Sparkles size={20} />
              <span>GSC Key Highlights</span>
            </div>
            <div className="hero-stats-grid">
              {companyStats.map((stat) => (
                <div className="hero-stat-box" key={stat.label}>
                  <div className="hero-stat-number">
                    {stat.value}
                    {stat.suffix && <span className="stat-plus">{stat.suffix}</span>}
                  </div>
                  <div className="hero-stat-text">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="hero-stats-footer">
              <a
                href={companyInfo.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-wa-direct"
              >
                <MessageCircle size={16} />
                <span>Quick WhatsApp Consultation</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. QUICK INFORMATION STRIP ================= */}
      <section className="quick-info-section">
        <div className="container quick-info-grid">
          <div className="quick-info-card">
            <div className="quick-icon-wrap">
              <MapPin size={22} />
            </div>
            <div>
              <span>Head Office</span>
              <strong>{companyInfo.address}</strong>
            </div>
          </div>

          <a href={`tel:${companyInfo.phoneRaw}`} className="quick-info-card quick-card-link">
            <div className="quick-icon-wrap">
              <Phone size={22} />
            </div>
            <div>
              <span>Direct Phone</span>
              <strong>{companyInfo.phone}</strong>
            </div>
          </a>

          <div className="quick-info-card">
            <div className="quick-icon-wrap">
              <Clock3 size={22} />
            </div>
            <div>
              <span>Operating Hours</span>
              <strong>{companyInfo.workingHours}</strong>
            </div>
          </div>

          <div className="quick-info-card">
            <div className="quick-icon-wrap">
              <CalendarDays size={22} />
            </div>
            <div>
              <span>Company Status</span>
              <strong>Active & Fully Compliant</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. ABOUT GSC SECTION ================= */}
      <section className="home-about section">
        <div className="container about-layout">
          <div className="about-visual">
            <div className="about-gold-frame"></div>

            <div className="about-main-image">
              {cleaningImage && (
                <img
                  src={cleaningImage}
                  alt="GSC Cleaning and Hospitality Qatar"
                  loading="lazy"
                />
              )}
              <div className="about-image-badge">
                <ShieldCheck size={20} />
                <span>Certified Standards</span>
              </div>
            </div>

            <div className="about-small-image about-small-one">
              {manpowerImage && (
                <img
                  src={manpowerImage}
                  alt="GSC Manpower Supply Qatar"
                  loading="lazy"
                />
              )}
            </div>

            <div className="about-small-image about-small-two">
              {eventImage && (
                <img
                  src={eventImage}
                  alt="GSC Event Management Qatar"
                  loading="lazy"
                />
              )}
            </div>
          </div>

          <div className="about-content">
            <span className="section-label">ABOUT GENTING SERVICES</span>

            <h2>
              A versatile partner for
              <span className="gold-text"> essential business operations.</span>
            </h2>

            <p className="lead-text">
              Genting Services & Contracting (GSC) is a multi-disciplinary B2B
              service company headquartered in Doha. We provide integrated solutions
              that keep commercial properties, corporate workspaces, and construction
              projects operating at the highest standard.
            </p>

            <p>
              By uniting seven specialized divisions under one roof—from cleaning and
              hospitality to technical maintenance, skilled manpower, and civil
              contracting—we remove the headaches of coordinating multiple vendors.
            </p>

            <div className="about-points">
              <div className="about-point">
                <CheckCircle2 size={20} />
                <div>
                  <strong>One Contact, Multiple Capabilities</strong>
                  <span>Eliminate coordination hassle with a single accountable partner.</span>
                </div>
              </div>

              <div className="about-point">
                <CheckCircle2 size={20} />
                <div>
                  <strong>100% Qatar Regulatory Compliance</strong>
                  <span>Strict adherence to Ministry of Labor and Municipality safety standards.</span>
                </div>
              </div>

              <div className="about-point">
                <CheckCircle2 size={20} />
                <div>
                  <strong>Skilled & Supervised Workforce</strong>
                  <span>Experienced team members guided by on-site project supervisors.</span>
                </div>
              </div>
            </div>

            <div className="about-actions">
              <Link to="/about" className="button button-navy">
                <span>Learn More About Us</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="button button-outline">
                <span>Contact Office</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. CORE CAPABILITIES STRIP ================= */}
      <section className="capabilities-strip">
        <div className="container capabilities-grid">
          <div className="capability-item">
            <div className="cap-icon-box">
              <ShieldCheck size={28} />
            </div>
            <div>
              <strong>7 Core Divisions</strong>
              <span>End-to-end service coverage</span>
            </div>
          </div>

          <div className="capability-item">
            <div className="cap-icon-box">
              <Award size={28} />
            </div>
            <div>
              <strong>Quality Guaranteed</strong>
              <span>Structured inspection checklists</span>
            </div>
          </div>

          <div className="capability-item">
            <div className="cap-icon-box">
              <MapPin size={28} />
            </div>
            <div>
              <strong>All-Qatar Deployment</strong>
              <span>Doha, Lusail, Al Wakrah & Beyond</span>
            </div>
          </div>

          <div className="capability-item">
            <div className="cap-icon-box">
              <Star size={28} />
            </div>
            <div>
              <strong>Client-Centric SLAs</strong>
              <span>Reliable turnaround times</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. SERVICES SHOWCASE ================= */}
      <section className="home-services section section-light">
        <div className="container">
          <div className="section-heading-row">
            <div>
              <span className="section-label">OUR DIVISIONS</span>
              <h2>
                Complete solutions for
                <span className="gold-text"> your operational needs.</span>
              </h2>
              <p>
                Explore our full suite of professional services designed for businesses,
                facility operators, and project managers in Qatar.
              </p>
            </div>

            <Link to="/services" className="button button-primary view-all-btn">
              <span>View All 7 Services</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Category Filter Tabs */}
          <div className="filter-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-tab ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Services Cards Grid */}
          <div className="services-page-grid">
            {filteredServices.map((service) => (
              <article className="service-card" key={service.slug}>
                <div className="service-card-image">
                  <img
                    src={service.image}
                    alt={service.title}
                    loading="lazy"
                  />
                  <span className="service-card-badge">{service.badge}</span>
                </div>

                <div className="service-card-body">
                  <span className="category-tag">{service.category}</span>
                  <h3 style={{ marginTop: "8px" }}>{service.title}</h3>
                  <p>{service.shortDesc}</p>

                  <div className="service-features-list">
                    {service.features.slice(0, 2).map((feat, i) => (
                      <div className="service-feature-bullet" key={i}>
                        <CheckCircle2 size={15} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="service-card-footer">
                    <Link
                      to={`/services/${service.slug}`}
                      className="service-link"
                    >
                      <span>Explore Details</span>
                      <ArrowRight size={16} />
                    </Link>

                    <Link
                      to="/request-quote"
                      className="button button-outline"
                      style={{ minHeight: "36px", padding: "0 14px", fontSize: "0.8rem" }}
                    >
                      Get Quote
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 6. WHY GSC ================= */}
      <section className="why-gsc section">
        <div className="container why-gsc-layout">
          <div className="why-image">
            {maintenanceImage && (
              <img
                src={maintenanceImage}
                alt="GSC technical maintenance"
                loading="lazy"
              />
            )}
            <div className="why-image-card">
              <ShieldCheck size={32} />
              <div>
                <strong>Reliable Operations</strong>
                <span>Rigorous SOPs & QHSE compliance</span>
              </div>
            </div>
          </div>

          <div className="why-content">
            <span className="section-label">WHY CHOOSE GSC</span>
            <h2>
              Engineered around
              <span className="gold-text"> reliability and trust.</span>
            </h2>
            <p>
              We know that downtime, subpar cleaning, or delayed workforce deployment
              impacts your bottom line. GSC was built specifically to eliminate these
              operational risks in Qatar.
            </p>

            <div className="why-features-grid">
              <div className="why-feature-box">
                <div className="why-feature-icon">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <strong>Quality-Focused SOPs</strong>
                  <span>Every service follows verified execution checklists.</span>
                </div>
              </div>

              <div className="why-feature-box">
                <div className="why-feature-icon">
                  <Users size={24} />
                </div>
                <div>
                  <strong>Vetted & Trained Staff</strong>
                  <span>Legally compliant, experienced, and uniformed personnel.</span>
                </div>
              </div>

              <div className="why-feature-box">
                <div className="why-feature-icon">
                  <BriefcaseBusiness size={24} />
                </div>
                <div>
                  <strong>Integrated Solutions</strong>
                  <span>Single-source contracting saves administrative time and cost.</span>
                </div>
              </div>

              <div className="why-feature-box">
                <div className="why-feature-icon">
                  <Clock3 size={24} />
                </div>
                <div>
                  <strong>Rapid Response Times</strong>
                  <span>Fast quotation turnaround and on-call emergency support.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 7. FEATURED PROJECTS ================= */}
      <section className="home-projects section section-light">
        <div className="container">
          <div className="section-heading-row">
            <div>
              <span className="section-label">OUR WORK ACROSS QATAR</span>
              <h2>
                Selected Projects &
                <span className="gold-text"> Deliverables</span>
              </h2>
              <p>
                From corporate high-rises to international events, here is a snapshot
                of GSC's active presence in Qatar.
              </p>
            </div>

            <Link to="/projects" className="button button-navy">
              <span>View All Projects</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="three-column">
            {projectsData.slice(0, 3).map((project) => (
              <article className="project-card" key={project.id}>
                <div className="project-card-image">
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                  />
                  <div className="project-card-overlay">
                    <span className="category-tag" style={{ background: "rgba(7, 23, 39, 0.8)", color: "#fce08b" }}>
                      {project.category}
                    </span>
                  </div>
                </div>

                <div className="project-card-body">
                  <div className="project-meta-row">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={13} color="var(--secondary-dark)" />
                      {project.location}
                    </span>
                    <span>{project.year}</span>
                  </div>

                  <h3>{project.title}</h3>
                  <p>{project.description}</p>

                  <div className="project-scope-tags">
                    {project.scope.map((tag, idx) => (
                      <span className="project-scope-tag" key={idx}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 8. TESTIMONIALS ================= */}
      <section className="home-testimonials section">
        <div className="container">
          <div className="section-heading centered">
            <span className="section-label">CLIENT TRUST & ENDORSEMENTS</span>
            <h2>What Our Clients Say</h2>
            <p>
              We take pride in long-term relationships built on transparent delivery,
              prompt responsiveness, and consistent quality.
            </p>
          </div>

          <div className="three-column">
            {testimonialsData.slice(0, 3).map((t) => (
              <div className="testimonial-card" key={t.id}>
                <div className="testimonial-stars">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star size={18} fill="#d7a928" color="#d7a928" key={i} />
                  ))}
                </div>

                <p className="testimonial-message">"{t.text}"</p>

                <div className="testimonial-author">
                  <strong>{t.name}</strong>
                  <span>{t.role} • {t.company}</span>
                  <small style={{ color: "var(--secondary-dark)", marginTop: "3px" }}>
                    Verified Partner • Qatar
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 9. HOME FAQ ACCORDION ================= */}
      <section className="home-faq section section-light">
        <div className="container faq-container">
          <div className="section-heading centered">
            <span className="section-label">QUICK ANSWERS</span>
            <h2>Frequently Asked Questions</h2>
            <p>
              Have questions about hiring GSC or requesting service contracts in Qatar?
            </p>
          </div>

          <div className="faq-list">
            {faqsData.slice(0, 4).map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  className={`faq-item ${isOpen ? "faq-open" : ""}`}
                  key={faq.question}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                  </button>

                  {isOpen && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: "35px" }}>
            <Link to="/faq" className="button button-outline">
              <span>View All Frequently Asked Questions</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 10. FINAL HIGH-IMPACT CTA ================= */}
      <section className="home-final-cta">
        <div className="final-cta-background">
          {heroImage && (
            <img
              src={heroImage}
              alt="GSC Qatar Contracting"
              loading="lazy"
            />
          )}
        </div>

        <div className="final-cta-overlay"></div>

        <div className="container final-cta-content">
          <div className="final-cta-text">
            <span className="section-label light-label">LET'S COLLABORATE</span>
            <h2>Ready to Elevate Your Service Standards in Qatar?</h2>
            <p>
              Whether you need daily janitorial staff, emergency AC maintenance,
              skilled workforce supply, or turnkey civil construction, GSC is
              ready to serve you.
            </p>
          </div>

          <div className="final-cta-actions">
            <Link to="/request-quote" className="button button-primary">
              <span>Request a Quote Now</span>
              <ArrowRight size={17} />
            </Link>

            <a
              href={`tel:${companyInfo.phoneRaw}`}
              className="button button-light"
            >
              <Phone size={17} />
              <span>Call +974 7025 2552</span>
            </a>

            <a
              href={companyInfo.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button"
              style={{ background: "#25d366", color: "#fff" }}
            >
              <MessageCircle size={18} />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;