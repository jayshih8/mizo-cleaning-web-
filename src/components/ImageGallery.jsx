import React, { useEffect, useMemo, useRef, useState } from 'react';
import SiteImage from './SiteImage';
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
  fallback = '/images/banner_building.png',
  alt = '圖片',
  className = '',
  style,
  enableLightbox = true,
  layout = 'carousel',
  sizes = '(max-width: 640px) 100vw, 600px',
}) {
  const sources = useMemo(() => normalizeSources(images, fallback), [images, fallback]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (activeIndex >= sources.length) setActiveIndex(0);
  }, [activeIndex, sources.length]);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    dialog.showModal();

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft' && sources.length > 1) {
        event.preventDefault();
        setActiveIndex((current) => (current - 1 + sources.length) % sources.length);
      }
      if (event.key === 'ArrowRight' && sources.length > 1) {
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % sources.length);
      }
    };

    dialog.addEventListener('keydown', handleKeyDown);
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      dialog.removeEventListener('keydown', handleKeyDown);
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
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
    event.currentTarget.removeAttribute('srcset');
    event.currentTarget.src = fallback;
  };

  if (sources.length === 0) {
    return <div className={`multi-image-gallery multi-image-gallery-empty ${className}`} style={style}>暫無圖片</div>;
  }

  const currentSource = sources[activeIndex] || sources[0];

  return (
    <>
      {layout === 'grid' ? (
        <div className={`multi-image-collage ${sources.length === 1 ? 'multi-image-collage-single' : ''} ${className}`} style={style}>
          {sources.map((source, index) => (
            <button
              key={source}
              type="button"
              className="multi-image-collage-item"
              onClick={() => {
                if (!enableLightbox) return;
                setActiveIndex(index);
                setIsLightboxOpen(true);
              }}
              aria-label={`放大查看：${alt}，第 ${index + 1} 張`}
            >
              <SiteImage src={source} alt={`${alt}｜現場照片 ${index + 1}`} sizes={sizes} onError={applyFallback} />
              {enableLightbox && <Expand className="multi-image-gallery-expand" size={18} aria-hidden="true" />}
            </button>
          ))}
        </div>
      ) : (
      <div className={`multi-image-gallery ${className}`} style={style}>
        <button
          type="button"
          className="multi-image-gallery-main"
          onClick={() => enableLightbox && setIsLightboxOpen(true)}
          aria-label={enableLightbox ? `放大查看：${alt}` : alt}
        >
          <SiteImage
            src={currentSource}
            alt={`${alt}${sources.length > 1 ? `（${activeIndex + 1}/${sources.length}）` : ''}`}
            className="multi-image-gallery-image"
            sizes={sizes}
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
      )}

      {isLightboxOpen && (
        <dialog
          ref={dialogRef}
          className="multi-image-lightbox"
          aria-label={`${alt}圖片瀏覽器`}
          onCancel={() => setIsLightboxOpen(false)}
          onClose={() => setIsLightboxOpen(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsLightboxOpen(false);
          }}
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
            <SiteImage src={currentSource} alt={alt} sizes="100vw" loading="eager" onError={applyFallback} />
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
        </dialog>
      )}
    </>
  );
}
