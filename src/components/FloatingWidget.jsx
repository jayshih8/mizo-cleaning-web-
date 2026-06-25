import React, { useState, useEffect } from 'react';
import { Phone, ArrowUp, MessageSquare } from 'lucide-react';

export default function FloatingWidget({ companyInfo }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="floating-widget">
      {/* Line Floating Button */}
      <a
        href={companyInfo.lineUrl}
        target="_blank"
        rel="noreferrer"
        className="float-btn float-line"
        title="加 Line 諮詢"
      >
        <MessageSquare size={22} />
      </a>

      {/* Phone Call Floating Button */}
      <a
        href={`tel:${companyInfo.phone}`}
        className="float-btn float-phone"
        title="撥打電話"
      >
        <Phone size={20} />
      </a>

      {/* Back to Top */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="float-btn float-top"
          title="回頂部"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
