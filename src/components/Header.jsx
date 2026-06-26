import React, { useState } from 'react';
import { Menu, X, PhoneCall } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, companyInfo }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'home', name: '首頁' },
    { id: 'about', name: '關於我們' },
    { id: 'services', name: '服務項目' },
    { id: 'process', name: '施工過程' },
    { id: 'credentials', name: '專業證照' },
    { id: 'contact', name: '聯絡我們' },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <header className="header-wrapper">
      <div className="container">
        <nav className="navbar">
          <a href="/" className="logo" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>
            {companyInfo.logoImage ? (
              <img src={companyInfo.logoImage} alt="Logo" className="logo-img-custom" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
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
              href={item.id === 'home' ? '/' : `/${item.id}`}
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

      </ul>
    </header>
  );
}
