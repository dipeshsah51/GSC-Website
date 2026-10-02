import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function Terms() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Terms & Conditions</span>
          </div>

          <span className="section-label">LEGAL & TERMS</span>
          <h1>Terms & Conditions</h1>
          <p>
            General terms and commercial conditions governing services and engagements with
            Genting Services & Contracting in the State of Qatar.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: "860px" }}>
          <div className="info-card" style={{ padding: "40px", gap: "20px" }}>
            <div>
              <h3>1. Scope of Services</h3>
              <p>
                Genting Services & Contracting (GSC) offers specialized commercial and residential
                contracting, facility maintenance, cleaning & hospitality, manpower supply,
                pest control, event management, and trading services in Qatar. All scopes of work
                are formalized in individual service agreements, purchase orders, or approved quotations.
              </p>
            </div>

            <div>
              <h3>2. Quotations & Pricing</h3>
              <p>
                Quotations provided by GSC are valid for 30 calendar days from the date of issue
                unless specified otherwise in writing. Pricing is subject to site surveys and
                confirmation of final operational specifications.
              </p>
            </div>

            <div>
              <h3>3. Regulatory Compliance & Safety</h3>
              <p>
                GSC strictly adheres to the labor laws, municipal safety guidelines, and Civil
                Defense requirements of the State of Qatar. Both parties agree to maintain safe
                working conditions at project locations.
              </p>
            </div>

            <div>
              <h3>4. Governing Law</h3>
              <p>
                These terms, conditions, and any service contracts entered into with GSC shall be
                governed by and construed in accordance with the laws of the State of Qatar.
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

export default Terms;
