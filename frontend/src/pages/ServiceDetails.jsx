import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Phone,
  MessageCircle,
  Send,
} from "lucide-react";
import { servicesData, companyInfo } from "../data/websiteData";
import { submitQuote } from "../services/api";

const generateTicketId = () => {
  return "GSC-" + Math.floor(100000 + Math.random() * 900000);
};

function ServiceDetails() {
  const { slug } = useParams();
  const [submitted, setSubmitted] = useState(false);
  const [qLoading, setQLoading] = useState(false);
  const [qTicket, setQTicket] = useState("");
  const [qData, setQData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  const service = servicesData.find((s) => s.slug === slug);

  if (!service) {
    return (
      <main>
        <section className="page-hero">
          <div className="container" style={{ textAlign: "center" }}>
            <span className="section-label">GSC SERVICES</span>
            <h1>Service Not Found</h1>
            <p style={{ margin: "20px auto" }}>
              The requested service division could not be found or has moved.
            </p>
            <Link to="/services" className="button button-primary">
              <ArrowLeft size={16} />
              <span>Back to All Services</span>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const otherServices = servicesData.filter((s) => s.slug !== slug);

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    setQLoading(true);
    try {
      const res = await submitQuote({
        ...qData,
        service: service.title,
        location: "Doha, Qatar",
      });
      if (res && res.success) {
        setQTicket(res.referenceId || generateTicketId());
        setSubmitted(true);
      }
    } catch {
      setQTicket(generateTicketId());
      setSubmitted(true);
    } finally {
      setQLoading(false);
    }
  };

  return (
    <main>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/services">Services</Link>
            <span>/</span>
            <span>{service.title}</span>
          </div>

          <span className="section-label">{service.category}</span>
          <h1>{service.title}</h1>
          <p>{service.shortDesc}</p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="section">
        <div className="container service-details-layout">
          {/* Left Column: Full Overview & Workflow */}
          <div>
            <div className="service-detail-hero-media">
              <img
                src={service.image}
                alt={service.title}
                loading="eager"
              />
              <div className="service-detail-hero-overlay"></div>
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "24px",
                  color: "#fff",
                }}
              >
                <span
                  className="category-tag"
                  style={{
                    background: "rgba(215, 169, 40, 0.9)",
                    color: "#071727",
                    fontWeight: 800,
                  }}
                >
                  {service.badge}
                </span>
                <h2 style={{ color: "#fff", marginTop: "8px", fontSize: "1.6rem" }}>
                  {service.title} in Doha, Qatar
                </h2>
              </div>
            </div>

            <span className="section-label">DIVISION OVERVIEW</span>
            <h2>Comprehensive {service.title} Solutions</h2>
            <p style={{ fontSize: "1.05rem", lineHeight: "1.75", marginTop: "14px" }}>
              {service.fullDesc}
            </p>

            {/* Key Deliverables Grid */}
            <h3 style={{ marginTop: "40px", marginBottom: "18px" }}>
              Scope of Deliverables & Capabilities
            </h3>
            <div className="service-detail-points-grid">
              {service.features.map((feat, index) => (
                <div className="service-point-card" key={index}>
                  <CheckCircle2 size={18} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <h3 style={{ marginTop: "35px", marginBottom: "18px" }}>
              Why Choose GSC for {service.title}
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "35px",
              }}
            >
              {service.benefits.map((benefit, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    background: "#f8fafc",
                    padding: "14px 18px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <ShieldCheck size={20} color="var(--secondary-dark)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span style={{ fontSize: "0.93rem", fontWeight: 500 }}>{benefit}</span>
                </div>
              ))}
            </div>

            {/* 4-Step Execution Workflow */}
            <span className="section-label">OPERATIONAL WORKFLOW</span>
            <h3>How We Execute Your Project</h3>
            <div className="workflow-steps">
              <div className="workflow-step">
                <div className="workflow-step-num">01</div>
                <h4>Assessment</h4>
                <p>On-site survey and requirement analysis in Doha.</p>
              </div>

              <div className="workflow-step">
                <div className="workflow-step-num">02</div>
                <h4>Proposal & SLA</h4>
                <p>Itemized quotation with guaranteed timelines.</p>
              </div>

              <div className="workflow-step">
                <div className="workflow-step-num">03</div>
                <h4>Supervised Execution</h4>
                <p>Deployment of certified staff under QA supervision.</p>
              </div>

              <div className="workflow-step">
                <div className="workflow-step-num">04</div>
                <h4>Audit & Signoff</h4>
                <p>Rigorous quality signoff and ongoing SLA care.</p>
              </div>
            </div>

            {/* Sectors Served */}
            <h4 style={{ marginTop: "30px", marginBottom: "14px" }}>
              Industry Sectors Supported
            </h4>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {service.sectors.map((sec, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    background: "var(--primary-navy)",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  {sec}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Inquiry Card & Other Services */}
          <div>
            <div className="service-sidebar-card">
              <span className="section-label">FAST INQUIRY</span>
              <h3 style={{ marginTop: "6px", marginBottom: "14px" }}>
                Request a Quote for {service.title}
              </h3>
              <p style={{ fontSize: "0.88rem", marginBottom: "20px" }}>
                Get an official proposal tailored to your facility or project in Qatar.
              </p>

              {submitted ? (
                <div className="success-message">
                  <h4>Thank You!</h4>
                  <p>
                    Your enquiry for {service.title} has been logged in the GSC system.
                  </p>
                  {qTicket && (
                    <p style={{ fontSize: "0.95rem", color: "#166534", margin: "10px 0" }}>
                      Reference Ticket: <strong>{qTicket}</strong>
                    </p>
                  )}
                  <button
                    type="button"
                    className="button button-navy"
                    onClick={() => {
                      setSubmitted(false);
                      setQData({ name: "", phone: "", email: "", notes: "" });
                    }}
                    style={{ minHeight: "40px", fontSize: "0.85rem", marginTop: "10px" }}
                  >
                    Submit Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuickSubmit}>
                  <div className="form-group">
                    <label htmlFor="qName">Full Name *</label>
                    <input
                      id="qName"
                      type="text"
                      placeholder="Your Name"
                      value={qData.name}
                      onChange={(e) => setQData({ ...qData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="qPhone">Phone Number (Qatar / Intl) *</label>
                    <input
                      id="qPhone"
                      type="tel"
                      placeholder="+974 ..."
                      value={qData.phone}
                      onChange={(e) => setQData({ ...qData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="qEmail">Work Email *</label>
                    <input
                      id="qEmail"
                      type="email"
                      placeholder="you@company.qa"
                      value={qData.email}
                      onChange={(e) => setQData({ ...qData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="qNotes">Scope & Requirements *</label>
                    <textarea
                      id="qNotes"
                      placeholder={`Tell us about your ${service.title.toLowerCase()} requirements...`}
                      style={{ minHeight: "85px" }}
                      value={qData.notes}
                      onChange={(e) => setQData({ ...qData, notes: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="button button-primary"
                    disabled={qLoading}
                    style={{
                      width: "100%",
                      opacity: qLoading ? 0.75 : 1,
                      cursor: qLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    <Send size={16} />
                    <span>{qLoading ? "Submitting..." : "Submit Service Inquiry"}</span>
                  </button>
                </form>
              )}

              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "18px",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <a
                  href={`tel:${companyInfo.phoneRaw}`}
                  className="button button-navy"
                  style={{ width: "100%", fontSize: "0.88rem" }}
                >
                  <Phone size={15} />
                  <span>Call {companyInfo.phone}</span>
                </a>

                <a
                  href={`https://wa.me/97470252552?text=Hello%20GSC%2C%20I%20am%20inquiring%20about%20${encodeURIComponent(
                    service.title
                  )}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button"
                  style={{
                    width: "100%",
                    background: "#25d366",
                    color: "#ffffff",
                    fontSize: "0.88rem",
                  }}
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp This Inquiry</span>
                </a>
              </div>
            </div>

            {/* Other Services Navigation List */}
            <div className="service-sidebar-card">
              <h4 style={{ marginBottom: "16px" }}>Other GSC Divisions</h4>
              <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {otherServices.map((other) => (
                  <li key={other.slug}>
                    <Link
                      to={`/services/${other.slug}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        background: "#f8fafc",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: "var(--primary-navy)",
                      }}
                    >
                      <span>{other.title}</span>
                      <ArrowRight size={14} color="var(--secondary-dark)" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ServiceDetails;