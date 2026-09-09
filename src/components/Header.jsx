import React, { useState } from 'react';
import SiteImage from './SiteImage';
import { Menu, X, PhoneCall } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, companyInfo }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'home', name: '首頁' },
    { id: 'about', name: '關於我們' },
    { id: 'services', name: '服務項目' },
    { id: 'process', name: '清潔施工類型' },
    { id: 'credentials', name: '專業證照' },
    { id: 'contact', name: '聯絡我們' },
  ];

  const handleNavClick = (tabId) => {
    if (activeTab === tabId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveTab(tabId);
    }
    setIsOpen(false);
  };

  return (
    <header className="header-wrapper">
      <div className="container">
        <nav className="navbar">
          <a href="/" className="logo" onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; e.preventDefault(); handleNavClick('home'); }}>
            {companyInfo.logoImage ? (
              <SiteImage loading="eager" sizes="42px" src={companyInfo.logoImage} alt={companyInfo.name} className="logo-img-custom" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
            ) : (
              <div className="logo-icon-wrap">{companyInfo.logoIconText || 'TB'}</div>
            )}
            <span>{companyInfo.logoText || '東亞美裝'}</span>
          </a>

          {/* Desktop Nav links */}
          <ul className="nav-links">
            {menuItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.id === 'home' ? '/' : `/${item.id}`}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                  className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; e.preventDefault();
                    handleNavClick(item.id);
                  }}
                >
                  {item.name}
                </a>
              </li>
            ))}

          </ul>

          <a href={`tel:${(companyInfo.phoneFormatted || companyInfo.phone).replace(/[^+\d]/g, '')}`} className="nav-phone">
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
              href={item.id === 'home' ? '/' : `/${item.id}`}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; e.preventDefault();
                handleNavClick(item.id);
              }}
            >
              {item.name}
            </a>
          </li>
        ))}

      </ul>
    </header>
  );
}
