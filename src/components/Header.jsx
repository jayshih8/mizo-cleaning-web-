import React, { useState } from 'react';
import { Menu, X, PhoneCall } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, companyInfo }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'home', name: '首頁' },
    { id: 'about', name: '關於我們' },
    { id: 'services', name: '服務項目' },
    { id: 'credentials', name: '專業證照' },
    { id: 'contact', name: '聯絡我們' },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="header-wrapper">
      <div className="container">
        <nav className="navbar">
          <a href="#home" className="logo" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>
            <div className="logo-icon-wrap">TB</div>
            <span>{companyInfo.logoText || '東亞美裝'}</span>
          </a>

          {/* Desktop Nav links */}
          <ul className="nav-links">
            {menuItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id);
                  }}
                >
                  {item.name}
                </a>
              </li>
            ))}
            {/* Secret entrance to admin in desktop menu, styled discretely */}
            <li>
              <a
                href="#admin"
                className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('admin');
                }}
                style={{ opacity: 0.5, fontSize: '0.9rem' }}
              >
                內容管理
              </a>
            </li>
          </ul>

          <a href={`tel:${companyInfo.phone}`} className="nav-phone">
            <PhoneCall size={18} />
            <span>{companyInfo.phoneFormatted || companyInfo.phone}</span>
          </a>

          <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Nav overlay */}
      <ul className={`mobile-nav ${isOpen ? 'open' : ''}`}>
        {menuItems.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.id);
              }}
            >
              {item.name}
            </a>
          </li>
        ))}
        <li>
          <a
            href="#admin"
            className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('admin');
            }}
          >
            網站內容管理
          </a>
        </li>
      </ul>
    </header>
  );
}
