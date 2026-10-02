import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Phone, Mail, MapPin, MessageCircle, ArrowRight } from "lucide-react";
import { companyInfo } from "../../data/websiteData";
import "./Header.css";

const navigation = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Projects", path: "/projects" },
  { name: "Gallery", path: "/gallery" },
  { name: "Team", path: "/team" },
  { name: "FAQ", path: "/faq" },
  { name: "Contact", path: "/contact" },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      {/* Top information bar */}
      <div className="top-bar">
        <div className="container top-bar-inner">
          <div className="top-info">
            <a href={`tel:${companyInfo.phoneRaw}`} className="top-info-link">
              <Phone size={14} />
              <span>{companyInfo.phone}</span>
            </a>

            <a href={`mailto:${companyInfo.email}`} className="top-info-link">
              <Mail size={14} />
              <span>{companyInfo.email}</span>
            </a>

            <div className="top-location">
              <MapPin size={13} />
              <span>{companyInfo.address}</span>
            </div>
          </div>

          <div className="top-right-group">
            <span className="badge-qatar">
              <span className="qatar-dot"></span>
              Licensed in Doha, Qatar
            </span>

            <a
              href={companyInfo.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="top-whatsapp-link"
            >
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="main-header">
        <div className="container header-inner">
          {/* Logo */}
          <Link to="/" className="logo" onClick={closeMenu}>
            <div className="logo-shield">
              <span className="logo-letter">G</span>
              <div className="logo-shield-glint"></div>
            </div>

            <div className="logo-text">
              <div className="logo-main">
                <strong>GSC</strong>
                <span className="logo-tag">QATAR</span>
              </div>
              <small>Genting Services & Contracting</small>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className={`desktop-nav ${menuOpen ? "mobile-open" : ""}`}>
            <div className="nav-items">
              {navigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>

            <div className="nav-actions">
              <Link
                to="/request-quote"
                className="quote-button"
                onClick={closeMenu}
              >
                <span>Request a Quote</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Mobile Contact Quick Links */}
            <div className="mobile-contact-bar">
              <a href={`tel:${companyInfo.phoneRaw}`} className="mobile-phone-btn">
                <Phone size={16} />
                <span>Call +974 7025 2552</span>
              </a>
              <a
                href={companyInfo.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-wa-btn"
              >
                <MessageCircle size={16} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </nav>

          {/* Mobile menu hamburger button */}
          <button
            className={`mobile-menu-button ${menuOpen ? "is-active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;