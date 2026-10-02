import { useState, useEffect } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { companyInfo } from "../../data/websiteData";
import "./FloatingActions.css";

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 350);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="floating-actions" aria-label="Quick contact and navigation">
      {/* WhatsApp Quick Chat */}
      <a
        href={companyInfo.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-btn whatsapp-btn"
        aria-label="Chat on WhatsApp"
        title="Chat with GSC on WhatsApp"
      >
        <MessageCircle size={24} />
        <span className="floating-label">WhatsApp</span>
      </a>

      {/* Back to Top */}
      {showTop && (
        <button
          onClick={scrollToTop}
          className="floating-btn top-btn"
          aria-label="Scroll to top"
          title="Back to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
