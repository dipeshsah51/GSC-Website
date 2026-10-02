import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Search,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { servicesData, companyInfo } from "../data/websiteData";

function Services() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All",
    "Facility Services",
    "Technical Services",
    "Workforce Solutions",
    "Contracting & Civil",
    "Event Operations",
    "Hygiene & Safety",
  ];

  const filteredServices = servicesData.filter((service) => {
    const matchesCategory =
      activeCategory === "All" || service.category === activeCategory;
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Services</span>
          </div>

          <span className="section-label">WHAT WE DELIVER</span>

          <h1>Our Core Service Divisions</h1>

          <p>
            Comprehensive commercial, technical, and contracting solutions engineered
            for corporate enterprises, property managers, and main contractors in Qatar.
          </p>
        </div>
      </section>

      {/* Services Directory */}
      <section className="section">
        <div className="container">
          {/* Controls: Category Filter + Search */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
              marginBottom: "35px",
            }}
          >
            <div className="filter-tabs" style={{ marginBottom: 0 }}>
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

            {/* Quick Search */}
            <div style={{ position: "relative", minWidth: "260px" }}>
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-light)",
                }}
              />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 16px 10px 40px",
                  borderRadius: "var(--radius-full)",
                  border: "1.5px solid var(--border)",
                  outline: "none",
                  fontSize: "0.9rem",
                }}
              />
            </div>
          </div>

          {/* Service Cards Grid */}
          {filteredServices.length === 0 ? (
            <div
              className="info-card"
              style={{ textAlign: "center", padding: "50px 20px" }}
            >
              <h3>No services match your search</h3>
              <p>Try searching for a different keyword or view all categories.</p>
              <button
                className="button button-navy"
                style={{ margin: "20px auto 0" }}
                onClick={() => {
                  setActiveCategory("All");
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
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
                    <h3 style={{ marginTop: "10px" }}>{service.title}</h3>
                    <p>{service.shortDesc}</p>

                    <div className="service-features-list">
                      {service.features.slice(0, 3).map((feat, idx) => (
                        <div className="service-feature-bullet" key={idx}>
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
                        <span>View Details</span>
                        <ArrowRight size={16} />
                      </Link>

                      <Link
                        to="/request-quote"
                        className="button button-primary"
                        style={{
                          minHeight: "36px",
                          padding: "0 14px",
                          fontSize: "0.82rem",
                        }}
                      >
                        Get Quote
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Our Service Approach */}
      <section className="section section-light">
        <div className="container">
          <div className="section-heading centered">
            <span className="section-label">UNIFIED CONTRACTING</span>
            <h2>The GSC Service Standard</h2>
            <p>
              Experience seamless execution backed by rigorous Quality Assurance and
              dedicated on-site coordination.
            </p>
          </div>

          <div className="three-column">
            <div className="info-card">
              <div className="info-card-icon">
                <ShieldCheck size={28} />
              </div>
              <h3>100% Legal & Safety Adherence</h3>
              <p>
                Strict conformity to Qatar Ministry of Labor, Municipality, and Civil Defense
                mandates. All staff carry required certifications and insurance.
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <Sparkles size={28} />
              </div>
              <h3>Customized Contract Models</h3>
              <p>
                We adapt to your commercial model: one-off urgent interventions, monthly
                retainers, or comprehensive Annual Maintenance Contracts (AMC).
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <MessageCircle size={28} />
              </div>
              <h3>Fast Quotations & On-Site Audits</h3>
              <p>
                Our engineering team conducts prompt site surveys across Doha and submits
                itemized, transparent proposals within 24 business hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div>
            <span className="section-label light-label">CUSTOM CONTRACTING</span>
            <h2>Need a Tailored Multi-Division Proposal?</h2>
            <p>
              Combine facility cleaning, preventive maintenance, and skilled manpower under a
              single cost-effective service agreement.
            </p>
          </div>

          <div className="cta-buttons">
            <Link to="/request-quote" className="button button-primary">
              <span>Request Custom Proposal</span>
              <ArrowRight size={16} />
            </Link>

            <a
              href={companyInfo.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-light"
            >
              <MessageCircle size={16} />
              <span>WhatsApp Inquiry</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Services;