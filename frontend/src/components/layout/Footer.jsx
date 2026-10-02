import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { companyInfo, servicesData } from "../../data/websiteData";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      {/* Top Banner strip */}
      <div className="footer-strip">
        <div className="container footer-strip-inner">
          <div className="footer-strip-item">
            <ShieldCheck size={22} />
            <div>
              <strong>Licensed & Registered in Qatar</strong>
              <span>Operating with excellence since {companyInfo.established}</span>
            </div>
          </div>

          <div className="footer-strip-cta">
            <span>Ready to start a project?</span>
            <Link to="/request-quote" className="footer-strip-btn">
              <span>Get Free Quotation</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="footer-main">
        <div className="container footer-grid">
          {/* Company Column */}
          <div className="footer-column footer-company">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-shield">
                <span>G</span>
              </div>
              <div className="footer-logo-text">
                <div className="footer-logo-title">
                  <strong>GSC</strong>
                  <span className="footer-tag">QATAR</span>
                </div>
                <small>Genting Services & Contracting</small>
              </div>
            </Link>

            <p className="footer-bio">
              GSC is Doha's trusted multi-disciplinary contracting and facility
              support partner. We bring quality, compliance, and professional
              standards to every project across Qatar.
            </p>

            <div className="footer-direct-actions">
              <a
                href={companyInfo.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-wa-badge"
              >
                <MessageCircle size={16} />
                <span>Chat on WhatsApp</span>
              </a>
              <a href={`tel:${companyInfo.phoneRaw}`} className="footer-call-badge">
                <Phone size={15} />
                <span>{companyInfo.phone}</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h3 className="footer-heading">Company</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Home Overview</Link>
              </li>
              <li>
                <Link to="/about">About GSC</Link>
              </li>
              <li>
                <Link to="/services">All Services</Link>
              </li>
              <li>
                <Link to="/projects">Featured Projects</Link>
              </li>
              <li>
                <Link to="/gallery">Visual Gallery</Link>
              </li>
              <li>
                <Link to="/team">Leadership & Team</Link>
              </li>
              <li>
                <Link to="/faq">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link to="/contact">Contact Information</Link>
              </li>
              <li>
                <Link to="/request-quote">Request Quotation</Link>
              </li>
              <li>
                <Link to="/admin" style={{ color: "#d7a928" }}>Staff Portal (Login)</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-column">
            <h3 className="footer-heading">Our Divisions</h3>
            <ul className="footer-links">
              {servicesData.map((service) => (
                <li key={service.slug}>
                  <Link to={`/services/${service.slug}`}>
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="footer-column footer-contact">
            <h3 className="footer-heading">Headquarters</h3>

            <div className="contact-item">
              <MapPin size={18} />
              <div>
                <strong>Office Address</strong>
                <span>{companyInfo.address}</span>
              </div>
            </div>

            <div className="contact-item">
              <Phone size={18} />
              <div>
                <strong>Direct Line</strong>
                <a href={`tel:${companyInfo.phoneRaw}`}>{companyInfo.phone}</a>
              </div>
            </div>

            <div className="contact-item">
              <Mail size={18} />
              <div>
                <strong>Email Address</strong>
                <a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a>
              </div>
            </div>

            <div className="contact-item">
              <Clock size={18} />
              <div>
                <strong>Operating Hours</strong>
                <span>{companyInfo.workingHours}</span>
                <small className="footer-subtext">{companyInfo.fridayStatus}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>
            © {currentYear} {companyInfo.name}. All Rights Reserved. Doha, State of Qatar.
          </p>

          <div className="footer-bottom-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <span className="footer-sep">•</span>
            <Link to="/terms">Terms & Conditions</Link>
            <span className="footer-sep">•</span>
            <Link to="/admin" style={{ color: "#d7a928", fontWeight: "600" }}>Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;