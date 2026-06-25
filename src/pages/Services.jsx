import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Services({ servicesData }) {
  const [activeServiceId, setActiveServiceId] = useState(servicesData.items[0]?.id || '');

  const activeService = servicesData.items.find(item => item.id === activeServiceId) || servicesData.items[0];

  // Helper to determine service image
  const getServiceImage = (id) => {
    switch (id) {
      case 'building-factory': return '/images/banner_building.png';
      case 'hotel-cleaning': return '/images/hotel.jpg';
      case 'office-cleaning': return '/images/history.jpg';
      case 'hospital-cleaning': return '/images/training.jpg';
      default: return '/images/banner_building.png';
    }
  };

  return (
    <div className="section-padding animate-fade-in">
      <div className="container">
        {/* Page Title */}
        <div className="section-title-container">
          <h1 className="section-title">{servicesData.title}</h1>
          <p className="section-subtitle">{servicesData.subtitle}</p>
        </div>

        {/* Services Tab Nav */}
        <div className="service-tabs-nav">
          {servicesData.items && servicesData.items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveServiceId(item.id)}
              className={`service-tab-btn ${activeServiceId === item.id ? 'active' : ''}`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Service Display Card */}
        {activeService && (
          <div className="service-display-card animate-fade-in">
            <div className="grid-2" style={{ gap: 0, minHeight: '480px' }}>
              {/* Image Side */}
              <div
                className="service-image-side"
                style={{
                  backgroundImage: `url(${getServiceImage(activeService.id)})`,
                  minHeight: '300px'
                }}
              />

              {/* Text / Info Side */}
              <div className="service-info-side">
                <h2>{activeService.title}</h2>
                <p className="service-desc">{activeService.description}</p>
                
                <h4 style={{ fontSize: '1rem', color: 'var(--primary-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  主要服務要點
                </h4>
                <ul className="service-features-list">
                  {activeService.features && activeService.features.map((feat, index) => (
                    <li key={index}>
                      <CheckCircle2 size={18} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Additional information on Fuhua Le Meridien hotel case */}
        <div style={{ marginTop: '5rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '3.5rem', boxShadow: 'var(--shadow-premium)' }}>
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--secondary-color)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                精選合作實績 Case Study
              </span>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--primary-color)', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
                馥華艾美酒店清潔維護專案
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.75', marginBottom: '1.5rem' }}>
                承襲日本大廈維護的嚴苛工法，我們為馥華艾美酒店提供全方位的公共區域保養、地坪晶化、大理石拋光以及精細客房維護服務。
              </p>
              <ul className="service-features-list" style={{ marginBottom: '1.5rem' }}>
                <li style={{ fontSize: '0.95rem' }}>
                  <CheckCircle2 size={16} /> <span>24 小時飯店公共區域動態清潔巡檢</span>
                </li>
                <li style={{ fontSize: '0.95rem' }}>
                  <CheckCircle2 size={16} /> <span>高檔大理石地面硬化與鏡面晶化處理</span>
                </li>
                <li style={{ fontSize: '0.95rem' }}>
                  <CheckCircle2 size={16} /> <span>符合國際頂級飯店衛生的無死角消毒程序</span>
                </li>
              </ul>
            </div>
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', height: '280px' }}>
              <img
                src="/images/hotel.jpg"
                alt="馥華艾美酒店實績"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
