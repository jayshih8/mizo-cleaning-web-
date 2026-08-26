import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import './ImageGallery.css';

const normalizeSources = (images, fallback) => {
  const sourceList = Array.isArray(images)
    ? images.filter((source) => typeof source === 'string' && source.trim())
    : [];

  const uniqueSources = [...new Set(sourceList)];
  if (uniqueSources.length > 0) return uniqueSources;
  return fallback ? [fallback] : [];
};

export default function ImageGallery({
  images,
  fallback = 'images/banner_building.png',
  alt = '圖片',
  className = '',
  style,
  enableLightbox = true,
}) {
  const sources = useMemo(() => normalizeSources(images, fallback), [images, fallback]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (activeIndex >= sources.length) setActiveIndex(0);
  }, [activeIndex, sources.length]);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsLightboxOpen(false);
      if (event.key === 'ArrowLeft' && sources.length > 1) {
        setActiveIndex((current) => (current - 1 + sources.length) % sources.length);
      }
      if (event.key === 'ArrowRight' && sources.length > 1) {
        setActiveIndex((current) => (current + 1) % sources.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, sources.length]);

  const move = (direction, event) => {
    event?.stopPropagation();
    if (sources.length < 2) return;
    setActiveIndex((current) => (current + direction + sources.length) % sources.length);
  };

  const applyFallback = (event) => {
    if (!fallback || event.currentTarget.dataset.fallbackApplied === 'true') return;
    event.currentTarget.dataset.fallbackApplied = 'true';
    event.currentTarget.src = fallback;
  };

  if (sources.length === 0) {
    return <div className={`multi-image-gallery multi-image-gallery-empty ${className}`} style={style}>暫無圖片</div>;
  }

  const currentSource = sources[activeIndex] || sources[0];

  return (
    <>
      <div className={`multi-image-gallery ${className}`} style={style}>
        <button
          type="button"
          className="multi-image-gallery-main"
          onClick={() => enableLightbox && setIsLightboxOpen(true)}
          aria-label={enableLightbox ? `放大查看：${alt}` : alt}
        >
          <img
            src={currentSource}
            alt={`${alt}${sources.length > 1 ? `（${activeIndex + 1}/${sources.length}）` : ''}`}
            className="multi-image-gallery-image"
            loading="lazy"
            onError={applyFallback}
          />
          {enableLightbox && <Expand className="multi-image-gallery-expand" size={18} aria-hidden="true" />}
        </button>

        {sources.length > 1 && (
          <>
            <button
              type="button"
              className="multi-image-gallery-arrow multi-image-gallery-arrow-left"
              onClick={(event) => move(-1, event)}
              aria-label="上一張圖片"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="multi-image-gallery-arrow multi-image-gallery-arrow-right"
              onClick={(event) => move(1, event)}
              aria-label="下一張圖片"
            >
              <ChevronRight size={20} />
            </button>
            <span className="multi-image-gallery-count" aria-live="polite">
              {activeIndex + 1} / {sources.length}
            </span>
          </>
        )}
      </div>

      {isLightboxOpen && (
        <div
          className="multi-image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${alt}圖片瀏覽器`}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            className="multi-image-lightbox-close"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="關閉圖片瀏覽器"
          >
            <X size={24} />
          </button>

          {sources.length > 1 && (
            <button
              type="button"
              className="multi-image-lightbox-arrow multi-image-lightbox-arrow-left"
              onClick={(event) => move(-1, event)}
              aria-label="上一張圖片"
            >
              <ChevronLeft size={30} />
            </button>
          )}

          <div className="multi-image-lightbox-content" onClick={(event) => event.stopPropagation()}>
            <img src={currentSource} alt={alt} onError={applyFallback} />
            {sources.length > 1 && (
              <span className="multi-image-lightbox-count">
                {activeIndex + 1} / {sources.length}
              </span>
            )}
          </div>

          {sources.length > 1 && (
            <button
              type="button"
              className="multi-image-lightbox-arrow multi-image-lightbox-arrow-right"
              onClick={(event) => move(1, event)}
              aria-label="下一張圖片"
            >
              <ChevronRight size={30} />
            </button>
          )}
        </div>
      )}
    </>
  );
}
