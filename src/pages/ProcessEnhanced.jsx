import React from 'react';
import './MultiImageEnhancements.css';

const uniqueImages = (images) => {
  const seen = new Set();
  return images.filter((image) => {
    if (!image || seen.has(image)) return false;
    seen.add(image);
    return true;
  });
};

const getStepImages = (step) => {
  const images = uniqueImages([
    step?.image,
    ...(Array.isArray(step?.images) ? step.images : []),
  ]);
  return images.length ? images : ['images/banner_building.png'];
};

export default function ProcessEnhanced({ processData }) {
  if (!processData) return null;

  return (
    <div className="section-padding animate-fade-in">
      <div className="container">
        <div className="section-title-container text-center">
          <h1 className="section-title">{processData.title || '施工/清潔服務過程'}</h1>
          <p className="section-subtitle">
            {processData.subtitle || '日式精工 SOP：從防護到完工，每一步驟皆代表我們對品質的極致追求'}
          </p>
        </div>

        <div className="process-list">
          {processData.steps && processData.steps.map((step, index) => {
            const images = getStepImages(step);

            return (
              <div key={index} className="process-step-card">
                <div className={`process-step-gallery ${images.length === 1 ? 'is-single' : ''}`}>
                  {images.map((image, imageIndex) => (
                    <img
                      key={`${index}-${imageIndex}-${image.slice(-16)}`}
                      src={image}
                      alt={`${step.title || `施工步驟 ${index + 1}`} 現場照片 ${imageIndex + 1}`}
                      loading="lazy"
                      onError={(event) => {
                        if (event.currentTarget.dataset.fallbackApplied) return;
                        event.currentTarget.dataset.fallbackApplied = 'true';
                        event.currentTarget.src = 'images/banner_building.png';
                      }}
                    />
                  ))}
                </div>

                <div className="process-step-content">
                  <span className="process-step-number">{step.stepNumber || `0${index + 1}`}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
