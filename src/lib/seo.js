import settings from '../data/seoConfig.json' with { type: 'json' };

export const SITE_URL = settings.siteUrl.replace(/\/$/, '');
export const PUBLIC_PAGES = [
  { id: 'home', path: '/', name: '首頁' },
  { id: 'about', path: '/about', name: '關於我們' },
  { id: 'services', path: '/services', name: '服務項目' },
  { id: 'process', path: '/process', name: '清潔施工類型' },
  { id: 'credentials', path: '/credentials', name: '專業證照' },
  { id: 'contact', path: '/contact', name: '聯絡我們' },
];

export function pageFromPath(pathname) {
  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  if (path === '/admin' || path === '/admin-portal') return { id: 'admin', path: '/admin-portal', name: '管理後台' };
  if (path === '/home' || path === '/index.html') return PUBLIC_PAGES[0];
  return PUBLIC_PAGES.find(page => page.path === path) || { id: 'not-found', path: '/404', name: '找不到頁面' };
}

export function absoluteUrl(value) {
  if (!value || typeof value !== 'string' || value.startsWith('data:')) return undefined;
  try {
    const url = new URL(value, SITE_URL + '/');
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined;
  } catch { return undefined; }
}

export const primaryPhone = company => company.phoneFormatted || company.phone || '';
export function telephoneUrl(value) {
  return `tel:${String(value || '').replace(/[^+\d]/g, '')}`;
}

export function getPageSeo(page, config) {
  const noindex = !settings.pages[page.id];
  const metadata = settings.pages[page.id] || {
    title: `${page.name}｜${settings.siteName}`,
    description: page.id === 'admin' ? '美裝網站內容管理後台。' : '此頁面不存在，請返回首頁或查看清潔服務項目。',
  };
  return {
    ...metadata,
    canonical: noindex ? null : SITE_URL + page.path,
    robots: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    image: absoluteUrl(config.seoAssets?.socialImage || config.home?.heroBanner || '/images/banner_building.png'),
    imageAlt: `${settings.siteName}大樓與廠辦清潔維護`,
    siteName: settings.siteName,
    locale: settings.locale,
    language: settings.language,
    noindex,
  };
}

function businessNode(config) {
  const c = config.company;
  const address = c.address || '';
  const parts = address.match(/^(.{2,3}[市縣])(.{1,4}[區鄉鎮市])(.+)$/);
  const social = [c.facebookUrl, c.lineUrl].map(absoluteUrl).filter(url => {
    if (!url) return false;
    const parsed = new URL(url);
    return parsed.pathname !== '/' && parsed.pathname !== '';
  });
  const node = {
    '@type': 'LocalBusiness', '@id': SITE_URL + '/#business',
    name: c.name, url: SITE_URL + '/',
    description: settings.pages.home.description,
    logo: absoluteUrl(c.logoImage),
    image: absoluteUrl(config.seoAssets?.socialImage || config.home.heroBanner),
    telephone: primaryPhone(c), email: c.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: parts ? parts[3] : address,
      ...(parts ? { addressRegion: parts[1], addressLocality: parts[2] } : {}),
      addressCountry: 'TW',
    },
    areaServed: settings.areaServed.map(name => ({ '@type': 'City', name })),
    contactPoint: [
      { '@type': 'ContactPoint', telephone: primaryPhone(c), contactType: '清潔服務諮詢', availableLanguage: ['zh-Hant'] },
      ...(c.phone && c.phone !== primaryPhone(c) ? [{ '@type': 'ContactPoint', telephone: c.phone, contactType: '公司總機', availableLanguage: ['zh-Hant'] }] : []),
    ],
    ...(social.length ? { sameAs: social } : {}),
  };
  // Only publish machine-readable hours when they match the visible CMS value.
  const hours = c.workHours?.match(/週一至週五\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
  if (hours) node.openingHoursSpecification = [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: hours[1], closes: hours[2] }];
  return node;
}

