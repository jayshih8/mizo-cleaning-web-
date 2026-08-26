import React from 'react';
import Home from './Home';
import './MultiImageEnhancements.css';

export default function HomeEnhanced(props) {
  const extraProjects = Array.isArray(props?.homeData?.multiImageProjects)
    ? props.homeData.multiImageProjects.filter((project) => project?.image)
    : [];

  return (
    <>
      <Home {...props} />

      {extraProjects.length > 0 && (
        <section className="section-padding multi-project-showcase" aria-labelledby="more-projects-title">
          <div className="container">
            <div className="section-title-container">
              <h2 className="section-title" id="more-projects-title">更多工程實績</h2>
              <p className="section-subtitle">從日常維護到大型專案，以現場成果呈現每一道施工細節</p>
            </div>

            <div className="multi-project-showcase-grid">
              {extraProjects.map((project, index) => (
                <article className="multi-project-showcase-card" key={`${index}-${project.image.slice(-20)}`}>
                  <div className="multi-project-showcase-image">
                    <img
                      src={project.image}
                      alt={project.title || `工程實績 ${index + 1}`}
                      loading="lazy"
                    />
                    <span>{project.category || '專業清潔維護'}</span>
                  </div>
                  <div className="multi-project-showcase-content">
                    <h3>{project.title || `工程實績 ${index + 1}`}</h3>
                    {project.description && <p>{project.description}</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
