import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Minus,
  Search,
  HelpCircle,
  Phone,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { faqsData, companyInfo } from "../data/websiteData";

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All",
    "General & Overview",
    "Quotations & Contracts",
    "Compliance & Safety",
    "Services & Manpower",
  ];

  const filteredFaqs = faqsData.filter((faq) => {
    const matchesCat =
      selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <main>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>FAQ</span>
          </div>

          <span className="section-label">KNOWLEDGE BASE</span>

          <h1>Frequently Asked Questions</h1>

          <p>
            Find immediate answers regarding our contracting services, compliance in Qatar,
            quotations, mobilization timelines, and maintenance agreements.
          </p>
        </div>
      </section>

      {/* Main FAQ Section */}
      <section className="section">
        <div className="container faq-container">
          {/* Filter Tabs and Search Bar */}
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
                  className={`filter-tab ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

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
                placeholder="Search questions..."
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

          {/* FAQ Accordion List */}
          {filteredFaqs.length === 0 ? (
            <div
              className="info-card"
              style={{ textAlign: "center", padding: "45px 20px" }}
            >
              <h3>No matching questions found</h3>
              <p>Try searching for a different keyword or contact our support team.</p>
              <button
                className="button button-navy"
                style={{ margin: "20px auto 0" }}
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="faq-list">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <div
                    className={`faq-item ${isOpen ? "faq-open" : ""}`}
                    key={faq.question}
                  >
                    <button
                      className="faq-question"
                      onClick={() => toggleFAQ(index)}
                      aria-expanded={isOpen}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <HelpCircle size={18} color="var(--secondary-dark)" style={{ flexShrink: 0 }} />
                        <span>{faq.question}</span>
                      </div>

                      {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                    </button>

                    {isOpen && (
                      <div className="faq-answer">
                        <span
                          className="category-tag"
                          style={{ marginBottom: "10px", fontSize: "0.72rem" }}
                        >
                          {faq.category}
                        </span>
                        <p style={{ marginTop: "6px" }}>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Still Have Questions Box */}
          <div
            className="info-card"
            style={{
              marginTop: "50px",
              padding: "36px",
              background: "var(--background-light)",
              border: "1.5px solid rgba(215, 169, 40, 0.3)",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "24px",
            }}
          >
            <div>
              <h3>Still Have a Question?</h3>
              <p style={{ margin: "6px 0 0" }}>
                Our team in Doha is available Sunday through Thursday to assist you.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a href={`tel:${companyInfo.phoneRaw}`} className="button button-navy">
                <Phone size={16} />
                <span>Call {companyInfo.phone}</span>
              </a>

              <a
                href={companyInfo.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button"
                style={{ background: "#25d366", color: "#fff" }}
              >
                <MessageCircle size={16} />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div>
            <span className="section-label light-label">FAST PROPOSAL</span>
            <h2>Ready to Receive an Itemized Quotation?</h2>
            <p>
              Submit your project details and our engineers will review your scope within 24 hours.
            </p>
          </div>

          <Link to="/request-quote" className="button button-primary">
            <span>Request a Quote Now</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default FAQ;