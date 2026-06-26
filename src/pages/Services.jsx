import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Services({ servicesData }) {
  const [activeServiceId, setActiveServiceId] = useState(servicesData.items[0]?.id || '');

  useEffect(() => {
    const scrollToId = sessionStorage.getItem('mizo_scroll_to_service');
    if (scrollToId) {
      sessionStorage.removeItem('mizo_scroll_to_service');
      const exists = servicesData.items.some(item => item.id === scrollToId);
      if (exists) {
        setActiveServiceId(scrollToId);
        setTimeout(() => {
          const element = document.querySelector('.service-tabs-nav');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      }
    }
  }, [servicesData]);

  const activeService = servicesData.items.find(item => item.id === activeServiceId) || servicesData.items[0];

  const featuredIds = servicesData.featuredServiceIds || (servicesData.featuredServiceId ? [servicesData.featuredServiceId] : ['hotel-cleaning']);
  const featuredServices = servicesData.items.filter(item => featuredIds.includes(item.id));
  const displayFeatured = featuredServices.length > 0 ? featuredServices : [servicesData.items[0]];

  // Helper to determine service image
  const getServiceImage = (service) => {
    if (!service) return 'images/banner_building.png';
    if (service.image) return service.image;
    switch (service.id) {
      case 'building-factory': return 'images/banner_building.png';
      case 'hotel-cleaning': return 'images/hotel.jpg';
      case 'office-cleaning': return 'images/history.jpg';
      case 'hospital-cleaning': return 'images/training.jpg';
      default: return 'images/banner_building.png';
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
              className={`service-tab-btn ${activeServiceId === item.id || (activeServiceId === '' && servicesData.items[0]?.id === item.id) ? 'active' : ''}`}
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
                  backgroundImage: `url(${getServiceImage(activeService)})`,
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


      </div>
    </div>

    {/* NEW: Featured Case Studies Section with distinct background and section title */}
    {displayFeatured && displayFeatured.length > 0 && (
      <section className="section-padding bg-light" style={{ borderTop: '1px solid #e2e8f0', padding: '5rem 0' }}>
        <div className="container">
          <div className="section-title-container" style={{ marginBottom: '4.5rem' }}>
            <h2 className="section-title" style={{ fontSize: '2rem' }}>精選合作實績 Case Studies</h2>
            <p className="section-subtitle">為大型商辦、觀光飯店與工廠提供的高標準清潔維護成果指標</p>
          </div>

          {displayFeatured.map((featuredService, idx) => (
            <div key={featuredService.id} style={{ marginTop: idx === 0 ? '0' : '4rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '3.5rem', boxShadow: 'var(--shadow-premium)', border: '1px solid rgba(11,28,61,0.02)' }}>
              <div className="grid-2" style={{ alignItems: 'center', direction: idx % 2 === 1 ? 'rtl' : 'ltr' }}>
                <div style={{ direction: 'ltr' }}>
                  <h2 style={{ fontSize: '1.75rem', color: 'var(--primary-color)', marginTop: '0', marginBottom: '1.25rem' }}>
                    {featuredService.title}專案
                  </h2>
                  <p style={{ color: 'var(--text-muted)', lineHeight: '1.75', marginBottom: '1.5rem' }}>
                    {featuredService.description}
                  </p>
                  <ul className="service-features-list" style={{ marginBottom: '1.5rem' }}>
                    {featuredService.features && featuredService.features.map((feat, index) => (
                      <li key={index} style={{ fontSize: '0.95rem' }}>
                        <CheckCircle2 size={16} /> <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', height: '280px' }}>
                  <img
                    src={getServiceImage(featuredService)}
                    alt={featuredService.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )}
  );
}
