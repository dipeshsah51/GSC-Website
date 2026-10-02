import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { companyInfo } from "../data/websiteData";
import { submitContact } from "../services/api";

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Service Inquiry",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await submitContact(formData);
      if (res && res.success) {
        setSubmitted(true);
      } else {
        setError(res?.message || "Failed to submit message. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Failed to send message. Please contact us by phone.");
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
            <span>Contact Us</span>
          </div>

          <span className="section-label">GET IN TOUCH</span>

          <h1>Contact Genting Services & Contracting</h1>

          <p>
            Connect directly with our Doha headquarters for contract inquiries, site
            inspections, emergency maintenance, and quotation requests across Qatar.
          </p>
        </div>
      </section>

      {/* Contact Cards Row */}
      <section className="section" style={{ paddingBottom: "40px" }}>
        <div className="container">
          <div className="four-column">
            <div className="info-card">
              <div className="info-card-icon">
                <MapPin size={26} />
              </div>
              <h3>Head Office</h3>
              <p>
                69 B Ring Road,
                <br />
                Doha, State of Qatar
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <Phone size={26} />
              </div>
              <h3>Direct Helpline</h3>
              <p>
                <a
                  href={`tel:${companyInfo.phoneRaw}`}
                  style={{ fontWeight: 700, color: "var(--primary-navy)" }}
                >
                  {companyInfo.phone}
                </a>
                <br />
                <span style={{ fontSize: "0.82rem", color: "var(--text-light)" }}>
                  Saturday – Thursday
                </span>
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <Mail size={26} />
              </div>
              <h3>Email Inquiries</h3>
              <p>
                <a
                  href={`mailto:${companyInfo.email}`}
                  style={{ fontWeight: 700, color: "var(--primary-navy)" }}
                >
                  {companyInfo.email}
                </a>
                <br />
                <span style={{ fontSize: "0.82rem", color: "var(--text-light)" }}>
                  Fast 24-hr response
                </span>
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <Clock size={26} />
              </div>
              <h3>Working Hours</h3>
              <p>
                <strong>Sat - Thu:</strong> 8:00 AM - 6:00 PM
                <br />
                <span style={{ fontSize: "0.82rem", color: "var(--text-light)" }}>
                  Fri: Emergency Response
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Form & Location Section */}
      <section className="section section-light">
        <div className="container two-column" style={{ alignItems: "start" }}>
          {/* Direct Message Form */}
          <div className="form-card">
            <div className="section-heading" style={{ marginBottom: "25px" }}>
              <span className="section-label">SEND A MESSAGE</span>
              <h2>How Can We Assist You?</h2>
              <p>
                Fill out the form below and an engineering or account specialist will
                reply promptly.
              </p>
            </div>

            {submitted ? (
              <div className="success-message">
                <CheckCircle2 size={44} color="var(--success)" style={{ margin: "0 auto 12px" }} />
                <h3>Message Sent Successfully!</h3>
                <p>
                  Thank you for reaching out to GSC. Our team will review your message
                  and respond within one business day.
                </p>
                <button
                  type="button"
                  className="button button-navy"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      subject: "General Service Inquiry",
                      message: "",
                    });
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Your Name *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g. Tariq Al-Mansoor"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number (Qatar / Intl) *</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+974 7025 2552"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="email">Work Email *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@company.qa"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject / Inquiry Type</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                    >
                      <option value="General Service Inquiry">
                        General Service Inquiry
                      </option>
                      <option value="Cleaning & Hospitality">
                        Cleaning & Hospitality
                      </option>
                      <option value="Manpower Supply">
                        Manpower Supply
                      </option>
                      <option value="Event Management">
                        Event Management
                      </option>
                      <option value="Pest Control">
                        Pest Control
                      </option>
                      <option value="Maintenance & MEP">
                        Maintenance & MEP
                      </option>
                      <option value="General Construction">
                        General Construction
                      </option>
                      <option value="Trading & Contracting">
                        Trading & Contracting
                      </option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Your Message / Project Scope *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Provide details about your project, facility location in Qatar, or timeline..."
                    value={formData.message}
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
                    minHeight: "50px",
                    opacity: loading ? 0.75 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  <Send size={16} />
                  <span>
                    {loading
                      ? "Sending Inquiry to GSC Qatar..."
                      : "Send Direct Message"}
                  </span>
                </button>
              </form>
            )}
          </div>

          {/* Location & Quick Action Sidebar */}
          <div>
            <div className="about-highlight-card" style={{ marginBottom: "26px" }}>
              <div className="about-icon">
                <MapPin size={30} />
              </div>
              <h3>Visit Our Doha Office</h3>
              <p style={{ marginBottom: "20px" }}>
                Our corporate headquarters is conveniently located on 69 B Ring Road in
                central Doha. We welcome clients for scheduled consultations and contract
                discussions.
              </p>

              <div className="about-check">
                <CheckCircle2 size={18} />
                <span>Central Doha accessibility</span>
              </div>

              <div className="about-check">
                <CheckCircle2 size={18} />
                <span>Dedicated visitor parking</span>
              </div>

              <div className="about-check">
                <CheckCircle2 size={18} />
                <span>Senior technical managers on site</span>
              </div>

              <div style={{ marginTop: "25px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a
                  href={`https://maps.google.com/?q=69+B+Ring+Road+Doha+Qatar`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-primary"
                  style={{ fontSize: "0.85rem", minHeight: "42px" }}
                >
                  <span>Open in Google Maps</span>
                </a>

                <a
                  href={companyInfo.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button"
                  style={{
                    background: "#25d366",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    minHeight: "42px",
                  }}
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp Chat</span>
                </a>
              </div>
            </div>

            {/* Need Quote Card */}
            <div className="info-card">
              <span className="section-label">INSTANT QUOTE</span>
              <h3 style={{ marginTop: "8px" }}>Looking for a Formal Quotation?</h3>
              <p style={{ margin: "8px 0 20px" }}>
                Use our dedicated quotation form to specify your service division,
                property dimensions, and preferred timeline.
              </p>
              <Link to="/request-quote" className="button button-navy" style={{ width: "100%" }}>
                <span>Go to Quotation Form</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Contact;