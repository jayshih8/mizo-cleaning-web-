import React from 'react';
import { Award, Zap, ShieldCheck, BookOpen, ArrowRight, Star, MessageSquare } from 'lucide-react';

export default function Home({ homeData, companyInfo, servicesData, setActiveTab }) {
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
    backgroundImage: `url(${homeData.heroBanner || 'images/banner_building.png'})`,
  };

  // Navigate to specific service
  const handleGoToService = (serviceId) => {
    sessionStorage.setItem('mizo_scroll_to_service', serviceId);
    setActiveTab('services');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

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

      {/* Stats Counter Section (Moved to 2nd block) */}
      <section className="stats-section">
        <div className="container">
          <div className="grid-4">
            {homeData.stats && homeData.stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <h2><AnimatedCounter value={stat.number} /></h2>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
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
                每一個項目、每一處死角，皆有領班現場雙重查核。我們更重視施工現場的職業安全健康，依法設置甲種安衛主管，配備完整勞安護具，提供您零風險、高品質認證的清潔管理。
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
                  backgroundImage: "url('images/hotel.jpg')",
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

      {/* NEW: Services Overview Section */}
      {servicesData && servicesData.items && servicesData.items.length > 0 && (
        <section className="section-padding bg-light" id="services-overview">
          <div className="container">
            <div className="section-title-container">
              <h2 className="section-title">專業清潔服務範疇</h2>
              <p className="section-subtitle">引進日式高標準工法，滿足您對極致整潔與勞安規範的需求</p>
            </div>
            
            <div className="grid-3" style={{ gap: '2rem' }}>
              {servicesData.items.slice(0, 3).map((item) => (
                <div key={item.id} className="home-service-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid #f1f5f9' }}>
                  <div style={{ height: '200px', backgroundImage: `url(${getServiceImage(item)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div style={{ padding: '2rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--primary-color)' }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', minHeight: '80px', marginBottom: '1.5rem' }}>
                      {item.description && item.description.length > 80 ? `${item.description.substring(0, 80)}...` : item.description}
                    </p>
                    <button onClick={() => handleGoToService(item.id)} className="btn btn-outline" style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem 1rem', marginTop: 'auto' }}>
                      <span>了解詳細細項</span>
                      <ArrowRight size={14} style={{ marginLeft: '0.25rem' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button onClick={() => setActiveTab('services')} className="btn btn-primary" style={{ padding: '0.75rem 2.5rem' }}>
                查看所有服務項目
              </button>
            </div>
          </div>
        </section>
      )}

      {/* NEW: Recent Cases Showcase Section */}
      {homeData.cases && homeData.cases.length > 0 && (
        <section className="section-padding" id="cases" style={{ backgroundColor: 'white' }}>
          <div className="container">
            <div className="section-title-container">
              <h2 className="section-title">近期施工實績</h2>
              <p className="section-subtitle">累積各大商辦大樓、五星級飯店與科技廠房的標竿清潔案例</p>
            </div>
            
            <div className="grid-3" style={{ gap: '2rem' }}>
              {homeData.cases.map((c, idx) => (
                <div key={idx} className="case-card" style={{ display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', backgroundColor: '#fff', border: '1px solid #e2e8f0', transition: 'transform 0.3s ease' }}>
                  <div className="case-image-wrapper" style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={c.image || 'images/banner_building.png'}
                      alt={c.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    />
                    <span style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'var(--primary-color)', color: '#fff', fontSize: '0.75rem', fontWeight: '700', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', backdropFilter: 'blur(4px)', boxShadow: 'var(--shadow-sm)' }}>
                      {c.category}
                    </span>
                  </div>
                  <div style={{ padding: '1.75rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-color)', marginBottom: '0.75rem', fontWeight: '700' }}>
                      {c.title}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
                      {c.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW: Client Testimonials Section */}
      {homeData.testimonials && homeData.testimonials.length > 0 && (
        <section className="section-padding" id="testimonials" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
          <div className="container">
            <div className="section-title-container">
              <h2 className="section-title">客戶口碑好評</h2>
              <p className="section-subtitle">企業經理、廠房主管與管委會委員對美裝日規清潔服務的真實評價</p>
            </div>
            
            <div className="grid-3" style={{ gap: '2rem' }}>
              {homeData.testimonials.map((t, idx) => (
                <div key={idx} className="testimonial-card animate-fade-in" style={{ backgroundColor: 'white', padding: '2.25rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-premium)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', border: '1px solid rgba(11,28,61,0.03)' }}>
                  
                  {/* Quote icon markup */}
                  <div style={{ position: 'absolute', top: '1.5rem', right: '2rem', opacity: 0.08, color: 'var(--primary-color)' }}>
                    <MessageSquare size={48} />
                  </div>
                  
                  <div>
                    {/* Stars */}
                    <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '1.25rem', color: '#f59e0b' }}>
                      <Star size={16} fill="#f59e0b" />
                      <Star size={16} fill="#f59e0b" />
                      <Star size={16} fill="#f59e0b" />
                      <Star size={16} fill="#f59e0b" />
                      <Star size={16} fill="#f59e0b" />
                    </div>
                    
                    {/* Feedback content */}
                    <p style={{ fontStyle: 'normal', color: 'var(--text-body)', fontSize: '0.925rem', lineHeight: '1.8', marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>
                      「{t.feedback}」
                    </p>
                  </div>
                  
                  {/* User info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: 'auto' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(11,28,61,0.05)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContext: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '700' }}>
                      {t.name[0] || '客'}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: '700' }}>
                        {t.name} <span style={{ fontWeight: 'normal', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.role}</span>
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--secondary-color)', fontWeight: '600' }}>
                        {t.company}
                      </p>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


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

// Custom animated count-up component with Viewport Intersection Observer
function AnimatedCounter({ value }) {
  const [count, setCount] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  const elementRef = React.useRef(null);

  React.useEffect(() => {
    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!isVisible) return;

    const numberStr = value.replace(/[^0-9]/g, '');
    const target = parseInt(numberStr, 10);
    
    if (isNaN(target)) {
      setCount(value);
      return;
    }

    const duration = 2000; // Animation duration in ms (slower)
    const frameRate = 1000 / 60; // 60 FPS
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // easeOutExpo formula
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentCount = Math.round(easeProgress * target);

      setCount(currentCount);

      if (frame >= totalFrames) {
        clearInterval(timer);
        setCount(target);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [value, isVisible]);

  // If not yet visible, render starting at 0
  const numberStr = value.replace(/[^0-9]/g, '');
  const target = parseInt(numberStr, 10);
  if (isNaN(target)) {
    return <span>{value}</span>;
  }

  const isPercent = value.includes('%');
  const isPlus = value.includes('+');
  const isH = value.includes('H') || value.includes('h');
  const formattedCount = isVisible ? (value.includes(',') ? count.toLocaleString('en-US') : count) : 0;

  return (
    <span ref={elementRef}>
      {formattedCount}
      {isPercent && '%'}
      {isPlus && '+'}
      {isH && 'H'}
    </span>
  );
}
