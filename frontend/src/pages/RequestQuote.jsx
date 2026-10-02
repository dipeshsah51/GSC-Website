import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Send,
  Phone,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { servicesData, companyInfo } from "../data/websiteData";
import { submitQuote } from "../services/api";

const generateTicketId = () => {
  return "GSC-" + Math.floor(100000 + Math.random() * 900000);
};

function RequestQuote() {
  const [submitted, setSubmitted] = useState(false);
  const [quoteId, setQuoteId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    service: "cleaning-and-hospitality",
    location: "Doha (West Bay / Downtown)",
    contractType: "One-Time Project",
    timeline: "Immediately (Within 48 hours)",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const serviceObj = servicesData.find((s) => s.slug === formData.service);
      const cleanService = serviceObj ? serviceObj.title : formData.service;

      const res = await submitQuote({
        ...formData,
        service: cleanService,
      });

      if (res && res.success) {
        setQuoteId(res.referenceId || generateTicketId());
        setSubmitted(true);
      } else {
        setError(res?.message || "Unable to submit quote. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Connection error. Please try again.");
    } finally {
      setLoading(false);
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
            <span>Request a Quote</span>
          </div>

          <span className="section-label">COMMERCIAL PROPOSALS</span>

          <h1>Request an Official Quotation</h1>

          <p>
            Tell us about your service or project requirements in Qatar. Our engineering
            and commercial team will evaluate your scope and prepare a transparent,
            itemized proposal within 24 business hours.
          </p>
        </div>
      </section>

      {/* Main Quote Form Section */}
      <section className="section">
        <div className="container">
          <div className="two-column" style={{ alignItems: "start" }}>
            {/* Form Column */}
            <div className="form-card">
              <div className="section-heading" style={{ marginBottom: "25px" }}>
                <span className="section-label">PROJECT SPECIFICATIONS</span>
                <h2>Quotation Application</h2>
                <p>
                  Please provide as much operational detail as possible to help us
                  prepare an accurate estimate.
                </p>
              </div>

              {submitted ? (
                <div className="success-message">
                  <CheckCircle2
                    size={48}
                    color="var(--success)"
                    style={{ margin: "0 auto 12px" }}
                  />
                  <h3>Quotation Request Received!</h3>
                  <p style={{ fontSize: "1rem", color: "#166534" }}>
                    Your reference number is <strong>{quoteId}</strong>.
                  </p>
                  <p style={{ marginTop: "10px", color: "var(--text-muted)", fontSize: "0.92rem" }}>
                    Our commercial estimators have received your inquiry for{" "}
                    <strong>
                      {servicesData.find((s) => s.slug === formData.service)?.title ||
                        formData.service}
                    </strong>{" "}
                    in {formData.location}. We will review the specifications and contact you shortly.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      justifyContent: "center",
                      marginTop: "24px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      className="button button-navy"
                      onClick={() => setSubmitted(false)}
                    >
                      Submit Another Request
                    </button>

                    <a
                      href={`https://wa.me/97470252552?text=Hello%20GSC%2C%20I%20have%20submitted%20quote%20request%20ref%20${quoteId}%20for%20${encodeURIComponent(
                        formData.service
                      )}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button"
                      style={{ background: "#25d366", color: "#fff" }}
                    >
                      <MessageCircle size={16} />
                      <span>Follow Up on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Contact Info */}
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="e.g. Puskar Raidas"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="company">Company / Organization Name</label>
                      <input
                        id="company"
                        type="text"
                        name="company"
                        placeholder="e.g. Al-Raya Holding"
                        value={formData.company}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="email">Work Email *</label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="you@company.qa"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number (Qatar / Intl) *</label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        placeholder="+974 7025 2552"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Service Division Selection */}
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="service">Primary Service Division *</label>
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        required
                      >
                        {servicesData.map((s) => (
                          <option key={s.slug} value={s.slug}>
                            {s.title}
                          </option>
                        ))}
                        <option value="multi-division-facility">
                          Multi-Division Package (Cleaning + Maintenance)
                        </option>
                        <option value="other-contracting">
                          Other Contracting / Trading Requirement
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="location">Project Location in Qatar *</label>
                      <select
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                      >
                        <option value="Doha (West Bay / Downtown)">
                          Doha (West Bay / Downtown)
                        </option>
                        <option value="Lusail City">Lusail City</option>
                        <option value="The Pearl-Qatar">The Pearl-Qatar</option>
                        <option value="Al Wakrah & Mesaieed">
                          Al Wakrah & Mesaieed
                        </option>
                        <option value="Al Rayyan & Education City">
                          Al Rayyan & Education City
                        </option>
                        <option value="Doha Industrial Area">
                          Doha Industrial Area
                        </option>
                        <option value="Al Khor & Ras Laffan">
                          Al Khor & Ras Laffan
                        </option>
                        <option value="Other Area in Qatar">
                          Other Area in Qatar
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Contract Type & Timeline */}
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="contractType">Contract Structure</label>
                      <select
                        id="contractType"
                        name="contractType"
                        value={formData.contractType}
                        onChange={handleChange}
                      >
                        <option value="One-Time Project">
                          One-Time Project / Turnkey Job
                        </option>
                        <option value="Monthly Scheduled Contract">
                          Monthly Scheduled Service
                        </option>
                        <option value="Annual Maintenance Contract (AMC)">
                          Annual Maintenance Contract (AMC)
                        </option>
                        <option value="Emergency Rapid Call-Out">
                          Emergency / Rapid Intervention
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="timeline">Desired Start Timeline</label>
                      <select
                        id="timeline"
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                      >
                        <option value="Immediately (Within 48 hours)">
                          Immediately (Within 48 hours)
                        </option>
                        <option value="Within 1 to 2 weeks">
                          Within 1 to 2 weeks
                        </option>
                        <option value="Next month">Next month</option>
                        <option value="Planning / Tender Stage">
                          Planning / Tender Stage
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="form-group">
                    <label htmlFor="notes">
                      Scope Details, Dimensions, or Special Requests *
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      placeholder="Please specify property size (sqm), number of personnel needed, frequency, or technical specifications..."
                      value={formData.notes}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  {error && (
                    <div
                      style={{
                        padding: "12px 16px",
                        background: "#fee2e2",
                        color: "#991b1b",
                        borderRadius: "8px",
                        marginBottom: "16px",
                        fontSize: "0.9rem",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="button button-primary"
                    disabled={loading}
                    style={{
                      width: "100%",
                      minHeight: "52px",
                      opacity: loading ? 0.75 : 1,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    <Send size={18} />
                    <span>
                      {loading
                        ? "Registering Request in GSC System..."
                        : "Submit Quotation Request"}
                    </span>
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar Trust & Contact Card */}
            <div>
              <div className="about-highlight-card" style={{ marginBottom: "26px" }}>
                <div className="about-icon">
                  <ShieldCheck size={32} />
                </div>
                <h3>Our Proposal Guarantee</h3>
                <p style={{ marginBottom: "22px" }}>
                  Every quotation is prepared by seasoned estimators to ensure
                  transparent pricing, complete scope definition, and zero hidden fees.
                </p>

                <div className="about-check">
                  <CheckCircle2 size={18} />
                  <span>24-Hour Proposal Turnaround</span>
                </div>

                <div className="about-check">
                  <CheckCircle2 size={18} />
                  <span>Complimentary Site Survey in Doha</span>
                </div>

                <div className="about-check">
                  <CheckCircle2 size={18} />
                  <span>No-Obligation Transparent Itemization</span>
                </div>

                <div className="about-check">
                  <CheckCircle2 size={18} />
                  <span>Full Compliance with Qatar Regulations</span>
                </div>
              </div>

              {/* Direct Assistance */}
              <div className="info-card">
                <span className="section-label">NEED IMMEDIATE ASSISTANCE?</span>
                <h3 style={{ marginTop: "8px" }}>Speak Directly With Estimators</h3>
                <p style={{ margin: "8px 0 20px" }}>
                  Have an urgent requirement or large tender specification? Call our
                  commercial desk directly.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <a
                    href={`tel:${companyInfo.phoneRaw}`}
                    className="button button-navy"
                    style={{ width: "100%" }}
                  >
                    <Phone size={16} />
                    <span>{companyInfo.phone}</span>
                  </a>

                  <a
                    href={companyInfo.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button"
                    style={{ background: "#25d366", color: "#fff", width: "100%" }}
                  >
                    <MessageCircle size={16} />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default RequestQuote;