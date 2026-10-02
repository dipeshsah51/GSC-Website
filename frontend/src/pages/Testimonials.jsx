import { Link } from "react-router-dom";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Building2,
  Users,
} from "lucide-react";
import { testimonialsData } from "../data/websiteData";

function Testimonials() {
  return (
    <main>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Testimonials</span>
          </div>

          <span className="section-label">CLIENT EXPERIENCES</span>

          <h1>What Our Clients Say About GSC</h1>

          <p>
            Real feedback from facilities managers, project directors, and corporate
            executives who trust Genting Services & Contracting across Qatar.
          </p>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="capabilities-strip">
        <div className="container capabilities-grid">
          <div className="capability-item">
            <div className="cap-icon-box">
              <Star size={26} />
            </div>
            <div>
              <strong>4.9 / 5.0 Rating</strong>
              <span>Across Qatar commercial accounts</span>
            </div>
          </div>

          <div className="capability-item">
            <div className="cap-icon-box">
              <Building2 size={26} />
            </div>
            <div>
              <strong>150+ Enterprises</strong>
              <span>Towers, hotels, and complexes</span>
            </div>
          </div>

          <div className="capability-item">
            <div className="cap-icon-box">
              <ShieldCheck size={26} />
            </div>
            <div>
              <strong>98% Retention</strong>
              <span>Long-term contract renewals</span>
            </div>
          </div>

          <div className="capability-item">
            <div className="cap-icon-box">
              <Users size={26} />
            </div>
            <div>
              <strong>Dedicated Support</strong>
              <span>On-site supervisors on call</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="section">
        <div className="container">
          <div className="section-heading centered">
            <span className="section-label">CLIENT TESTIMONIALS</span>
            <h2>Proven Performance in Qatar</h2>
            <p>
              Read verified testimonials from leaders in facilities management, event
              production, civil contracting, and hospitality.
            </p>
          </div>

          <div className="two-column" style={{ alignItems: "stretch", gap: "28px" }}>
            {testimonialsData.map((t) => (
              <article className="testimonial-card" key={t.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <div className="testimonial-stars">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star size={18} fill="#d7a928" color="#d7a928" key={i} />
                    ))}
                  </div>

                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-light)",
                      fontWeight: 600,
                    }}
                  >
                    {t.date}
                  </span>
                </div>

                <p className="testimonial-message">"{t.text}"</p>

                <div className="testimonial-author">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong>{t.name}</strong>
                    <CheckCircle2 size={15} color="var(--success)" />
                  </div>
                  <span>
                    {t.role} • <strong>{t.company}</strong>
                  </span>
                  <small style={{ color: "var(--secondary-dark)", marginTop: "4px" }}>
                    Verified Client • Doha, Qatar
                  </small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div>
            <span className="section-label light-label">BECOME A PARTNER</span>
            <h2>Experience the GSC Difference for Your Property</h2>
            <p>
              Join the growing list of reputable organizations across Qatar relying on GSC
              for facility maintenance, cleaning, manpower, and contracting.
            </p>
          </div>

          <div className="cta-buttons">
            <Link to="/request-quote" className="button button-primary">
              <span>Request a Quote</span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/contact" className="button button-light">
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Testimonials;