import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Target,
  Eye,
  ShieldCheck,
  Users,
  Award,
  ArrowRight,
  Building2,
  Clock,
  Sparkles,
  Phone,
} from "lucide-react";
import { companyInfo, companyStats } from "../data/websiteData";

function About() {
  return (
    <main>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>About Us</span>
          </div>

          <span className="section-label">WHO WE ARE</span>

          <h1>About Genting Services & Contracting</h1>

          <p>
            Established in 2018, GSC is a dynamic multi-disciplinary service and contracting
            leader in Doha, Qatar. We empower businesses with comprehensive facility care,
            skilled workforce solutions, technical maintenance, and civil execution.
          </p>
        </div>
      </section>

      {/* Introduction & Highlights */}
      <section className="section">
        <div className="container two-column">
          <div>
            <span className="section-label">OUR HERITAGE</span>

            <h2>
              Building Long-Term Operational
              <span className="gold-text"> Reliability in Qatar.</span>
            </h2>

            <p style={{ marginTop: "16px", fontSize: "1.05rem", lineHeight: "1.7" }}>
              Genting Services & Contracting was founded with a singular ambition:
              to provide corporate enterprises, government facilities, hospitality venues,
              and contractors across Qatar with dependable, multi-capability support.
            </p>

            <p style={{ marginTop: "14px", lineHeight: "1.7" }}>
              Whether you need daily janitorial staff, certified pest prevention,
              turnkey office renovations, or emergency AC and electrical maintenance,
              GSC combines deep local expertise with international execution standards.
            </p>

            <div style={{ display: "flex", gap: "16px", marginTop: "28px", flexWrap: "wrap" }}>
              <Link to="/services" className="button button-primary">
                <span>Explore Our Services</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="button button-navy">
                <span>Contact Our Office</span>
              </Link>
            </div>
          </div>

          <div className="about-highlight-card">
            <div className="about-icon">
              <ShieldCheck size={32} />
            </div>

            <h3>Trusted Quality & Safety</h3>

            <p>
              We operate under strict Quality, Health, Safety, and Environmental (QHSE)
              guidelines, ensuring full compliance with Qatar national regulations.
            </p>

            <div className="about-check">
              <CheckCircle2 size={19} />
              <span>Full compliance with Qatar Labor Laws</span>
            </div>

            <div className="about-check">
              <CheckCircle2 size={19} />
              <span>Municipality and Civil Defense compliant methods</span>
            </div>

            <div className="about-check">
              <CheckCircle2 size={19} />
              <span>Dedicated on-site supervisors & project managers</span>
            </div>

            <div className="about-check">
              <CheckCircle2 size={19} />
              <span>Transparent commercial structures & SLA commitments</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="capabilities-strip">
        <div className="container capabilities-grid">
          {companyStats.map((stat) => (
            <div className="capability-item" key={stat.label}>
              <div className="cap-icon-box">
                <Sparkles size={24} />
              </div>
              <div>
                <strong>
                  {stat.value}
                  {stat.suffix}
                </strong>
                <span>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission, Vision, People */}
      <section className="section section-light">
        <div className="container">
          <div className="section-heading centered">
            <span className="section-label">STRATEGIC PILLARS</span>
            <h2>Our Purpose, Vision & People</h2>
            <p>
              Guiding our daily operations, workforce development, and long-term client
              partnerships across the State of Qatar.
            </p>
          </div>

          <div className="three-column">
            <div className="info-card">
              <div className="info-card-icon">
                <Target size={28} />
              </div>
              <h3>Our Mission</h3>
              <p>
                To deliver uncompromising, dependable services that streamline facility
                operations, enhance workspace environments, and safeguard client assets
                with safety and cost transparency.
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <Eye size={28} />
              </div>
              <h3>Our Vision</h3>
              <p>
                To be recognized as Qatar’s most trusted and responsive multi-service
                contracting provider, distinguished by engineering excellence, ethical
                labor practices, and enduring client loyalty.
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <Users size={28} />
              </div>
              <h3>Our People</h3>
              <p>
                Our team represents our greatest strength. From senior project directors
                to skilled tradesmen, every team member undergoes rigorous induction,
                safety training, and quality monitoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Pillars */}
      <section className="section">
        <div className="container">
          <div className="section-heading centered">
            <span className="section-label">THE GSC ADVANTAGE</span>
            <h2>Why Organizations Partner With Us</h2>
            <p>
              Four key pillars that set Genting Services & Contracting apart in Qatar.
            </p>
          </div>

          <div className="four-column">
            <div className="info-card">
              <div className="info-card-icon">
                <ShieldCheck size={26} />
              </div>
              <h3>Regulatory Rigor</h3>
              <p>
                Every employee holds valid QIDs, medical clearances, and safety inductions,
                guaranteeing zero legal compliance risk.
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <Building2 size={26} />
              </div>
              <h3>Single Accountability</h3>
              <p>
                Instead of managing 5 different vendors, work with one dedicated account
                manager who coordinates all required trades.
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <Clock size={26} />
              </div>
              <h3>Punctual Mobilization</h3>
              <p>
                Rapid response times for scheduled contracts and emergency call-outs
                alike, minimizing costly operational downtime.
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <Award size={26} />
              </div>
              <h3>Quality Deliverables</h3>
              <p>
                Structured checklists, verified inspection logs, and client sign-offs
                guarantee high satisfaction every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div>
            <span className="section-label light-label">PARTNER WITH GSC</span>
            <h2>Looking for a Reliable Contracting & Service Partner?</h2>
            <p>
              Contact our team today to discuss your facility needs, upcoming projects,
              or request an on-site survey anywhere in Qatar.
            </p>
          </div>

          <div className="cta-buttons">
            <Link to="/request-quote" className="button button-primary">
              <span>Request a Quote</span>
              <ArrowRight size={16} />
            </Link>

            <a href={`tel:${companyInfo.phoneRaw}`} className="button button-light">
              <Phone size={16} />
              <span>{companyInfo.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default About;