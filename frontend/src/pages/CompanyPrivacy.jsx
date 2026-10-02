import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { companyInfo } from "../data/websiteData";

function PrivacyPolicy() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Privacy Policy</span>
          </div>

          <span className="section-label">LEGAL & PRIVACY</span>
          <h1>Privacy Policy</h1>
          <p>
            How Genting Services & Contracting collects, utilizes, and protects your
            data in accordance with the laws of the State of Qatar.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: "860px" }}>
          <div className="info-card" style={{ padding: "40px", gap: "20px" }}>
            <div>
              <h3>1. Overview & Commitment</h3>
              <p>
                Genting Services & Contracting (GSC), based in Doha, Qatar, respects
                your privacy. This Privacy Policy details how personal information
                collected through our website ({window.location.host}) and business communications
                is gathered, processed, and safeguarded.
              </p>
            </div>

            <div>
              <h3>2. Information We Collect</h3>
              <p>
                When you submit an enquiry, request a quotation, or contact our team, we
                may collect your name, corporate email address, telephone number, company
                name, project location in Qatar, and project service requirements.
              </p>
            </div>

            <div>
              <h3>3. How We Use Your Information</h3>
              <p>
                We use collected information solely to respond to your project requests,
                prepare official quotation proposals, coordinate service operations, and
                provide customer support. We do not sell or rent personal information to
                third parties.
              </p>
            </div>

            <div>
              <h3>4. Data Security & Storage</h3>
              <p>
                We implement industry-standard administrative and technical security
                measures to guard your data against unauthorized access, disclosure, or
                destruction in compliance with applicable Qatar data privacy laws.
              </p>
            </div>

            <div>
              <h3>5. Contact for Privacy Inquiries</h3>
              <p>
                If you have questions regarding this Privacy Policy or wish to review the
                information we hold, please contact us at:
                <br />
                <strong>Email:</strong>{" "}
                <a href={`mailto:${companyInfo.email}`} style={{ color: "var(--secondary-dark)" }}>
                  {companyInfo.email}
                </a>
                <br />
                <strong>Phone:</strong> {companyInfo.phone}
                <br />
                <strong>Address:</strong> {companyInfo.address}
              </p>
            </div>

            <div style={{ marginTop: "10px" }}>
              <Link to="/" className="button button-navy">
                <ArrowLeft size={16} />
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PrivacyPolicy;
