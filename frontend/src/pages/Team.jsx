import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Users,
  ShieldCheck,
  ArrowRight,
  Phone,
} from "lucide-react";
import { teamMembers, companyInfo } from "../data/websiteData";

function Team() {
  return (
    <main>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Team</span>
          </div>

          <span className="section-label">LEADERSHIP & MANAGEMENT</span>

          <h1>Meet the People Behind GSC</h1>

          <p>
            Our seasoned leadership and operational management bring decades of
            collective experience delivering multi-disciplinary services across Qatar.
          </p>
        </div>
      </section>

      {/* Leadership Grid */}
      <section className="section">
        <div className="container">
          <div className="section-heading centered">
            <span className="section-label">EXECUTIVE TEAM</span>
            <h2>Leadership Committed to Excellence</h2>
            <p>
              Combining strategic vision, rigorous site governance, and dedicated client
              support for operations throughout Doha and beyond.
            </p>
          </div>

          <div className="team-grid">
            {teamMembers.map((member) => (
              <article className="team-card" key={member.name}>
                <div className="team-photo-placeholder">
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "rgba(215, 169, 40, 0.15)",
                      border: "2px solid #d7a928",
                      display: "grid",
                      placeItems: "center",
                      color: "#d7a928",
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.8rem",
                      fontWeight: 800,
                    }}
                  >
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>

                  <span
                    className="category-tag"
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      background: "rgba(7, 23, 39, 0.8)",
                      color: "#fce08b",
                      border: "1px solid rgba(215, 169, 40, 0.3)",
                    }}
                  >
                    {member.department}
                  </span>
                </div>

                <div className="team-card-content">
                  <h3>{member.name}</h3>
                  <div className="team-role">{member.role}</div>
                  <p className="team-bio">{member.bio}</p>

                  <div className="team-focus">
                    <strong>Focus:</strong> {member.focus}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Company Departmental Pillars */}
      <section className="section section-light">
        <div className="container">
          <div className="section-heading centered">
            <span className="section-label">OPERATIONAL GOVERNANCE</span>
            <h2>Organized for Rapid Field Execution</h2>
            <p>
              Every department works in coordination to guarantee seamless service delivery
              and prompt issue resolution.
            </p>
          </div>

          <div className="three-column">
            <div className="info-card">
              <div className="info-card-icon">
                <BriefcaseBusiness size={28} />
              </div>
              <h3>Strategic Account Management</h3>
              <p>
                Direct client point of contact ensuring contract SLAs are respected,
                routine reviews are conducted, and billing is transparent.
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <ShieldCheck size={28} />
              </div>
              <h3>QHSE & Safety Control</h3>
              <p>
                Strict enforcement of health, environmental, and personal protective
                equipment (PPE) guidelines across all job sites in Qatar.
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <Users size={28} />
              </div>
              <h3>Workforce Logistics & Welfare</h3>
              <p>
                Comprehensive management of personnel transport, housing, health compliance,
                and technical trade training for high morale and retention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div>
            <span className="section-label light-label">DIRECT COLLABORATION</span>
            <h2>Speak Directly With Our Leadership Team</h2>
            <p>
              Discuss your commercial service requirements or schedule a meeting at our
              Doha office on B Ring Road.
            </p>
          </div>

          <div className="cta-buttons">
            <Link to="/contact" className="button button-primary">
              <span>Contact GSC Office</span>
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

export default Team;