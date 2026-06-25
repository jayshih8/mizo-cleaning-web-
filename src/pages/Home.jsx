import React from 'react';
import { Award, Zap, ShieldCheck, BookOpen, ArrowRight } from 'lucide-react';

export default function Home({ homeData, companyInfo, setActiveTab }) {
  const getIcon = (index) => {
    switch (index) {
      case 0: return <Award size={24} />;
      case 1: return <Zap size={24} />;
      case 2: return <ShieldCheck size={24} />;
      case 3: return <BookOpen size={24} />;
      default: return <Award size={24} />;
    }
  };

  const bannerStyle = {
    backgroundImage: `url(${homeData.heroBanner || '/images/banner_building.png'})`,
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Banner Section */}
      <section className="hero" style={bannerStyle}>
        <div className="container">
          <div className="hero-content">
            <h1 className="animate-fade-in-up">{homeData.heroTitle}</h1>
            <p className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              {homeData.heroSubtitle}
            </p>
            <button
              onClick={() => setActiveTab('contact')}
              className="btn btn-secondary animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <span>{homeData.ctaText || '免費預約現場評估'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid Overlay */}
      <section className="container features-container">
        <div className="grid-4">
          {homeData.features && homeData.features.map((feat, index) => (
            <div key={index} className="feature-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="feature-icon-wrap">
                {getIcon(index)}
              </div>
              <h3>{feat.title}</h3>
              <p>{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Corporate Advantages Section */}
      <section className="section-padding">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <div className="section-title-container" style={{ textAlign: 'left', marginBottom: '2rem' }}>
                <h2 className="section-title" style={{ fontSize: '2rem' }}>日式標準，頂規施工</h2>
                <p className="section-subtitle" style={{ textAlign: 'left' }}>
                  傳承日式細緻管理精神，追求極淨與安全
                </p>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.8' }}>
                我們與日本東京美裝興業株式會社開展長期的技術合作，引進精密清潔維護工法。不論是挑高辦公室、精密半導體廠房，或是對衛生要求極其嚴苛的綜合醫院，我們均依循日式細步 SOP 清潔流程。
              </p>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.8' }}>
                每一個項目、每一處死角，皆有領班現場雙重查核。我們更重視施工現場的職業安全健康，依法設置甲種安衛主管，配備完整勞安護具，提供您零風險、高品質的清潔管理。
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setActiveTab('about')} className="btn btn-primary">關於我們</button>
                <button onClick={() => setActiveTab('services')} className="btn btn-outline">了解服務</button>
              </div>
            </div>

            {/* Visual Collage Card */}
            <div style={{ position: 'relative', height: '420px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-premium)' }}>
              <div
                style={{
                  backgroundImage: "url('/images/hotel.jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  width: '100%',
                  height: '100%',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '2rem',
                  left: '2rem',
                  right: '2rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--secondary-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>核心工程實績</span>
                <h4 style={{ margin: '0.25rem 0 0.5rem', fontSize: '1.15rem' }}>馥華艾美酒店清潔維護</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>頂級奢華酒店公共區域與客房長期日常維護實績</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="stats-section">
        <div className="container">
          <div className="grid-4">
            {homeData.stats && homeData.stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <h2>{stat.number}</h2>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic CTA Banner */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-white)', borderBottom: '1px solid #f1f5f9' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '1.25rem' }}>準備好升級您的空間環境了嗎？</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.7' }}>
            我們提供台北市、新北市各大企業廠辦免費現場會勘與完整評估估價服務。上班時間撥打專線，將有專業工程督導親自為您說明。
          </p>
          <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={`tel:${companyInfo.phone}`} className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
              撥打專線：{companyInfo.phoneFormatted || companyInfo.phone}
            </a>
            <a href={companyInfo.lineUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.85rem 2rem' }}>
              加 LINE 諮詢 (ID: {companyInfo.lineId})
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
