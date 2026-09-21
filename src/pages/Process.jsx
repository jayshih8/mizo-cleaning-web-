import React from 'react';
import ImageGallery from '../components/ImageGallery';

export default function Process({ processData }) {
  if (!processData) return null;

  return (
    <div className="section-padding animate-fade-in">
      <div className="container">
        {/* Page Title */}
        <div className="section-title-container text-center">
          <h1 className="section-title">{processData.title || '清潔施工類型'}</h1>
          <p className="section-subtitle">
            {processData.subtitle || '日式精工 SOP：從防護到完工，每一步驟皆代表我們對品質的極致追求'}
          </p>
        </div>

        {/* Process list */}
        <div className="process-list">
          {processData.steps &&
            processData.steps.map((step, index) => (
              <section key={index} id={`type-${index + 1}`} className="process-step-card" aria-labelledby={`type-title-${index + 1}`}>
                <div className="process-step-content">
                  <span className="process-step-number">{step.stepNumber || `0${index + 1}`}</span>
                  <h2 id={`type-title-${index + 1}`}>{step.title}</h2>
                  <p>{step.description}</p>
                </div>
                <ImageGallery
                  images={step.images}
                  fallback={step.image || '/images/banner_building.png'}
                  alt={step.title || `清潔施工類型 ${index + 1}`}
                  layout="grid"
                  sizes="(max-width: 640px) 46vw, (max-width: 1200px) 30vw, 380px"
                />
              </section>
            ))}
        </div>
      </div>
    </div>
  );
}
