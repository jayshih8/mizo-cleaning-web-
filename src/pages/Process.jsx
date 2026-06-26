import React from 'react';

export default function Process({ processData }) {
  if (!processData) return null;

  return (
    <div className="section-padding animate-fade-in">
      <div className="container">
        {/* Page Title */}
        <div className="section-title-container text-center">
          <h1 className="section-title">{processData.title || '施工/清潔服務過程'}</h1>
          <p className="section-subtitle">
            {processData.subtitle || '日式精工 SOP：從防護到完工，每一步驟皆代表我們對品質的極致追求'}
          </p>
        </div>

        {/* Process list */}
        <div className="process-list">
          {processData.steps &&
            processData.steps.map((step, index) => (
              <div key={index} className="process-step-card">
                {/* Image Section */}
                <div className="process-step-image">
                  <img
                    src={step.image}
                    alt={step.title}
                    onError={(e) => {
                      e.target.src = 'images/banner_building.png'; // Fallback if image load fails
                    }}
                  />
                </div>

                {/* Content Section */}
                <div className="process-step-content">
                  <span className="process-step-number">{step.stepNumber || `0${index + 1}`}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