export function getStructuredData(page, config) {
  const seo = getPageSeo(page, config);
  if (seo.noindex) return null;
  const business = businessNode(config);
  const websiteId = SITE_URL + '/#website';
  const webpageId = seo.canonical + '#webpage';
  const pageNode = {
    '@type': page.id === 'about' ? 'AboutPage' : page.id === 'contact' ? 'ContactPage' : ['services', 'process', 'credentials'].includes(page.id) ? 'CollectionPage' : 'WebPage',
    '@id': webpageId, url: seo.canonical, name: seo.title, description: seo.description,
    inLanguage: seo.language, isPartOf: { '@id': websiteId }, about: { '@id': business['@id'] },
    primaryImageOfPage: { '@type': 'ImageObject', url: seo.image },
  };
  const graph = [business, {
    '@type': 'WebSite', '@id': websiteId, url: SITE_URL + '/', name: settings.siteName,
    alternateName: [config.company.shortName, config.company.name].filter(Boolean),
    inLanguage: seo.language, publisher: { '@id': business['@id'] },
  }, pageNode];
  if (page.id !== 'home') {
    const breadcrumbId = seo.canonical + '#breadcrumb';
    pageNode.breadcrumb = { '@id': breadcrumbId };
    graph.push({ '@type': 'BreadcrumbList', '@id': breadcrumbId, itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: SITE_URL + '/' },
      { '@type': 'ListItem', position: 2, name: page.name, item: seo.canonical },
    ] });
  }
  if (page.id === 'services') {
    const services = config.services.items.map(item => ({
      '@type': 'Service', '@id': `${SITE_URL}/services#${item.id}`,
      url: `${SITE_URL}/services#${item.id}`, name: item.title, serviceType: item.title,
      description: item.description, provider: { '@id': business['@id'] },
      areaServed: business.areaServed, image: absoluteUrl(item.image),
    }));
    const catalogId = seo.canonical + '#service-catalog';
    business.hasOfferCatalog = { '@id': catalogId };
    pageNode.mainEntity = { '@id': catalogId };
    graph.push(...services, { '@type': 'OfferCatalog', '@id': catalogId, name: config.services.title,
      itemListElement: services.map(service => ({ '@type': 'Offer', itemOffered: { '@id': service['@id'] } })),
    });
  }
  if (page.id === 'process') {
    const listId = seo.canonical + '#types';
    pageNode.mainEntity = { '@id': listId };
    graph.push({ '@type': 'ItemList', '@id': listId, name: config.process.title,
      itemListElement: config.process.steps.map((step, index) => ({
        '@type': 'ListItem', position: index + 1,
        item: { '@type': 'Thing', name: step.title, description: step.description, url: `${seo.canonical}#type-${index + 1}`, image: absoluteUrl(step.image) },
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export const serializeJsonLd = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

export function renderSeoHead(page, config) {
  const seo = getPageSeo(page, config);
  const meta = (key, value, property = false) => `<meta ${property ? 'property' : 'name'}="${key}" content="${escapeHtml(value)}" />`;
  const tags = [
    `<title>${escapeHtml(seo.title)}</title>`, meta('description', seo.description), meta('robots', seo.robots),
    meta('og:title', seo.title, true), meta('og:description', seo.description, true), meta('og:type', 'website', true),
    meta('og:site_name', seo.siteName, true), meta('og:locale', seo.locale, true),
    meta('og:image', seo.image, true), meta('og:image:alt', seo.imageAlt, true),
    meta('og:image:width', '1200', true), meta('og:image:height', '630', true),
    meta('twitter:card', 'summary_large_image'), meta('twitter:title', seo.title),
    meta('twitter:description', seo.description), meta('twitter:image', seo.image), meta('twitter:image:alt', seo.imageAlt),
    `<link rel="icon" href="${escapeHtml(config.seoAssets?.favicon || '/favicon.svg')}" />`,
  ];
  if (seo.canonical) tags.push(`<link rel="canonical" href="${escapeHtml(seo.canonical)}" />`, meta('og:url', seo.canonical, true));
  if (config.company.googleVerification) tags.push(meta('google-site-verification', config.company.googleVerification));
  const graph = getStructuredData(page, config);
  if (graph) tags.push(`<script id="site-jsonld" type="application/ld+json">${serializeJsonLd(graph)}</script>`);
  if (page.id === 'home') tags.push(`<link rel="preload" as="image" href="${escapeHtml(config.home.heroBanner)}" fetchpriority="high" />`);
  return tags.join('\n    ');
}

export function applyPageSeo(page, config) {
  const seo = getPageSeo(page, config);
  document.title = seo.title;
  const setMeta = (attribute, key, value) => {
    const selector = `meta[${attribute}="${key}"]`;
    let node = document.head.querySelector(selector);
    if (!value) { node?.remove(); return; }
    if (!node) { node = document.createElement('meta'); node.setAttribute(attribute, key); document.head.append(node); }
    node.content = value;
  };
  for (const [key, value] of Object.entries({ description: seo.description, robots: seo.robots, 'twitter:card': 'summary_large_image', 'twitter:title': seo.title, 'twitter:description': seo.description, 'twitter:image': seo.image, 'twitter:image:alt': seo.imageAlt, 'google-site-verification': config.company.googleVerification })) setMeta('name', key, value);
  for (const [key, value] of Object.entries({ title: seo.title, description: seo.description, url: seo.canonical, type: 'website', site_name: seo.siteName, locale: seo.locale, image: seo.image, 'image:alt': seo.imageAlt, 'image:width': '1200', 'image:height': '630' })) setMeta('property', `og:${key}`, value);
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (seo.canonical) {
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
    canonical.href = seo.canonical;
  } else canonical?.remove();
  let script = document.getElementById('site-jsonld');
  const graph = getStructuredData(page, config);
  if (graph) {
    if (!script) { script = document.createElement('script'); script.type = 'application/ld+json'; script.id = 'site-jsonld'; document.head.append(script); }
    script.textContent = serializeJsonLd(graph);
  } else script?.remove();
}
