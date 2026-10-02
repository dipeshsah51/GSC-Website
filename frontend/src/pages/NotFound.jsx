import { Link } from "react-router-dom";
import { Home, Phone } from "lucide-react";
import { companyInfo } from "../data/websiteData";

function NotFound() {
  return (
    <main>
      <section className="page-hero" style={{ textAlign: "center" }}>
        <div className="container">
          <span className="section-label">PAGE NOT FOUND</span>
          <h1 style={{ margin: "20px auto" }}>404 - Page Not Found</h1>
          <p style={{ margin: "0 auto" }}>
            The page you are looking for might have been moved, removed, or is temporarily unavailable.
          </p>
        </div>
      </section>

      <section className="section" style={{ textAlign: "center", padding: "80px 0" }}>
        <div className="container" style={{ maxWidth: "600px" }}>
          <div className="info-card" style={{ padding: "40px", alignItems: "center" }}>
            <div className="info-card-icon" style={{ width: "70px", height: "70px", fontSize: "28px" }}>
              404
            </div>
            <h3>Looking for GSC Services?</h3>
            <p style={{ marginBottom: "25px" }}>
              Explore our comprehensive divisions or reach out directly to our team in Doha, Qatar.
            </p>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
              <Link to="/" className="button button-primary">
                <Home size={16} />
                Return to Homepage
              </Link>
              <Link to="/services" className="button button-navy">
                Explore Services
              </Link>
              <a href={`tel:${companyInfo.phoneRaw}`} className="button button-outline">
                <Phone size={16} />
                Call Helpline
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default NotFound;
