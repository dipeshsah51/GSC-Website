import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Building2,
  MessageCircle,
} from "lucide-react";
import { projectsData, companyInfo } from "../data/websiteData";

function Projects() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Facility Services",
    "Technical Services",
    "Workforce Solutions",
    "Contracting & Civil",
    "Event Operations",
    "Hygiene & Safety",
  ];

  const filteredProjects =
    selectedCategory === "All"
      ? projectsData
      : projectsData.filter((p) => p.category === selectedCategory);

  return (
    <main>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Projects</span>
          </div>

          <span className="section-label">TRACK RECORD IN QATAR</span>

          <h1>Featured Projects & Deliverables</h1>

          <p>
            Explore our operational footprint across Doha, Lusail, West Bay, The Pearl,
            and Al Rayyan Industrial Area.
          </p>
        </div>
      </section>

      {/* Projects Showcase */}
      <section className="section">
        <div className="container">
          {/* Category Tabs */}
          <div className="filter-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-tab ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="three-column">
            {filteredProjects.map((project) => (
              <article className="project-card" key={project.id}>
                <div className="project-card-image">
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                  />
                  <div className="project-card-overlay">
                    <span
                      className="category-tag"
                      style={{ background: "rgba(7, 23, 39, 0.85)", color: "#fce08b" }}
                    >
                      {project.category}
                    </span>
                  </div>
                </div>

                <div className="project-card-body">
                  <div className="project-meta-row">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={14} color="var(--secondary-dark)" />
                      {project.location}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={13} color="var(--secondary-dark)" />
                      {project.year}
                    </span>
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

      {/* Trust Quote / Stats */}
      <section className="section section-light">
        <div className="container">
          <div className="section-heading centered">
            <span className="section-label">QATAR EXPERIENCE</span>
            <h2>Proven Execution Across Commercial Sectors</h2>
            <p>
              We partner with facility management groups, main contractors, and private developers
              to ensure high-precision delivery.
            </p>
          </div>

          <div className="three-column">
            <div className="info-card">
              <div className="info-card-icon">
                <Building2 size={28} />
              </div>
              <h3>Commercial & High-Rise Care</h3>
              <p>
                From facade washing to daily janitorial and HVAC monitoring, our teams
                maintain Qatar's landmark corporate properties.
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <ShieldCheck size={28} />
              </div>
              <h3>Critical Facilities & Warehousing</h3>
              <p>
                24/7 preventive maintenance, pest management, and MEP monitoring for
                temperature-sensitive storage and logistics hubs.
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <MapPin size={28} />
              </div>
              <h3>Fast-Track Civil Fitouts</h3>
              <p>
                Turnkey commercial renovations, partition installations, and architectural
                handover executed within stringent deadlines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div>
            <span className="section-label light-label">NEW PROJECT INQUIRY</span>
            <h2>Have an Upcoming Project in Qatar?</h2>
            <p>
              Discuss your project scope with GSC's technical managers and receive an
              itemized quotation with zero obligation.
            </p>
          </div>

          <div className="cta-buttons">
            <Link to="/request-quote" className="button button-primary">
              <span>Request a Quote</span>
              <ArrowRight size={16} />
            </Link>

            <a
              href={companyInfo.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-light"
            >
              <MessageCircle size={16} />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Projects;