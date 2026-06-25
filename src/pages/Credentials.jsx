import React from 'react';

export default function Credentials({ credentialsData }) {
  return (
    <div className="section-padding animate-fade-in">
      <div className="container">
        {/* Page Title */}
        <div className="section-title-container">
          <h1 className="section-title">{credentialsData.title}</h1>
          <p className="section-subtitle">{credentialsData.subtitle}</p>
        </div>

        {/* Intro */}
        <p className="credential-intro">
          {credentialsData.intro}
        </p>

        {/* Certificate Cards */}
        <div className="grid-2">
          {credentialsData.certs && credentialsData.certs.map((cert, index) => (
            <div key={index} className="cert-card">
              {/* Photo Area */}
              <div className="cert-img-wrap">
                <img
                  src={cert.image || '/images/association_cert.jpg'}
                  alt={cert.title}
                />
              </div>

              {/* Text Area */}
              <div className="cert-info">
                <h3>{cert.title}</h3>
                <p>{cert.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Informational Callout on Safety Requirements */}
        <div 
          style={{ 
            marginTop: '5rem', 
            backgroundColor: 'rgba(11, 28, 61, 0.02)', 
            borderLeft: '5px solid var(--primary-color)',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            padding: '2.5rem 3rem'
          }}
        >
          <h4 style={{ fontSize: '1.2rem', color: 'var(--primary-color)', marginBottom: '0.75rem' }}>
            🔔 中華民國職業安全衛生法規說明
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7' }}>
            針對第一類事業（如製造業、營造業等高風險行業）勞工 100 人以上之事業單位，依法必須成立直接隸屬雇主之專責職業安全衛生管理單位，並設置職業安全衛生業務主管（甲種）及管理人員。同時需建立符合 CNS 45001 標準之安衛管理系統。本公司派駐之督導主管皆合法取得專責結業證書，為您提供無後顧之憂的合規清潔管理。
          </p>
        </div>
      </div>
    </div>
  );
}
