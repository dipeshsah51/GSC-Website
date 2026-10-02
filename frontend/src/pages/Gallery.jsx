import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Maximize2,
  X,
} from "lucide-react";
import { servicesData } from "../data/websiteData";

function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeModal, setActiveModal] = useState(null);

  const categories = [
    "All",
    "Facility Services",
    "Technical Services",
    "Workforce Solutions",
    "Contracting & Civil",
    "Event Operations",
    "Hygiene & Safety",
  ];

  const galleryItems = servicesData.map((s) => ({
    id: s.slug,
    title: s.title,
    category: s.category,
    image: s.image,
    badge: s.badge,
    description: s.shortDesc,
    slug: s.slug,
  }));

  const filteredItems =
    selectedCategory === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);

  return (
    <main>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Gallery</span>
          </div>

          <span className="section-label">VISUAL PORTFOLIO</span>

          <h1>GSC Operational Gallery</h1>

          <p>
            Explore our specialized service operations, equipment, skilled teams, and
            project sites across the State of Qatar.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section">
        <div className="container">
          {/* Category Filter Tabs */}
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

          {/* Gallery Media Grid */}
          <div className="gallery-grid">
            {filteredItems.map((item) => (
              <div
                className="gallery-item"
                key={item.id}
                onClick={() => setActiveModal(item)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                />

                <div className="gallery-item-overlay">
                  <span
                    className="category-tag"
                    style={{
                      background: "rgba(7, 23, 39, 0.85)",
                      color: "#fce08b",
                      width: "fit-content",
                      marginBottom: "6px",
                    }}
                  >
                    {item.category}
                  </span>
                  <h3>{item.title}</h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "6px",
                    }}
                  >
                    <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.75)" }}>
                      Click to expand
                    </span>
                    <Maximize2 size={16} color="var(--secondary)" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {activeModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(7, 23, 39, 0.92)",
            backdropFilter: "blur(10px)",
            zIndex: 9999,
            display: "grid",
            placeItems: "center",
            padding: "20px",
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "800px",
              width: "100%",
              background: "#ffffff",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(7, 23, 39, 0.8)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                zIndex: 10,
              }}
              aria-label="Close image preview"
            >
              <X size={20} />
            </button>

            <div style={{ height: "380px", overflow: "hidden" }}>
              <img
                src={activeModal.image}
                alt={activeModal.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <div style={{ padding: "28px" }}>
              <span className="category-tag">{activeModal.category}</span>
              <h3 style={{ marginTop: "8px", fontSize: "1.4rem" }}>
                {activeModal.title}
              </h3>
              <p style={{ marginTop: "8px", marginBottom: "20px" }}>
                {activeModal.description}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  to={`/services/${activeModal.slug}`}
                  className="button button-navy"
                  onClick={() => setActiveModal(null)}
                >
                  <span>Explore Division</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/request-quote"
                  className="button button-primary"
                  onClick={() => setActiveModal(null)}
                >
                  <span>Request a Quote</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Strip */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div>
            <span className="section-label light-label">EXECUTION STANDARDS</span>
            <h2>Experience Professional Service Standards</h2>
            <p>
              Partner with GSC for dependable, supervised operations across Doha and Qatar.
            </p>
          </div>

          <Link to="/request-quote" className="button button-primary">
            <span>Request a Free Quote</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Gallery;