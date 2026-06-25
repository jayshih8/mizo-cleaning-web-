import React from 'react';

export default function About({ aboutData }) {
  return (
    <div className="section-padding animate-fade-in">
      <div className="container">
        {/* Page Title */}
        <div className="section-title-container">
          <h1 className="section-title">{aboutData.title}</h1>
          <p className="section-subtitle">{aboutData.subtitle}</p>
        </div>

        {/* Philosophy / Overview */}
        <div style={{ maxWidth: '850px', margin: '0 auto 5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.25rem', color: 'var(--primary-color)' }}>經營理念</h2>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: '1.8', fontStyle: 'italic', fontWeight: '300' }}>
            「{aboutData.philosophy}」
          </p>
        </div>

        {/* History Timeline */}
        <div style={{ marginBottom: '6rem' }}>
          <div className="section-title-container" style={{ marginBottom: '3.5rem' }}>
            <h2 className="section-title" style={{ fontSize: '1.75rem' }}>品牌發展沿革</h2>
            <p className="section-subtitle">近半世紀的專業傳承與穩健經營</p>
          </div>

          <div className="timeline">
            {aboutData.history && aboutData.history.map((item, index) => (
              <div key={index} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-content">
                  <span className="timeline-year">{item.year}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Training Block (Image 1 mapping) */}
        <div>
          <div className="section-title-container" style={{ marginBottom: '3.5rem' }}>
            <h2 className="section-title" style={{ fontSize: '1.75rem' }}>{aboutData.training.title}</h2>
            <p className="section-subtitle">{aboutData.training.subtitle}</p>
          </div>

          <div className="training-wrapper">
            <div className="grid-2" style={{ gap: 0 }}>
              {/* Image Side */}
              <div 
                className="training-image-wrap" 
                style={{ 
                  backgroundImage: `url(${aboutData.training.image || 'images/training.jpg'})`,
                }}
              />
              
              {/* Content Side */}
              <div className="training-content-wrap">
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                  我們如何維持從業人員的頂尖素質？
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
                  我們深知清潔人員的素質直接關係到客戶的運營品質與財產維護。因此，公司編制專門的督導與培訓課程，定期舉辦在職技能與職業安全教育訓練。
                </p>

                <div className="training-list">
                  {aboutData.training.items && aboutData.training.items.map((item, index) => (
                    <div key={index} className="training-item">
                      <div className="training-number">0{index + 1}</div>
                      <div className="training-info">
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
