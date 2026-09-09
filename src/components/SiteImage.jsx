import React from 'react';
import content from '../data/siteContent.generated.json';

export default function SiteImage({ src, alt, width, height, sizes = '(max-width: 640px) 100vw, 600px', loading = 'lazy', decoding = 'async', ...props }) {
  const asset = content.seoAssets.images[src];
  return <img {...props} src={src} alt={alt} width={asset?.width || width} height={asset?.height || height}
    srcSet={asset?.srcSet} sizes={asset ? sizes : undefined} loading={loading} decoding={decoding} />;
}
