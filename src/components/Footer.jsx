import React from 'react';
import { Phone, Mail, MapPin, Printer, Clock } from 'lucide-react';

export default function Footer({ setActiveTab, companyInfo }) {
  const handleLinkClick = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-wrapper">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h2 className="logo" style={{ color: 'white', marginBottom: '1rem' }}>
              {companyInfo.logoImage ? (
                <img src={companyInfo.logoImage} alt="Logo" className="logo-img-custom" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
              ) : (
                <div className="logo-icon-wrap" style={{ boxShadow: 'none' }}>{companyInfo.logoIconText || 'TB'}</div>
              )}
              <span>{companyInfo.logoText || '東亞美裝'}</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              源於 1979 年中日合資技術合作，致力於大型大樓與工廠的清潔維護，秉持專業、工安與高水準的教育訓練服務各大企業。
            </p>
          </div>

          <div>
            <h3 className="footer-title">快速連結</h3>
            <ul className="footer-links" style={{ listStyle: 'none' }}>
              <li className="footer-link-item">
                <a href="/" onClick={(e) => { e.preventDefault(); handleLinkClick('home'); }}>首頁首覽</a>
              </li>
              <li className="footer-link-item">
                <a href="/about" onClick={(e) => { e.preventDefault(); handleLinkClick('about'); }}>關於我們</a>
              </li>
              <li className="footer-link-item">
                <a href="/services" onClick={(e) => { e.preventDefault(); handleLinkClick('services'); }}>服務項目</a>
              </li>
              <li className="footer-link-item">
                <a href="/credentials" onClick={(e) => { e.preventDefault(); handleLinkClick('credentials'); }}>專業證照</a>
              </li>
              <li className="footer-link-item">
                <a href="/contact" onClick={(e) => { e.preventDefault(); handleLinkClick('contact'); }}>聯絡我們</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="footer-title">聯絡資訊</h3>
            <ul className="footer-info-list">
              <li>
                <Phone size={16} />
                <span>電話：{companyInfo.phoneFormatted || companyInfo.phone}</span>
              </li>
              <li>
                <Printer size={16} />
                <span>傳真：{companyInfo.fax}</span>
              </li>
              <li>
                <Mail size={16} />
                <span>信箱：{companyInfo.email}</span>
              </li>
              <li>
                <MapPin size={16} />
                <span style={{ wordBreak: 'break-all' }}>地址：{companyInfo.address}</span>
              </li>
              <li>
                <Clock size={16} />
                <span>時間：{companyInfo.workHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {companyInfo.name || '美裝公寓大廈管理維護股份有限公司'} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
